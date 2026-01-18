"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/custom-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUpload } from "@/components/ui/media-upload";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { updateAircraft } from "@/lib/server/aircraft/aircraft";
import {
  addAircraftSchema,
  EditAircraftFormData,
} from "@/lib/validations/aircraft";
import { AIRCRAFT_MANUFACTURERS } from "@/lib/types/aircraft";
import { LoadingState } from "@/components/ui/loading-state";
import { Plane, Wifi, WifiOff, Edit, Save, X } from "lucide-react";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import { cn } from "@/lib/utils";
import { invalidateAndRefetchQueries } from "@/lib/utils";

interface EditAircraftFormFields {
  model_name: string;
  manufacturer: string;
  registration_number: string;
  seating_capacity: number;
  range_km: number;
  speed_kph: number;
  price_per_hour_usd: number;
  wifi_available: string;
  media_ids: string[];
  status: "Available" | "InFlight" | "Maintenance" | "Out of Service";
}

export function EditAircraftModal() {
  const { token, operator } = useAuth();
  const queryClient = useQueryClient();
  const { isOpen, isEditMode, editingAircraft, closeModal } =
    useAircraftModalStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<EditAircraftFormFields>({
    resolver: zodResolver(addAircraftSchema.partial()),
    defaultValues: {
      model_name: "",
      manufacturer: "",
      registration_number: "",
      seating_capacity: 1,
      range_km: 100,
      speed_kph: 100,
      price_per_hour_usd: 1000,
      wifi_available: "false",
      media_ids: [],
      status: "Available",
    },
  });

  // Set form values when editing aircraft changes
  useEffect(() => {
    if (editingAircraft && isEditMode) {
      reset({
        model_name: editingAircraft.model_name,
        manufacturer: editingAircraft.manufacturer,
        registration_number: editingAircraft.registration_number,
        seating_capacity: editingAircraft.seating_capacity,
        range_km: editingAircraft.range_km,
        speed_kph: editingAircraft.speed_kph,
        price_per_hour_usd: editingAircraft.price_per_hour_usd,
        wifi_available: editingAircraft.wifi_available ? "true" : "false",
        media_ids: editingAircraft.media?.map((m) => m.id) || [],
        status: editingAircraft.status,
      });
    }
  }, [editingAircraft, isEditMode, reset]);

  // Watch form values for live updates
  const watchedValues = watch();
  const wifi_available = watch("wifi_available");

  const updateAircraftMutation = useMutation({
    mutationFn: async (data: EditAircraftFormData) => {
      if (!editingAircraft?.id) {
        toast.error("No aircraft ID provided");
        return { data: null, error: "No aircraft ID provided" };
      }

      return updateAircraft(token, editingAircraft.id, data, operator?.id!);
    },
    onSuccess: (response) => {
      if (response.error) {
        toast.error("Failed to update aircraft", {
          description: response.error,
        });
        return;
      }

      toast.success("Aircraft updated successfully!", {
        description: `${watchedValues.model_name} has been updated successfully.`,
      });

      invalidateAndRefetchQueries(queryClient, [
        "aircrafts",
        "aircraftWidgets",
        "dashboard-stats",
      ]);

      reset();
      closeModal();
    },
    onError: (error) => {
      toast.error("Failed to update aircraft", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: EditAircraftFormFields) => {
    // Only include dirty fields in the update payload
    const dirtyData: Partial<EditAircraftFormFields> = {};

    Object.keys(dirtyFields).forEach((key) => {
      const fieldKey = key as keyof EditAircraftFormFields;
      if (dirtyFields[fieldKey]) {
        dirtyData[fieldKey] = data[fieldKey] as any;
      }
    });

    // Convert wifi_available for API if it's dirty
    const updatePayload: EditAircraftFormData = {};

    if (dirtyData.model_name) updatePayload.model_name = dirtyData.model_name;
    if (dirtyData.manufacturer)
      updatePayload.manufacturer = dirtyData.manufacturer;
    if (dirtyData.registration_number)
      updatePayload.registration_number = dirtyData.registration_number;
    if (dirtyData.seating_capacity)
      updatePayload.seating_capacity = dirtyData.seating_capacity;
    if (dirtyData.range_km) updatePayload.range_km = dirtyData.range_km;
    if (dirtyData.speed_kph) updatePayload.speed_kph = dirtyData.speed_kph;
    if (dirtyData.price_per_hour_usd)
      updatePayload.price_per_hour_usd = dirtyData.price_per_hour_usd;
    if (dirtyData.wifi_available !== undefined)
      updatePayload.wifi_available =
        dirtyData.wifi_available === "true" ? "true" : "false";
    if (dirtyData.media_ids) updatePayload.media_ids = dirtyData.media_ids;
    if (dirtyData.status) updatePayload.status = dirtyData.status;

    // Only proceed if there are changes
    if (Object.keys(updatePayload).length === 0) {
      toast.info("No changes detected", {
        description: "Please make some changes before updating.",
      });
      return;
    }

    updateAircraftMutation.mutate(updatePayload);
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  // Only show modal when in edit mode
  if (!isEditMode || !editingAircraft) {
    return null;
  }

  return (
    <Dialog open={isOpen && isEditMode} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-professional-background">
        <DialogHeader className="border-b border-slate-200  pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Edit Aircraft
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Update aircraft details for {editingAircraft.model_name} (
                {editingAircraft.registration_number})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-6">
          {/* Aircraft Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-professional-background">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Plane className="w-5 h-5 text-teal-600" />
                Aircraft Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="model_name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Model Name
                </Label>
                <CustomInput
                  id="model_name"
                  {...register("model_name")}
                  placeholder="e.g., G650"
                  className={cn(
                    errors.model_name && "border-red-300 focus:border-red-400"
                  )}
                />
                {errors.model_name && (
                  <p className="text-xs text-red-600">
                    {errors.model_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="manufacturer"
                  className="text-sm font-semibold text-slate-700"
                >
                  Manufacturer
                </Label>
                <Select
                  value={watchedValues.manufacturer}
                  onValueChange={(value) =>
                    setValue("manufacturer", value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger
                    className={cn(errors.manufacturer && "border-red-300")}
                  >
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRCRAFT_MANUFACTURERS.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.manufacturer && (
                  <p className="text-xs text-red-600">
                    {errors.manufacturer.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="registration_number"
                  className="text-sm font-semibold text-slate-700"
                >
                  Registration Number
                </Label>
                <CustomInput
                  id="registration_number"
                  {...register("registration_number")}
                  placeholder="e.g., N123AB"
                  className={cn(
                    errors.registration_number &&
                      "border-red-300 focus:border-red-400"
                  )}
                />
                {errors.registration_number && (
                  <p className="text-xs text-red-600">
                    {errors.registration_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-slate-700"
                >
                  Status
                </Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(
                    value:
                      | "Available"
                      | "InFlight"
                      | "Maintenance"
                      | "Out of Service"
                  ) => setValue("status", value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Flight">In Flight</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Out of Service">
                      Out of Service
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-professional-background">
              <CardTitle className="text-lg text-slate-800">
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="seating_capacity"
                  className="text-sm font-semibold text-slate-700"
                >
                  Seating Capacity
                </Label>
                <CustomInput
                  id="seating_capacity"
                  {...register("seating_capacity", { valueAsNumber: true })}
                  placeholder="8"
                  className={cn(
                    errors.seating_capacity &&
                      "border-red-300 focus:border-red-400"
                  )}
                />
                {errors.seating_capacity && (
                  <p className="text-xs text-red-600">
                    {errors.seating_capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="range_km"
                  className="text-sm font-semibold text-slate-700"
                >
                  Range (km)
                </Label>
                <CustomInput
                  id="range_km"
                  {...register("range_km", { valueAsNumber: true })}
                  placeholder="7000"
                  className={cn(
                    errors.range_km && "border-red-300 focus:border-red-400"
                  )}
                />
                {errors.range_km && (
                  <p className="text-xs text-red-600">
                    {errors.range_km.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="speed_kph"
                  className="text-sm font-semibold text-slate-700"
                >
                  Speed (km/h)
                </Label>
                <CustomInput
                  id="speed_kph"
                  {...register("speed_kph", { valueAsNumber: true })}
                  placeholder="950"
                  className={cn(
                    errors.speed_kph && "border-red-300 focus:border-red-400"
                  )}
                />
                {errors.speed_kph && (
                  <p className="text-xs text-red-600">
                    {errors.speed_kph.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  WiFi Availability
                </Label>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                      wifi_available === "true"
                        ? "bg-teal-100 text-teal-600"
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {wifi_available === "true" ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {wifi_available === "true" ? "WiFi Available" : "No WiFi"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {wifi_available === "true"
                        ? "Passengers can connect to internet"
                        : "No internet access"}
                    </p>
                  </div>
                  <Switch
                    className="bg-slate-200"
                    checked={wifi_available === "true"}
                    onCheckedChange={(checked) =>
                      setValue("wifi_available", checked ? "true" : "false", {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-professional-background">
              <CardTitle className="text-lg text-slate-800">
                Aircraft Images
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Existing Images */}
              {editingAircraft.media && editingAircraft.media.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">
                    Current Images
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {editingAircraft.media
                      .filter((media) =>
                        watchedValues.media_ids.includes(media.id)
                      )
                      .map((media) => (
                        <div
                          key={media.id}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={media.url}
                            alt={`Aircraft image ${media.order}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8"
                              onClick={() => {
                                const updatedMediaIds =
                                  watchedValues.media_ids.filter(
                                    (id) => id !== media.id
                                  );
                                setValue("media_ids", updatedMediaIds, {
                                  shouldDirty: true,
                                });
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Media Upload Component */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  {editingAircraft.media && editingAircraft.media.length > 0
                    ? "Add More Images"
                    : "Upload Images"}
                </Label>
                <MediaUpload
                  value={watchedValues.media_ids}
                  onChange={(mediaIds) =>
                    setValue("media_ids", mediaIds as string[], {
                      shouldDirty: true,
                    })
                  }
                  maxFiles={5}
                  multiple={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 ">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? (
                <LoadingState size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Aircraft
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
