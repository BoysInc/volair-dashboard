import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useFlightsStore } from "@/lib/store/flights-store";
import { useAircraftsStore } from "@/lib/store/aircrafts-store";
import { toast } from "sonner";
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

interface UseCreateFlightViewModelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function useCreateFlightViewModel({
    isOpen,
    onClose,
}: UseCreateFlightViewModelProps) {
    const { token } = useAuth(true);
    const operator = useAuthStore((state) => state.operator);
    const queryClient = useQueryClient();

    // Zustand stores
    const addFlightToStore = useFlightsStore((state) => state.addFlight);

    // Local state
    const [formattedOneWayPrice, setFormattedOneWayPrice] = useState<string>("");
    const [formattedRoundTripPrice, setFormattedRoundTripPrice] =
        useState<string>("");

    // Form setup with default values
    const form = useForm<FlightFormData>({
        defaultValues: {
            aircraft_id: "",
            departure_airport_id: "",
            arrival_airport_id: "",
            estimated_duration: "",
            one_way_price_usd: 0,
            round_trip_price_usd: 0,
            status: "Active",
            departure_date: "",
            departure_time: "12:00",
            is_empty_leg: false,
            route_type: "Charter",
        },
    });

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

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setFormattedOneWayPrice("");
            setFormattedRoundTripPrice("");
        }
    }, [isOpen, reset]);

    // Format one way price with commas for display
    useEffect(() => {
        if (oneWayPrice !== undefined && oneWayPrice !== null) {
            setFormattedOneWayPrice(
                oneWayPrice > 0 ? formatFlightPrice(oneWayPrice) : ""
            );
        }
    }, [oneWayPrice]);

    // Format round trip price with commas for display
    useEffect(() => {
        if (roundTripPrice !== undefined && roundTripPrice !== null) {
            setFormattedRoundTripPrice(
                roundTripPrice > 0 ? formatFlightPrice(roundTripPrice) : ""
            );
        }
    }, [roundTripPrice]);

    // Create flight mutation
    const createMutation = useMutation({
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
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights`,
                {
                    method: "POST",
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
            // Add to Zustand store optimistically
            if (responseData?.data) {
                addFlightToStore(responseData.data);
            }

            // Invalidate and refetch queries
            await invalidateAndRefetchQueries(queryClient, [
                "flights",
                "flightWidgets",
            ]);

            toast.success("Flight created successfully");
            onClose();
        },
        onError: (error: any) => {
            console.error("Failed to create flight:", error);
            if (error.errors) {
                // Handle validation errors from server
                Object.entries(error.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                });
            } else {
                toast.error("Failed to create flight. Please try again.");
            }
        },
    });

    // Handlers
    const handleSubmit = rhfHandleSubmit((data) => {
        createMutation.mutate(data);
    });

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
        if (value !== undefined && value !== null && value > 0) {
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
        handleClose,
        handlePriceChange,
        handlePriceBlur,

        // State
        isSubmitting,

        // Validation rules
        validationRules: flightValidationRules,
        conditionalValidationRules: getConditionalValidationRules(routeType),
    };
}

