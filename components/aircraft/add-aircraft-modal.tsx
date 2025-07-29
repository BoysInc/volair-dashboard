"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createAircraft } from "@/lib/server/aircraft/aircraft";
import {
  addAircraftSchema,
  AddAircraftFormData,
} from "@/lib/validations/aircraft";
import { AIRCRAFT_MANUFACTURERS } from "@/lib/types/aircraft";
import { LoadingState } from "@/components/ui/loading-state";
import { Plane, Wifi, WifiOff } from "lucide-react";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import {useAuthStore} from "@/lib/store/auth-store";

export function AddAircraftModal() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { isOpen, isEditMode, isViewMode, closeModal } =
    useAircraftModalStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddAircraftFormData>({
    resolver: zodResolver(addAircraftSchema),
    defaultValues: {
      model_name: "",
      manufacturer: "",
      registration_number: "",
      seating_capacity: 8,
      range_km: 1000,
      speed_kph: 500,
      price_per_hour_usd: 1000,
      wifi_available: "true",
      media_ids: [],
      status: "Available",
    },
  });

  const wifiAvailable = watch("wifi_available");
  const operator = useAuthStore((state) => state.operator);
  const createAircraftMutation = useMutation({
    mutationFn: (data: AddAircraftFormData) => createAircraft(token, data, operator?.id!),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Aircraft added successfully");
        queryClient.refetchQueries({ queryKey: ["aircrafts"], exact: true });
        reset();
        closeModal();
      }
    },
    onError: () => {
      toast.error("Failed to add aircraft. Please try again.");
    },
  });

  const onSubmit = async (data: AddAircraftFormData) => {
    await createAircraftMutation.mutateAsync(data);
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  return (
    <Dialog
      open={isOpen && !isEditMode && !isViewMode}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Add New Aircraft
          </DialogTitle>
          <DialogDescription>
            Add a new aircraft to your fleet. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  id="model_name"
                  label="Model Name"
                  type="text"
                  placeholder="e.g., Citation CJ3+"
                  registration={register("model_name")}
                  error={errors.model_name?.message}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Select
                    value={watch("manufacturer")}
                    onValueChange={(value) => setValue("manufacturer", value)}
                  >
                    <SelectTrigger>
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
                    <p className="text-sm text-red-500">
                      {errors.manufacturer.message}
                    </p>
                  )}
                </div>

                <CustomInput
                  id="registration_number"
                  label="Registration Number"
                  type="text"
                  placeholder="e.g., 5N-ABC"
                  registration={register("registration_number")}
                  error={errors.registration_number?.message}
                  required
                />

                <CustomInput
                  id="seating_capacity"
                  label="Seating Capacity"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="8"
                  registration={register("seating_capacity", {
                    valueAsNumber: true,
                  })}
                  error={errors.seating_capacity?.message}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  id="range_km"
                  label="Range (km)"
                  type="number"
                  min="1"
                  max="20000"
                  placeholder="1000"
                  registration={register("range_km", { valueAsNumber: true })}
                  error={errors.range_km?.message}
                  required
                />

                <CustomInput
                  id="speed_kph"
                  label="Speed (kph)"
                  type="number"
                  min="1"
                  max="2000"
                  placeholder="500"
                  registration={register("speed_kph", { valueAsNumber: true })}
                  error={errors.speed_kph?.message}
                  required
                />

                <CustomInput
                  id="price_per_hour_usd"
                  label="Price per Hour (USD)"
                  type="number"
                  min="1"
                  placeholder="1000"
                  prefix="$"
                  registration={register("price_per_hour_usd", {
                    valueAsNumber: true,
                  })}
                  error={errors.price_per_hour_usd?.message}
                  helperText="Hourly charter rate in USD"
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value as any)}
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
                  {errors.status && (
                    <p className="text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="wifi_available"
                    className="flex items-center gap-2"
                  >
                    {wifiAvailable === "true" ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    WiFi Available
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wifi_available"
                      checked={wifiAvailable === "true"}
                      onCheckedChange={(checked) =>
                        setValue("wifi_available", checked ? "true" : "false")
                      }
                    />
                    <Label
                      htmlFor="wifi_available"
                      className="text-sm text-muted-foreground"
                    >
                      {wifiAvailable === "true"
                        ? "WiFi enabled"
                        : "WiFi disabled"}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aircraft Images</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                label="Upload Aircraft Images"
                helperText="Upload images of the aircraft (JPEG, PNG, WebP). Maximum 5 files, 10MB each."
                multiple={true}
                maxFiles={5}
                maxSize={10}
                acceptedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                ]}
                value={watch("media_ids")}
                onChange={(mediaIds) =>
                  setValue("media_ids", mediaIds as string[])
                }
                onUploadComplete={(files) => {
                  // console.log("Upload complete:", files);
                  setValue(
                    "media_ids",
                    files.map((file) => file.id)
                  );
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                }}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex justify-center items-center"
              disabled={createAircraftMutation.isPending}
            >
              {createAircraftMutation.isPending ? (
                <LoadingState size="sm" message="Adding aircraft..." />
              ) : (
                "Add Aircraft"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
