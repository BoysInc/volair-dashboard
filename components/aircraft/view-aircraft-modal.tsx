"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import { AIRCRAFT_STATUS_LABELS } from "@/lib/types/aircraft";
import {
  Plane,
  Users,
  Wifi,
  WifiOff,
  Gauge,
  Navigation,
  DollarSign,
  FileText,
} from "lucide-react";

export function ViewAircraftModal() {
  const { isOpen, isViewMode, isEditMode, viewingAircraft, closeModal } =
    useAircraftModalStore();

  if (!viewingAircraft || !isViewMode) return null;

  const statusColor = {
    Available: "default" as const,
    InFlight: "secondary" as const,
    Maintenance: "destructive" as const,
    "Out of Service": "outline" as const,
  };

  return (
    <Dialog
      open={isOpen && isViewMode && !isEditMode}
      onOpenChange={closeModal}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {viewingAircraft.model_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aircraft Images */}
          {viewingAircraft.media && viewingAircraft.media.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Aircraft Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingAircraft.media.map((media, index) => (
                  <div key={media.id} className="relative">
                    <img
                      src={media.url || "/placeholder.svg"}
                      alt={`${viewingAircraft.model_name} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Aircraft Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Aircraft Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Manufacturer:</span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.manufacturer}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Model:</span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.model_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Registration:</span>
                  <span className="text-muted-foreground font-mono">
                    {viewingAircraft.registration_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge variant={statusColor[viewingAircraft.status]}>
                    {AIRCRAFT_STATUS_LABELS[viewingAircraft.status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Seating Capacity:
                  </span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.seating_capacity} passengers
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Range:
                  </span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.range_km?.toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Speed:
                  </span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.speed_kph?.toLocaleString()} km/h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    {viewingAircraft.wifi_available ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    WiFi:
                  </span>
                  <span className="text-muted-foreground">
                    {viewingAircraft.wifi_available
                      ? "Available"
                      : "Not Available"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="font-medium">Hourly Rate:</span>
                <span className="text-2xl font-bold text-primary">
                  ${viewingAircraft.price_per_hour_usd?.toLocaleString()}/hour
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Aircraft ID:</h4>
                  <p className="text-muted-foreground font-mono text-xs">
                    {viewingAircraft.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Operator ID:</h4>
                  <p className="text-muted-foreground font-mono text-xs">
                    {viewingAircraft.operator_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
