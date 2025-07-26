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
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import {
  Plane,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Wifi,
  WifiOff,
  Repeat,
  Navigation,
  Gauge,
  FileText,
  Route,
} from "lucide-react";

export function ViewFlightModal() {
  const { isOpen, isViewMode, viewingFlight, closeModal } =
    useFlightModalStore();

  if (!viewingFlight || !isViewMode) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      Scheduled: "default",
      Boarding: "secondary",
      Departed: "secondary",
      "In Flight": "secondary",
      Arrived: "outline",
      Delayed: "destructive",
      Cancelled: "destructive",
    };
    return statusColors[status] || "outline";
  };

  return (
    <Dialog open={isOpen && isViewMode} onOpenChange={closeModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Route className="h-6 w-6" />
            Flight Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flight Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Flight ID
                </span>
                <p className="font-mono text-sm">{viewingFlight.id}</p>
              </div>
              <div className="space-y-2 space-x-2 flex flex-col">
                <span className="text-sm font-medium text-slate-600">
                  Status
                </span>
                <Badge
                  className="w-fit"
                  variant={getStatusColor(viewingFlight.status)}
                >
                  {viewingFlight.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Recurring Flight
                </span>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  <span>
                    {viewingFlight.is_recurring === "true" ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departure Airport */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Departure Airport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Airport Name:</span>
                  <span className="text-slate-600">
                    {viewingFlight.departure_airport.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">IATA Code:</span>
                  <span className="font-mono text-slate-600">
                    {viewingFlight.departure_airport.iata_code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">City:</span>
                  <span className="text-slate-600">
                    {viewingFlight.departure_airport.city}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Address:</span>
                  <span className="text-slate-600 text-sm">
                    {viewingFlight.departure_airport.address}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Coordinates:</span>
                  <span className="text-slate-600 text-sm">
                    {Number(viewingFlight.departure_airport.latitude).toFixed(
                      4
                    )}
                    ,{" "}
                    {Number(viewingFlight.departure_airport.longitude).toFixed(
                      4
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Arrival Airport */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Arrival Airport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Airport Name:</span>
                  <span className="text-slate-600">
                    {viewingFlight.arrival_airport.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">IATA Code:</span>
                  <span className="font-mono text-slate-600">
                    {viewingFlight.arrival_airport.iata_code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">City:</span>
                  <span className="text-slate-600">
                    {viewingFlight.arrival_airport.city}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Address:</span>
                  <span className="text-slate-600 text-sm">
                    {viewingFlight.arrival_airport.address}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Coordinates:</span>
                  <span className="text-slate-600 text-sm">
                    {Number(viewingFlight.arrival_airport.latitude).toFixed(4)},{" "}
                    {Number(viewingFlight.arrival_airport.longitude).toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Flight Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Departure Date
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(viewingFlight.departure_date)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Estimated Duration
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{viewingFlight.estimated_duration}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Flight Price
                </span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-lg font-bold text-primary">
                    ${parseFloat(viewingFlight.price_usd).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aircraft Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Aircraft Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aircraft Images */}
              {viewingFlight.aircraft?.media &&
                viewingFlight.aircraft.media.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">
                      Aircraft Images
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewingFlight.aircraft.media.map((media, index) => (
                        <div key={media.id} className="relative">
                          <img
                            src={media.url || "/placeholder.svg"}
                            alt={`${
                              viewingFlight.aircraft.model_name
                            } - Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                )}

              {/* Aircraft Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-600">
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Model:</span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft?.model_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Manufacturer:</span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft.manufacturer}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Registration:</span>
                      <span className="font-mono text-slate-600">
                        {viewingFlight.aircraft.registration_number}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <Badge variant="outline">
                        {viewingFlight.aircraft.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-600">
                    Specifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Seating:
                      </span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft.seating_capacity} passengers
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Range:
                      </span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft.range_km.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Speed:
                      </span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft.speed_kph.toLocaleString()} km/h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        {viewingFlight.aircraft.wifi_available ? (
                          <Wifi className="h-4 w-4" />
                        ) : (
                          <WifiOff className="h-4 w-4" />
                        )}
                        WiFi:
                      </span>
                      <span className="text-slate-600">
                        {viewingFlight.aircraft.wifi_available
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate:
                      </span>
                      <span className="text-slate-600">
                        $
                        {viewingFlight.aircraft.price_per_hour_usd.toLocaleString()}
                        /hour
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
