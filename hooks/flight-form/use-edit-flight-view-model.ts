import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useFlightsStore } from "@/lib/store/flights-store";
import { deleteFlight } from "@/lib/server/flights/flights";
import { OperatorFlight } from "@/lib/types/flight";
import { toast } from "sonner";
import { format } from "date-fns";
import { invalidateAndRefetchQueries } from "@/lib/utils";
import {
    formatFlightPrice,
    formatFlightDateTime,
    flightValidationRules,
    getConditionalValidationRules,
} from "./use-flight-form-helpers";

interface FlightFormData {
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_date: string;
    departure_time: string;
    estimated_duration: string;
    one_way_price_usd: number;
    round_trip_price_usd: number;
    status: "Active" | "Inactive";
    is_empty_leg: boolean;
    route_type: "Charter" | "Seats";
}

interface UseEditFlightViewModelProps {
    flight: OperatorFlight;
    isOpen: boolean;
    onClose: () => void;
}

export function useEditFlightViewModel({
    flight,
    isOpen,
    onClose,
}: UseEditFlightViewModelProps) {
    const { token, operator } = useAuth(true);
    const queryClient = useQueryClient();

    // Zustand stores
    const updateFlightInStore = useFlightsStore((state) => state.updateFlight);
    const removeFlightFromStore = useFlightsStore((state) => state.removeFlight);

    // Local state
    const [formattedOneWayPrice, setFormattedOneWayPrice] = useState<string>("");
    const [formattedRoundTripPrice, setFormattedRoundTripPrice] =
        useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form setup
    const form = useForm<FlightFormData>();
    const {
        register,
        handleSubmit: rhfHandleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = form;

    const watchedValues = watch();
    const oneWayPrice = watch("one_way_price_usd");
    const roundTripPrice = watch("round_trip_price_usd");
    const routeType = watch("route_type");

    // Initialize form with flight data when modal opens
    useEffect(() => {
        if (flight && isOpen) {
            const departureDate = flight.departure_date
                ? new Date(flight.departure_date)
                : null;

            reset({
                aircraft_id: flight.aircraft.id,
                departure_airport_id: flight.departure_airport.id,
                arrival_airport_id: flight.arrival_airport.id,
                departure_date: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
                departure_time: departureDate ? format(departureDate, "HH:mm") : "12:00",
                estimated_duration: flight.estimated_duration || "",
                status:
                    flight.status === "Active" || flight.status === "Inactive"
                        ? flight.status
                        : "Active",
                one_way_price_usd: flight.one_way_price_usd || 0,
                round_trip_price_usd: flight.round_trip_price_usd || 0,
                is_empty_leg: flight.is_empty_leg === true,
                route_type: flight.route_type || "Charter",
            });

            setFormattedOneWayPrice(formatFlightPrice(flight.one_way_price_usd || 0));
            setFormattedRoundTripPrice(
                formatFlightPrice(flight.round_trip_price_usd || 0)
            );
        }
    }, [flight, isOpen, reset]);

    // Format one way price with commas for display
    useEffect(() => {
        if (oneWayPrice !== undefined && oneWayPrice !== null) {
            setFormattedOneWayPrice(formatFlightPrice(oneWayPrice));
        }
    }, [oneWayPrice]);

    // Format round trip price with commas for display
    useEffect(() => {
        if (roundTripPrice !== undefined && roundTripPrice !== null) {
            setFormattedRoundTripPrice(formatFlightPrice(roundTripPrice));
        }
    }, [roundTripPrice]);

    // Update flight mutation
    const updateMutation = useMutation({
        mutationFn: async (data: FlightFormData) => {
            // Prepare departure date based on route type
            let departureDateTime = "";
            if (data.route_type === "Seats" && data.departure_date) {
                departureDateTime = formatFlightDateTime(
                    data.departure_date,
                    data.departure_time
                );
            }

            const transformedData = {
                aircraft_id: data.aircraft_id,
                departure_airport_id: data.departure_airport_id,
                arrival_airport_id: data.arrival_airport_id,
                departure_date: departureDateTime,
                estimated_duration: String(data.estimated_duration),
                status: data.status,
                one_way_price_usd: data.one_way_price_usd,
                round_trip_price_usd: data.round_trip_price_usd,
                is_empty_leg: data.is_empty_leg ? "true" : "false",
                route_type: data.route_type,
                operator_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flight?.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(transformedData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    throw { errors: errorData.errors };
                }
                throw new Error(response.statusText);
            }

            return response.json();
        },
        onSuccess: async (responseData) => {
            // Update Zustand store optimistically
            if (flight?.id && responseData?.data) {
                updateFlightInStore(flight.id, responseData.data);
            }

            // Invalidate and refetch queries
            await invalidateAndRefetchQueries(queryClient, [
                "flights",
                "flightWidgets",
            ]);

            toast.success("Flight updated successfully");
            onClose();
        },
        onError: (error: any) => {
            console.error("Failed to update flight:", error);
            if (error.errors) {
                // Handle validation errors from server
                Object.entries(error.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                });
            } else {
                toast.error("Failed to update flight. Please try again.");
            }
        },
    });

    // Delete flight mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!flight?.id || !operator?.id || !token) {
                throw new Error("Missing required data for flight deletion");
            }

            const { data, error } = await deleteFlight(flight.id, token, operator.id);

            if (error) {
                throw new Error(error);
            }

            return data;
        },
        onSuccess: async () => {
            // Remove from Zustand store
            if (flight?.id) {
                removeFlightFromStore(flight.id);
            }

            // Invalidate and refetch queries
            invalidateAndRefetchQueries(queryClient, [
                "flights",
                "flightWidgets",
            ]);

            setIsDeleting(false);
            setShowDeleteConfirm(false);
            onClose();
            toast.success("Flight deleted successfully!");
        },
        onError: (error: any) => {
            setIsDeleting(false);
            console.error("Failed to delete flight:", error);
            toast.error(
                error.message || "Failed to delete flight. Please try again."
            );
        },
    });

    // Handlers
    const handleSubmit = rhfHandleSubmit((data) => {
        updateMutation.mutate(data);
    });

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        setIsDeleting(true);
        deleteMutation.mutate();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handlePriceChange = (
        field: "one_way_price_usd" | "round_trip_price_usd",
        value: string
    ) => {
        const numericValue = value.replace(/[^0-9.]/g, "");
        const parsedValue = parseFloat(numericValue);
        setValue(field, isNaN(parsedValue) ? 0 : parsedValue);

        // Update formatted display
        if (field === "one_way_price_usd") {
            setFormattedOneWayPrice(numericValue);
        } else {
            setFormattedRoundTripPrice(numericValue);
        }
    };

    const handlePriceBlur = (field: "one_way_price_usd" | "round_trip_price_usd") => {
        const value = field === "one_way_price_usd" ? oneWayPrice : roundTripPrice;
        if (value !== undefined && value !== null) {
            if (field === "one_way_price_usd") {
                setFormattedOneWayPrice(formatFlightPrice(value));
            } else {
                setFormattedRoundTripPrice(formatFlightPrice(value));
            }
        }
    };

    return {
        // Form
        form,
        register,
        control,
        errors,
        watchedValues,
        setValue,

        // Computed properties
        formattedOneWayPrice,
        formattedRoundTripPrice,
        routeType,

        // Actions
        handleSubmit,
        handleDelete,
        handleConfirmDelete,
        handleClose,
        handlePriceChange,
        handlePriceBlur,

        // State
        isSubmitting,
        isDeleting,
        showDeleteConfirm,
        setShowDeleteConfirm,

        // Validation rules
        validationRules: flightValidationRules,
        conditionalValidationRules: getConditionalValidationRules(routeType),
    };
}

