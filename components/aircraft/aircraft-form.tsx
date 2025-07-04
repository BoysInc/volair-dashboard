"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Settings, Wifi, WifiOff, Save, X } from "lucide-react";
import {
  Aircraft,
  AircraftFormData,
  AircraftStatus,
  AIRCRAFT_STATUS_LABELS,
  AIRCRAFT_MANUFACTURERS,
  AIRCRAFT_MODELS_BY_MANUFACTURER,
} from "@/lib/types/aircraft";

const aircraftFormSchema = z.object({
  model_name: z.string().min(1, "Model name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  registration_number: z
    .string()
    .min(3, "Registration number must be at least 3 characters")
    .max(10, "Registration number must be at most 10 characters"),
  seating_capacity: z
    .number()
    .min(1, "Seating capacity must be at least 1")
    .max(50, "Seating capacity must be at most 50"),
  range_km: z
    .number()
    .min(100, "Range must be at least 100 km")
    .max(20000, "Range must be at most 20,000 km"),
  speed_kph: z
    .number()
    .min(100, "Speed must be at least 100 kph")
    .max(1000, "Speed must be at most 1,000 kph"),
  wifi_available: z.boolean(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.nativeEnum(AircraftStatus),
});

interface AircraftFormProps {
  aircraft?: Aircraft;
  onSubmit: (data: AircraftFormData) => void;
  onCancel: () => void;
}

export function AircraftForm({
  aircraft,
  onSubmit,
  onCancel,
}: AircraftFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AircraftFormData>({
    resolver: zodResolver(aircraftFormSchema),
    defaultValues: aircraft
      ? {
          model_name: aircraft.model_name,
          manufacturer: aircraft.manufacturer,
          registration_number: aircraft.registration_number,
          seating_capacity: aircraft.seating_capacity,
          range_km: aircraft.range_km,
          speed_kph: aircraft.speed_kph,
          wifi_available: aircraft.wifi_available,
          image_url: aircraft.image_url,
          status: aircraft.status,
        }
      : {
          model_name: "",
          manufacturer: "",
          registration_number: "",
          seating_capacity: 8,
          range_km: 1000,
          speed_kph: 500,
          wifi_available: true,
          image_url: "",
          status: AircraftStatus.AVAILABLE,
        },
  });

  const selectedManufacturer = watch("manufacturer");
  const selectedStatus = watch("status");
  const wifiAvailable = watch("wifi_available");

  const handleFormSubmit = (data: AircraftFormData) => {
    // Convert image_url empty string to default placeholder
    const processedData = {
      ...data,
      image_url: data.image_url || "/placeholder.jpg",
    };
    onSubmit(processedData);
  };

  const availableModels = selectedManufacturer
    ? AIRCRAFT_MODELS_BY_MANUFACTURER[selectedManufacturer] || []
    : [];

  const getStatusBadgeVariant = (status: AircraftStatus) => {
    switch (status) {
      case AircraftStatus.AVAILABLE:
        return "default";
      case AircraftStatus.IN_FLIGHT:
        return "secondary";
      case AircraftStatus.MAINTENANCE:
        return "destructive";
      case AircraftStatus.OUT_OF_SERVICE:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: AircraftStatus) => {
    switch (status) {
      case AircraftStatus.AVAILABLE:
        return "text-green-600";
      case AircraftStatus.IN_FLIGHT:
        return "text-blue-600";
      case AircraftStatus.MAINTENANCE:
        return "text-orange-600";
      case AircraftStatus.OUT_OF_SERVICE:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6">
        {/* Aircraft Identification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Aircraft Identification
            </CardTitle>
            <CardDescription>
              Basic information about the aircraft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Controller
                  name="manufacturer"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("model_name", ""); // Reset model when manufacturer changes
                      }}
                      value={field.value}
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
                  )}
                />
                {errors.manufacturer && (
                  <p className="text-sm text-red-500">
                    {errors.manufacturer.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">Model</Label>
                <Controller
                  name="model_name"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.model_name && (
                  <p className="text-sm text-red-500">
                    {errors.model_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                placeholder="e.g., N123AB"
                {...register("registration_number")}
              />
              {errors.registration_number && (
                <p className="text-sm text-red-500">
                  {errors.registration_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/aircraft-image.jpg"
                {...register("image_url")}
              />
              {errors.image_url && (
                <p className="text-sm text-red-500">
                  {errors.image_url.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              Technical specifications and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seating_capacity">Seating Capacity</Label>
                <Input
                  id="seating_capacity"
                  type="number"
                  min="1"
                  max="50"
                  {...register("seating_capacity", { valueAsNumber: true })}
                />
                {errors.seating_capacity && (
                  <p className="text-sm text-red-500">
                    {errors.seating_capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="range_km">Range (km)</Label>
                <Input
                  id="range_km"
                  type="number"
                  min="100"
                  max="20000"
                  step="100"
                  {...register("range_km", { valueAsNumber: true })}
                />
                {errors.range_km && (
                  <p className="text-sm text-red-500">
                    {errors.range_km.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed_kph">Speed (kph)</Label>
                <Input
                  id="speed_kph"
                  type="number"
                  min="100"
                  max="1000"
                  step="10"
                  {...register("speed_kph", { valueAsNumber: true })}
                />
                {errors.speed_kph && (
                  <p className="text-sm text-red-500">
                    {errors.speed_kph.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="wifi_available">WiFi Available</Label>
                <div className="text-sm text-muted-foreground">
                  Does this aircraft have WiFi connectivity?
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  name="wifi_available"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="wifi_available"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                {wifiAvailable ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm">Disabled</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status
            </CardTitle>
            <CardDescription>
              Current operational status of the aircraft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Aircraft Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AIRCRAFT_STATUS_LABELS).map(
                        ([status, label]) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getStatusBadgeVariant(
                                  Number(status) as AircraftStatus
                                )}
                                className={getStatusColor(
                                  Number(status) as AircraftStatus
                                )}
                              >
                                {label}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge
                  variant={getStatusBadgeVariant(selectedStatus)}
                  className={getStatusColor(selectedStatus)}
                >
                  {AIRCRAFT_STATUS_LABELS[selectedStatus]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting
            ? "Saving..."
            : aircraft
            ? "Update Aircraft"
            : "Add Aircraft"}
        </Button>
      </div>
    </form>
  );
}
