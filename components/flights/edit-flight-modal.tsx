"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { AirportSelect } from "@/components/forms/airport-select";
import { FlightStatusSelect } from "@/components/forms/flight-status-select";
import {
  EditFlightFormData,
  FlightFormData,
  FlightStatus,
} from "@/lib/types/flight";
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  Route,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { updateFlight } from "@/lib/server/flights/flights";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Helper function to convert string status to FlightStatus enum
const getFlightStatusFromString = (statusString: string): FlightStatus => {
  const statusMap: Record<string, FlightStatus> = {
    Scheduled: FlightStatus.SCHEDULED,
    Boarding: FlightStatus.BOARDING,
    Departed: FlightStatus.DEPARTED,
    "In Flight": FlightStatus.IN_FLIGHT,
    Arrived: FlightStatus.ARRIVED,
    Delayed: FlightStatus.DELAYED,
    Cancelled: FlightStatus.CANCELLED,
  };
  return statusMap[statusString] ?? FlightStatus.SCHEDULED;
};

export function EditFlightModal() {
  const { isOpen, isEditMode, editingFlight, closeModal } =
    useFlightModalStore();

  const { token, operator } = useAuth(true);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFlightFormData>();

  const watchedValues = watch();

  // Initialize form with flight data when modal opens
  React.useEffect(() => {
    if (editingFlight && isEditMode) {
      // Convert departure_date to datetime-local format
      const departureDate = new Date(editingFlight.departure_date);
      const formattedDate = departureDate.toISOString().slice(0, 16);

      reset({
        aircraft_id: editingFlight.aircraft.id,
        departure_airport_id: editingFlight.departure_airport.id,
        arrival_airport_id: editingFlight.arrival_airport.id,
        departure_date: formattedDate,
        estimated_duration: editingFlight.estimated_duration,
        status: getFlightStatusFromString(editingFlight.status),
        price_usd: Number(editingFlight.price_usd),
        is_recurring: editingFlight.is_recurring === "true",
      });
    }
  }, [editingFlight, isEditMode, reset]);

  const onSubmit = async (data: EditFlightFormData) => {
    const { data: updatedFlight, error } = await updateFlight(
      editingFlight?.id || "",
      data,
      token,
      operator?.id || ""
    );

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Flight updated successfully");

    queryClient.refetchQueries({ queryKey: ["flights"] });

    closeModal();

    try {
      // TODO: Implement API call to update flight
      console.log("Updating flight:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close modal on success
      closeModal();
    } catch (error) {
      console.error("Error updating flight:", error);
    }
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  if (!editingFlight || !isEditMode) return null;

  return (
    <Dialog open={isOpen && isEditMode} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Edit Flight Schedule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Flight Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Flight Route
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <AircraftSelect
                  label="Aircraft"
                  value={watchedValues.aircraft_id}
                  onChange={(value) => setValue("aircraft_id", value)}
                  error={errors.aircraft_id?.message}
                  required
                  showAllAircraft
                />
              </div>
              <div className="space-y-2">
                <FlightStatusSelect
                  label="Flight Status"
                  value={watchedValues.status}
                  onChange={(value) => setValue("status", value)}
                  error={errors.status?.message}
                  required
                  showIcon
                />
              </div>
            </CardContent>
          </Card>

          {/* Airport Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Airports
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <AirportSelect
                  label="Departure Airport"
                  value={watchedValues.departure_airport_id}
                  onChange={(value) => setValue("departure_airport_id", value)}
                  error={errors.departure_airport_id?.message}
                  required
                  excludeAirportId={watchedValues.arrival_airport_id}
                />
              </div>
              <div className="space-y-2">
                <AirportSelect
                  label="Arrival Airport"
                  value={watchedValues.arrival_airport_id}
                  onChange={(value) => setValue("arrival_airport_id", value)}
                  error={errors.arrival_airport_id?.message}
                  required
                  excludeAirportId={watchedValues.departure_airport_id}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="departure_date"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Departure Date & Time
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departure_date"
                  type="datetime-local"
                  {...register("departure_date", {
                    required: "Departure date is required",
                  })}
                  className={errors.departure_date ? "border-red-500" : ""}
                />
                {errors.departure_date && (
                  <p className="text-sm text-red-500">
                    {errors.departure_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="estimated_duration"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Estimated Duration
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimated_duration"
                  placeholder="e.g., 2h 30m"
                  {...register("estimated_duration", {
                    required: "Estimated duration is required",
                  })}
                  className={errors.estimated_duration ? "border-red-500" : ""}
                />
                {errors.estimated_duration && (
                  <p className="text-sm text-red-500">
                    {errors.estimated_duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_usd" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Flight Price (USD)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price_usd"
                  placeholder="0.00"
                  {...register("price_usd", {
                    required: "Price is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Please enter a valid price",
                    },
                  })}
                  className={errors.price_usd ? "border-red-500" : ""}
                />
                {errors.price_usd && (
                  <p className="text-sm text-red-500">
                    {errors.price_usd.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flight Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Flight Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <Switch
                    id="is_recurring"
                    checked={watchedValues.is_recurring}
                    onCheckedChange={(checked) =>
                      setValue("is_recurring", checked)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="is_recurring"
                      className="font-medium cursor-pointer"
                    >
                      Recurring Flight
                    </Label>
                    <p className="text-sm text-slate-600">
                      This flight repeats on a regular schedule
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Flight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
