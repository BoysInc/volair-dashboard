"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/custom-input";
import { AirportSelect } from "@/components/forms/airport-select";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Calendar as CalendarIcon,
  DollarSign,
  Activity,
  Timer,
  Route,
} from "lucide-react";
import { FlightWithDetails, FlightFormData } from "@/lib/types/flight";
import {
  cn,
  formatNumberWithCommas,
  invalidateAndRefetchQueries,
} from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/store/auth-store";
import useFeatureFlag from "@/hooks/feature-flags/use-feature-flags";

interface FlightFormProps {
  flight?: FlightWithDetails; // For editing existing flight
  onCancel: () => void;
}

export function FlightForm({ flight, onCancel }: FlightFormProps) {
  const { token } = useAuth(true);
  const isEditing = !!flight;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedOneWayPrice, setFormattedOneWayPrice] = useState<string>("");
  const [formattedRoundTripPrice, setFormattedRoundTripPrice] =
    useState<string>("");
  const [formattedDuration, setFormattedDuration] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlightFormData>({
    defaultValues: {
      aircraft_id: flight?.aircraft?.id || "",
      departure_airport_id: flight?.departure_airport_id || "",
      arrival_airport_id: flight?.arrival_airport_id || "",
      estimated_duration: flight?.estimated_duration || "",
      one_way_price_usd: 0,
      round_trip_price_usd: 0,
      status: flight?.status ?? "Active",
      departure_date: flight?.departure_date || "",
      departure_time: flight?.departure_date
        ? format(new Date(flight.departure_date), "HH:mm")
        : "12:00",
      is_empty_leg: flight?.is_empty_leg,
      route_type: "Charter",
    },
  });

  const departureAirportId = watch("departure_airport_id");
  const routeType = watch("route_type");
  const oneWayPrice = watch("one_way_price_usd");
  const roundTripPrice = watch("round_trip_price_usd");
  const estimatedDuration = watch("estimated_duration");

  const queryClient = useQueryClient();
  const operator = useAuthStore((state) => state.operator);

  // Format price values for display
  useEffect(() => {
    if (oneWayPrice !== undefined && oneWayPrice !== null) {
      setFormattedOneWayPrice(oneWayPrice > 0 ? oneWayPrice.toString() : "");
    }
  }, [oneWayPrice]);

  useEffect(() => {
    if (roundTripPrice !== undefined && roundTripPrice !== null) {
      setFormattedRoundTripPrice(
        roundTripPrice > 0 ? roundTripPrice.toString() : ""
      );
    }
  }, [roundTripPrice]);

  useEffect(() => {
    if (estimatedDuration) {
      setFormattedDuration(estimatedDuration.toString());
    }
  }, [estimatedDuration]);

  const mutation = useMutation({
    mutationFn: async (data: FlightFormData) => {
      const apiData = {
        aircraft_id: data.aircraft_id,
        departure_airport_id: data.departure_airport_id,
        arrival_airport_id: data.arrival_airport_id,
        estimated_duration: Number(data.estimated_duration),
        status: data.status,
        one_way_price_usd: Number(data.one_way_price_usd),
        round_trip_price_usd: Number(data.round_trip_price_usd),
        is_empty_leg: data.is_empty_leg ? "true" : "false",
        departure_date: data.departure_date,
        route_type: data.route_type,
        operator_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flight?.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        // Parse the error response to get validation errors
        const errorData = await response.json();
        if (errorData.errors) {
          throw { errors: errorData.errors };
        }
        throw new Error(response.statusText);
      }

      return response.json();
    },
    onSuccess: async () => {
      invalidateAndRefetchQueries(queryClient, ["flights", "flightWidgets"]);
      setIsSubmitting(false);
      onCancel();
      toast.success(
        `Flight ${isEditing ? "updated" : "created"} successfully!`
      );
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Failed to submit flight:", error);

      // Handle validation errors
      if (error.errors) {
        // Set errors on form fields
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Map API field names to form field names if needed
            const formField = field as keyof FlightFormData;
            setValue(formField, watch(formField)); // Ensure the field is touched
            // @ts-ignore - TypeScript doesn't know about setError
            control.setError(formField, {
              type: "server",
              message: messages[0] as string,
            });
          }
        });
      } else {
        toast.error("Failed to submit flight. Please try again.");
      }
    },
  });

  const handleFormSubmit = async (data: FlightFormData) => {
    setIsSubmitting(true);

    // Parse the date and format it as 'Y-m-d H:i' before submission
    let formattedDate = data.departure_date;

    // For Charter flights, departure_date is optional
    if (data.departure_date && data.route_type === "Seats") {
      // If the input contains both date and time (from datetime-local)
      const dateObj = new Date(data.departure_date);
      formattedDate = format(dateObj, "yyyy-MM-dd HH:mm");
    } else if (data.route_type === "Charter") {
      // For Charter flights, set to null or empty string
      formattedDate = "";
    }

    // Combine with formatted date for submission
    const combinedData = {
      ...data,
      departure_date: formattedDate,
    };

    mutation.mutate(combinedData);
  };

  const { isEnabled: isOneWaySeatsEnabled } = useFeatureFlag("OneWaySeats");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aircraft Selection */}
        <div className="md:col-span-2">
          <Controller
            name="aircraft_id"
            control={control}
            rules={{ required: "Aircraft is required" }}
            render={({ field }) => (
              <AircraftSelect
                label="Aircraft"
                value={field.value}
                onChange={field.onChange}
                error={errors.aircraft_id?.message}
                required
              />
            )}
          />
        </div>

        {/* Airports - Departure and Arrival on same row */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure Airport */}
          <Controller
            name="departure_airport_id"
            control={control}
            rules={{ required: "Departure airport is required" }}
            render={({ field }) => (
              <AirportSelect
                label="Departure Airport"
                value={field.value}
                onChange={field.onChange}
                error={errors.departure_airport_id?.message}
                required
              />
            )}
          />

          {/* Arrival Airport */}
          <Controller
            name="arrival_airport_id"
            control={control}
            rules={{
              required: "Arrival airport is required",
              validate: (value) =>
                value !== departureAirportId ||
                "Arrival airport must be different from departure airport",
            }}
            render={({ field }) => (
              <AirportSelect
                label="Arrival Airport"
                value={field.value}
                onChange={field.onChange}
                error={errors.arrival_airport_id?.message}
                excludeAirportId={departureAirportId}
                required
              />
            )}
          />
        </div>

        {/* Route Type */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="route_type"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Route className="h-4 w-4" />
            Route Type
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Controller
            name="route_type"
            control={control}
            rules={{
              required: "Route type is required",
            }}
            render={({ field }) => (
              <select
                id="route_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                value={field.value}
                onChange={(e) =>
                  field.onChange(e.target.value as "Charter" | "Seats")
                }
              >
                <option value="Charter">Charter</option>
                <option value="Seats">Seats</option>
              </select>
            )}
          />
          {errors.route_type && (
            <p className="text-sm text-red-600">{errors.route_type.message}</p>
          )}
        </div>

        {/* Departure Date and Time */}
        {routeType === "Seats" && (
          <div className="space-y-2">
            <Label
              htmlFor="departure_date"
              className="text-sm font-medium flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              When is this flight starting?
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Picker */}
              <div className="flex-1">
                <Controller
                  name="departure_date"
                  control={control}
                  rules={{
                    required:
                      routeType === "Seats"
                        ? "Departure date is required for scheduled flights"
                        : false,
                  }}
                  render={({ field }) => (
                    <CustomInput
                      type="datetime-local"
                      label=""
                      min={new Date().toISOString().slice(0, 16)}
                      id="departure_date"
                      {...field}
                      className={cn(
                        errors.departure_date ? "border-red-500" : ""
                      )}
                    />
                  )}
                />
                {errors.departure_date && (
                  <p className="text-sm text-red-600">
                    {errors.departure_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {routeType === "Charter" && (
          <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Charter Flight:</strong> No scheduled departure time
              needed. The flight will be scheduled when a customer books it.
            </p>
          </div>
        )}

        {/* Estimated Duration */}
        <div className="space-y-2">
          <Label
            htmlFor="estimated_duration"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Timer className="h-4 w-4" />
            Estimated Duration in Minutes
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Controller
            name="estimated_duration"
            control={control}
            rules={{ required: "Estimated duration is required" }}
            render={({ field }) => (
              <Input
                id="estimated_duration"
                placeholder="e.g. 120"
                value={formattedDuration}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFormattedDuration(value);
                  field.onChange(value);
                }}
                className={cn(
                  "mt-2",
                  errors.estimated_duration ? "border-red-500" : ""
                )}
              />
            )}
          />
          {errors.estimated_duration && (
            <p className="text-sm text-red-600">
              {errors.estimated_duration.message}
            </p>
          )}
        </div>

        {/* One Way Price */}
        <div className="space-y-2">
          <Label
            htmlFor="one_way_price_usd"
            className="text-sm font-medium flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            One Way Price (USD)
          </Label>
          <Controller
            name="one_way_price_usd"
            control={control}
            rules={{
              min: {
                value: 0,
                message: "Price must be greater than or equal to 0",
              },
            }}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="one_way_price_usd"
                  placeholder="0.00"
                  value={
                    formattedOneWayPrice
                      ? formatNumberWithCommas(parseFloat(formattedOneWayPrice))
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setFormattedOneWayPrice(value);
                    const numericValue = parseFloat(value);
                    field.onChange(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  className={cn(
                    "mt-2 pl-7",
                    errors.one_way_price_usd ? "border-red-500" : ""
                  )}
                />
              </div>
            )}
          />
          {errors.one_way_price_usd && (
            <p className="text-sm text-red-600">
              {errors.one_way_price_usd.message}
            </p>
          )}
        </div>

        {/* Round Trip Price */}
        <div className="space-y-2">
          <Label
            htmlFor="round_trip_price_usd"
            className="text-sm font-medium flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Round Trip Price (USD)
          </Label>
          <Controller
            name="round_trip_price_usd"
            control={control}
            rules={{
              min: {
                value: 0,
                message: "Price must be greater than or equal to 0",
              },
            }}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="round_trip_price_usd"
                  placeholder="0.00"
                  value={
                    formattedRoundTripPrice
                      ? formatNumberWithCommas(
                          parseFloat(formattedRoundTripPrice)
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setFormattedRoundTripPrice(value);
                    const numericValue = parseFloat(value);
                    field.onChange(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  className={cn(
                    "mt-2 pl-7",
                    errors.round_trip_price_usd ? "border-red-500" : ""
                  )}
                />
              </div>
            )}
          />
          {errors.round_trip_price_usd && (
            <p className="text-sm text-red-600">
              {errors.round_trip_price_usd.message}
            </p>
          )}
        </div>

        {/* Flight Status */}
        <div className="space-y-2">
          <Label
            htmlFor="status"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Flight Status
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Controller
            name="status"
            control={control}
            rules={{
              required: "Status is required",
            }}
            render={({ field }) => (
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value={"Active"}>Active</option>
                <option value={"Inactive"}>Inactive</option>
              </select>
            )}
          />
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Is empty leg */}
        {isOneWaySeatsEnabled && (
          <div className="space-y-2">
            <Label
              htmlFor="is_empty_leg"
              className="text-sm font-medium flex items-center gap-2"
            >
              Is this an empty leg flight?
            </Label>
            <div className="flex items-center space-x-2 mt-2">
              <Controller
                name="is_empty_leg"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_empty_leg"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                )}
              />
            </div>
            {errors.is_empty_leg && (
              <p className="text-sm text-red-600">
                {errors.is_empty_leg.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Flight" : "Schedule Flight"}
        </Button>
      </div>
    </form>
  );
}
