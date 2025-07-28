"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/custom-input";
import { AirportSelect } from "@/components/forms/airport-select";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar as CalendarIcon, DollarSign, Activity, Repeat, Timer } from "lucide-react";
import {
  FlightWithDetails,
  FlightFormData,
} from "@/lib/types/flight";
import { formatNumberWithCommas, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {useAuthStore} from "@/lib/store/auth-store";

interface FlightFormProps {
  flight?: FlightWithDetails; // For editing existing flight
  onCancel: () => void;
}

export function FlightForm({ flight, onCancel }: FlightFormProps) {
  const { token } = useAuth(true);
  const isEditing = !!flight;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlightFormData>({
    defaultValues: {
      aircraft_id: flight?.aircraft_id || "",
      departure_airport_id: flight?.departure_airport_id || "",
      arrival_airport_id: flight?.arrival_airport_id || "",
      estimated_duration: flight?.estimated_duration || "",
      price_usd: flight?.price_usd || 0,
      status: flight?.status ?? 'Active',
      is_recurring: false,
      departure_date: flight?.departure_date || "",
      departure_time: flight?.departure_date ? format(new Date(flight.departure_date), "HH:mm") : "12:00",
      is_empty_leg: flight?.is_empty_leg,
    },
  });

  const departureAirportId = watch("departure_airport_id");
  const selectedAircraftId = watch("aircraft_id");
  const estimatedDuration = watch("estimated_duration");
  const price_usd = watch("price_usd");

  // Fetch aircraft data
  const { data: aircraftData } = useQuery({
    queryKey: ["aircraft"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/aircraft`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch aircraft");
      }

      return response.json();
    },
    enabled: !!token,
  });

  // Calculate price based on aircraft price_per_hour_usd and estimated duration
  useEffect(() => {
    if (selectedAircraftId && estimatedDuration && aircraftData?.data) {
      const selectedAircraft = aircraftData.data.find((aircraft: any) => aircraft.id === selectedAircraftId);

      if (selectedAircraft && selectedAircraft.price_per_hour_usd) {
        const duration = parseFloat(estimatedDuration);
        if (!isNaN(duration)) {
          const calculatedPrice = selectedAircraft.price_per_hour_usd * duration;
          setValue("price_usd", calculatedPrice);
        }
      }
    }
  }, [selectedAircraftId, estimatedDuration, aircraftData, setValue]);

  // Format price with commas for display
  useEffect(() => {
    if (price_usd) {
      setFormattedPrice(formatNumberWithCommas(price_usd));
    } else {
      setFormattedPrice("");
    }
  }, [price_usd]);

  const queryClient = useQueryClient();
  const operator = useAuthStore((state) => state.operator);
  const mutation = useMutation({
    mutationFn: async (data: FlightFormData) => {
      const apiData = {
        aircraft_id: data.aircraft_id,
        departure_airport_id: data.departure_airport_id,
        arrival_airport_id: data.arrival_airport_id,
        estimated_duration: data.estimated_duration,
        status: data.status,
        price_usd: Number(data.price_usd), // Ensure price_usd is a number
        is_recurring: data.is_recurring ? "true" : "false",
        departure_date: data.departure_date,
        is_empty_leg: data.is_empty_leg ? "true" : "false",
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
          "Authorization": `Bearer ${token}`,
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
      await queryClient.invalidateQueries({queryKey: ['flights']});
      await queryClient.invalidateQueries({queryKey: ['flightWidgets']});
      setIsSubmitting(false);
      onCancel();
      toast.success(`Flight ${isEditing ? "updated" : "created"} successfully!`);
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
              type: 'server',
              message: messages[0] as string
            });
          }
        });
      } else {
        toast.error("Failed to submit flight. Please try again.");
      }
    }
  });

  const handleFormSubmit = async (data: FlightFormData) => {
    setIsSubmitting(true);

    // Parse the date and format it as 'Y-m-d H:i' before submission
    let formattedDate = data.departure_date;
    if (data.departure_date) {
      // If the input contains both date and time (from datetime-local)
      const dateObj = new Date(data.departure_date);
      formattedDate = format(dateObj, 'yyyy-MM-dd HH:mm');
    }

    // Combine with formatted date for submission
    const combinedData = {
      ...data,
      departure_date: formattedDate,
      price_usd: Number(data.price_usd) // Ensure price_usd is preserved as a number
    };

    mutation.mutate(combinedData);
  };

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

        {/* Departure Date and Time */}
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
                rules={{ required: "Departure date is required" }}
                render={({ field }) => (
                  <CustomInput
                    type="datetime-local"
                    label=""
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

        {/* Estimated Duration */}
        <div className="space-y-2">
          <Label
            htmlFor="estimated_duration"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Timer className="h-4 w-4" />
            Estimated Duration in Hours
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="estimated_duration"
            placeholder="e.g. 2"
            {...register("estimated_duration", {
              required: "Estimated duration is required",
            })}
            className={cn(
              "mt-2",
              errors.estimated_duration ? "border-red-500" : ""
            )}
          />
          {errors.estimated_duration && (
            <p className="text-sm text-red-600">
              {errors.estimated_duration.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label
                  htmlFor="price_usd"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Price (USD)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>Price is automatically calculated based on aircraft price per hour and estimated duration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Hidden input for the actual numeric value */}
          <input
            type="hidden"
            {...register("price_usd", {
              required: "Price is required",
              min: { value: 1, message: "Price must be greater than 0" },
              valueAsNumber: true,
            })}
            value={price_usd}
          />
          {/* Display input for formatted value */}
          <Input
            id="price_usd_display"
            placeholder="Automatically calculated"
            value={formattedPrice}
            className={cn(
              "mt-2",
              errors.price_usd ? "border-red-500" : ""
            )}
            readOnly
          />
          {errors.price_usd && (
            <p className="text-sm text-red-600">{errors.price_usd.message}</p>
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
                    <option value={'Active'}>Active</option>
                    <option value={'Inactive'}>Inactive</option>
                  </select>
              )}
          />
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Is Recurring */}
        <div className="space-y-2">
          <Label
            htmlFor="is_recurring"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Repeat className="h-4 w-4" />
            Recurring Flight
          </Label>
          <div className="flex items-center space-x-2 mt-2">
            <Controller
              name="is_recurring"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_recurring"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_recurring" className="text-sm text-muted-foreground">
              This flight repeats on a schedule
            </Label>
          </div>
          {errors.is_recurring && (
            <p className="text-sm text-red-600">{errors.is_recurring.message}</p>
          )}
        </div>

        {/* Is empty leg */}
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
                        onCheckedChange={field.onChange}
                    />
                )}
            />
          </div>
          {errors.is_empty_leg && (
              <p className="text-sm text-red-600">{errors.is_empty_leg.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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