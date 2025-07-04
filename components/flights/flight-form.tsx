"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { AirportSelect } from "@/components/forms/airport-select";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { FlightStatusSelect } from "@/components/forms/flight-status-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Clock, DollarSign, Activity } from "lucide-react";
import {
  FlightWithDetails,
  FlightFormData,
  FlightStatus,
} from "@/lib/types/flight";
import { format } from "date-fns";

interface FlightFormProps {
  flight?: FlightWithDetails; // For editing existing flight
  onSubmit: (data: FlightFormData) => void;
  onCancel: () => void;
}

export function FlightForm({ flight, onSubmit, onCancel }: FlightFormProps) {
  const isEditing = !!flight;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlightFormData>({
    defaultValues: {
      aircraft_id: flight?.aircraft_id || "",
      departure_airport_id: flight?.departure_airport_id || "",
      arrival_airport_id: flight?.arrival_airport_id || "",
      departure_time: flight?.departure_time
        ? format(new Date(flight.departure_time), "yyyy-MM-dd'T'HH:mm")
        : "",
      arrival_time: flight?.arrival_time
        ? format(new Date(flight.arrival_time), "yyyy-MM-dd'T'HH:mm")
        : "",
      price_usd: flight?.price_usd || 0,
      status: flight?.status ?? FlightStatus.SCHEDULED,
    },
  });

  const departureAirportId = watch("departure_airport_id");

  const handleFormSubmit = async (data: FlightFormData) => {
    try {
      // Convert datetime-local format to ISO string
      const formattedData = {
        ...data,
        departure_time: new Date(data.departure_time).toISOString(),
        arrival_time: new Date(data.arrival_time).toISOString(),
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error("Failed to submit flight:", error);
    }
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

        {/* Departure Time */}
        <div className="space-y-2">
          <Label
            htmlFor="departure_time"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Departure Time
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="departure_time"
            type="datetime-local"
            {...register("departure_time", {
              required: "Departure time is required",
            })}
            className={errors.departure_time ? "border-red-500" : ""}
          />
          {errors.departure_time && (
            <p className="text-sm text-red-600">
              {errors.departure_time.message}
            </p>
          )}
        </div>

        {/* Arrival Time */}
        <div className="space-y-2">
          <Label
            htmlFor="arrival_time"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Arrival Time
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="arrival_time"
            type="datetime-local"
            {...register("arrival_time", {
              required: "Arrival time is required",
            })}
            className={errors.arrival_time ? "border-red-500" : ""}
          />
          {errors.arrival_time && (
            <p className="text-sm text-red-600">
              {errors.arrival_time.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label
            htmlFor="price_usd"
            className="text-sm font-medium flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Price (USD)
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="price_usd"
            type="number"
            min="0"
            step="1"
            placeholder="Enter price in USD"
            {...register("price_usd", {
              required: "Price is required",
              min: { value: 1, message: "Price must be greater than 0" },
              valueAsNumber: true,
            })}
            className={errors.price_usd ? "border-red-500" : ""}
          />
          {errors.price_usd && (
            <p className="text-sm text-red-600">{errors.price_usd.message}</p>
          )}
        </div>

        {/* Flight Status */}
        <Controller
          name="status"
          control={control}
          rules={{ required: "Flight status is required" }}
          render={({ field }) => (
            <FlightStatusSelect
              label="Flight Status"
              value={field.value}
              onChange={field.onChange}
              error={errors.status?.message}
              required
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
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
