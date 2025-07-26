"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/custom-input";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar as CalendarIcon, Clock, DollarSign, Activity, Repeat, Timer } from "lucide-react";
import {
  FlightWithDetails,
  FlightFormData,
} from "@/lib/types/flight";
import { formatNumberWithCommas, cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store/auth-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpdateFlightModalProps {
  flight: FlightWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateFlightModal({ flight, open, onOpenChange }: UpdateFlightModalProps) {
  const router = useRouter();
  const { token } = useAuth(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState<string>("");
  
  // Custom handler to close the modal and remove flightId from URL
  const handleCloseModal = (isOpen: boolean) => {
    if (!isOpen) {
      // Remove flightId from URL when modal is closed
      router.push(window.location.pathname);
    }
    // Call the original onOpenChange function
    onOpenChange(isOpen);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FlightFormData>({
    defaultValues: {
      aircraft: flight?.aircraft || "",
      departure_airport_id: flight?.departure_airport_id || "",
      arrival_airport_id: flight?.arrival_airport_id || "",
      estimated_duration: flight?.estimated_duration || "",
      price_usd: flight?.price_usd || 0,
      status: flight?.status ?? 'Active',
      is_recurring: flight?.is_recurring,
      is_empty_leg: flight?.is_empty_leg,
      departure_date: flight?.departure_date ? format(new Date(flight.departure_date), "yyyy-MM-dd") : "",
    },
  });

  // Reset form when flight changes
  useEffect(() => {
    if (flight) {
      reset({
        aircraft: flight.aircraft || "",
        departure_airport_id: flight.departure_airport_id || "",
        arrival_airport_id: flight.arrival_airport_id || "",
        estimated_duration: flight.estimated_duration || "",
        price_usd: flight.price_usd || 0,
        status: flight.status ?? 'Active',
        is_recurring: flight.is_recurring,
        is_empty_leg: flight.is_empty_leg,
        departure_date: flight.departure_date ? format(new Date(flight.departure_date), "yyyy-MM-dd") : "",
        departure_time: flight.departure_date ? format(new Date(flight.departure_date), "HH:mm") : "12:00",
      });
    }
  }, [flight, reset]);

  const price_usd = watch("price_usd");

  // Watch for changes in aircraft and estimated_duration to update price
  const selectedAircraft = watch("aircraft");
  const estimatedDuration = watch("estimated_duration");
  
  useEffect(() => {
    // Calculate price when aircraft or duration changes
    if (selectedAircraft && selectedAircraft.price_per_hour_usd && estimatedDuration) {
      // Parse the duration as a number
      const durationHours = parseFloat(estimatedDuration);
      if (!isNaN(durationHours)) {
        // Calculate the new price
        const calculatedPrice = selectedAircraft.price_per_hour_usd * durationHours;
        // Update the price_usd field
        setValue("price_usd", calculatedPrice);
      }
    }
  }, [selectedAircraft, estimatedDuration, setValue]);

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
        aircraft_id: data.aircraft.id,
        departure_date: data.departure_date,
        estimated_duration: data.estimated_duration,
        status: data.status,
        price_usd: Number(data.price_usd), // Ensure price_usd is a number
        is_recurring: data.is_recurring ? "true" : "false",
        is_empty_leg: data.is_empty_leg ? "true" : "false",
      };

      const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flight?.id}`;

      const response = await fetch(url, {
        method: "PATCH",
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
      handleCloseModal(false);
      toast.success("Flight updated successfully!");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Failed to update flight:", error);

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
        toast.error("Failed to update flight. Please try again.");
      }
    }
  });

  const handleFormSubmit = async (data: FlightFormData) => {
    setIsSubmitting(true);

    // Combine date and time for submission
    const combinedData = {
      ...data,
      departure_date: `${data.departure_date} ${data.departure_time}`,
      price_usd: Number(data.price_usd) // Ensure price_usd is preserved as a number
    };

    mutation.mutate(combinedData);
  };

  const handleCancel = () => {
    handleCloseModal(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Flight</DialogTitle>
          <DialogDescription>
            Update flight details and schedule information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aircraft Selection */}
            <div className="md:col-span-2">
              <Controller
                name="aircraft"
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
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.departure_date && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              // Display in a user-friendly format, but store in the required format
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[100]">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                // Format date as yyyy-MM-dd (e.g., 2023-12-31)
                                const formattedDate = format(date, "yyyy-MM-dd");
                                field.onChange(formattedDate);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.departure_date && (
                    <p className="text-sm text-red-600">
                      {errors.departure_date.message}
                    </p>
                  )}
                </div>

                {/* Time Picker */}
                <div className="md:w-40">
                  <Controller
                    name="departure_time"
                    control={control}
                    rules={{ required: "Departure time is required" }}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <CustomInput
                          type="time"
                          label=""
                          placeholder="Select time"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.departure_time?.message}
                          className="w-full"
                          prefix={<Clock className="h-4 w-4" />}
                        />
                      </div>
                    )}
                  />
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
              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register("price_usd", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be greater than 0" },
                  valueAsNumber: true,
                })}
              />
              {/* Editable input for price */}
              <Input
                id="price_usd_display"
                placeholder="Automatically calculated"
                value={formattedPrice}
                onChange={(e) => {
                  // Remove commas and non-numeric characters
                  const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                  // Parse as number
                  const parsedValue = parseFloat(numericValue);
                  // Update the form value
                  setValue("price_usd", isNaN(parsedValue) ? 0 : parsedValue);
                  // Update the formatted display
                  setFormattedPrice(numericValue);
                }}
                className={cn(
                  "mt-2",
                  errors.price_usd ? "border-red-500" : ""
                )}
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
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Flight
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}