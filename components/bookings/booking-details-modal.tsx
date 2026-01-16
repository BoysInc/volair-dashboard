"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Plane,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Mail,
  Building,
  Wifi,
  Gauge,
  MapIcon,
} from "lucide-react";
import { OperatorBooking } from "@/lib/types/booking";

interface BookingDetailsModalProps {
  booking: OperatorBooking | null;
  open: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  open,
  onClose,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();

    const colorMap: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-teal-50 text-teal-700 border-teal-200",
    };

    return (
      <Badge
        variant="outline"
        className={`${
          colorMap[statusLower] || "bg-slate-50 text-slate-700 border-slate-200"
        } border font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Booking Details - {booking.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user.first_name} ${booking.user.last_name}`}
                  />
                  <AvatarFallback className="text-lg">
                    {booking.user.first_name[0]}
                    {booking.user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="font-semibold text-lg">
                    {booking.user.first_name} {booking.user.last_name}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {booking.user.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {booking.user.phone}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Departure Passengers
                  </div>
                  <div className="text-lg font-semibold">
                    {booking.departure_passenger_count}
                  </div>
                </div>
                {booking.return_passenger_count > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Return Passengers
                    </div>
                    <div className="text-lg font-semibold">
                      {booking.return_passenger_count}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Booking Status
                </div>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Booking Type
                </div>
                <div className="mt-1 font-medium">{booking.type}</div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flight Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-lg">
                    {booking.from.iata_code} → {booking.to.iata_code}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Departure
                    </div>
                    <div className="font-medium">{booking.from.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.from.city}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.from.address}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Arrival
                    </div>
                    <div className="font-medium">{booking.to.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.to.city}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.to.address}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Departure Date
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(booking.departure_date),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  </div>

                  {booking.return_date && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Return Date
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(
                            new Date(booking.return_date),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Duration
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {booking.flight_duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aircraft Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Aircraft Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {booking.aircraft.image_url ? (
                  <img
                    src={booking.aircraft.image_url}
                    alt={booking.aircraft.model_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Plane className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="font-semibold text-lg">
                    {booking.aircraft.model_name}
                  </div>
                  <div className="text-muted-foreground">
                    {booking.aircraft.manufacturer}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reg: {booking.aircraft.registration_number}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Seating Capacity
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {booking.aircraft.seating_capacity}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Speed
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    <span className="font-medium">
                      {booking.aircraft.speed_kph} km/h
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Range
                  </div>
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {booking.aircraft.range_km} km
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    WiFi
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span className="font-medium">
                      {booking.aircraft.wifi_available
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Price per Hour
                </div>
                <div className="font-medium">
                  {formatCurrency(booking.aircraft.price_per_hour_usd / 100)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Customer Price
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(booking.price_usd)}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Operator Price
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(booking.operator_price_usd)}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Platform Fee
                  </div>
                  <div className="text-lg font-medium">
                    {formatCurrency(
                      booking.price_usd - booking.operator_price_usd
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Booking Created
                </div>
                <div className="font-medium">
                  {format(new Date(booking.created_at), "MMM dd, yyyy HH:mm")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
