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
  CreditCard,
  Building,
  Wifi,
  Gauge,
  MapIcon,
  Star,
} from "lucide-react";
import { BookingWithDetails } from "@/lib/types/database";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  FLIGHT_STATUS_LABELS,
  FLIGHT_STATUS_COLORS,
} from "@/lib/constants/booking-status";

interface BookingDetailsModalProps {
  booking: BookingWithDetails | null;
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
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (
    status: number,
    type: "booking" | "payment" | "flight"
  ) => {
    let labels, colors;

    switch (type) {
      case "booking":
        labels = BOOKING_STATUS_LABELS;
        colors = BOOKING_STATUS_COLORS;
        break;
      case "payment":
        labels = PAYMENT_STATUS_LABELS;
        colors = PAYMENT_STATUS_COLORS;
        break;
      case "flight":
        labels = FLIGHT_STATUS_LABELS;
        colors = FLIGHT_STATUS_COLORS;
        break;
    }

    return (
      <Badge
        variant="outline"
        className={`${
          colors[status as keyof typeof colors]
        } border font-medium`}
      >
        {labels[status as keyof typeof labels]}
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
                    Passengers
                  </div>
                  <div className="text-lg font-semibold">
                    {booking.passenger_count}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Booking Status
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(booking.status, "booking")}
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium text-lg">
                      {booking.flight.departure_airport.iata_code} →{" "}
                      {booking.flight.arrival_airport.iata_code}
                    </span>
                  </div>
                  <div>{getStatusBadge(booking.flight.status, "flight")}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Departure
                    </div>
                    <div className="font-medium">
                      {booking.flight.departure_airport.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.flight.departure_airport.city},{" "}
                      {booking.flight.departure_airport.country}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Arrival
                    </div>
                    <div className="font-medium">
                      {booking.flight.arrival_airport.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.flight.arrival_airport.city},{" "}
                      {booking.flight.arrival_airport.country}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Departure Time
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(booking.flight.departure_time),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(booking.flight.departure_time),
                          "HH:mm"
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Arrival Time
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(booking.flight.arrival_time),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.flight.arrival_time), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Duration
                  </div>
                  <div className="font-medium">
                    {booking.flight.estimated_duration}
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
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Plane className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-lg">
                    {booking.flight.aircraft.model_name}
                  </div>
                  <div className="text-muted-foreground">
                    {booking.flight.aircraft.manufacturer}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reg: {booking.flight.aircraft.registration_number}
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
                      {booking.flight.aircraft.seating_capacity}
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
                      {booking.flight.aircraft.speed_kph} km/h
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
                      {booking.flight.aircraft.range_km} km
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
                      {booking.flight.aircraft.wifi_available
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Operator
                </div>
                <div className="font-medium">
                  {booking.flight.aircraft.operator.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.flight.aircraft.operator.country}
                </div>
                <div className="text-sm text-muted-foreground">
                  License: {booking.flight.aircraft.operator.license_number}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(booking.total_price)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Flight Price
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(booking.flight.price_usd)}
                  </div>
                </div>
              </div>

              {booking.payment ? (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">
                        Payment Status
                      </div>
                      <div>
                        {getStatusBadge(
                          booking.payment.payment_status,
                          "payment"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Amount Paid
                        </div>
                        <div className="font-medium">
                          {formatCurrency(booking.payment.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Currency
                        </div>
                        <div className="font-medium">
                          {booking.payment.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Payment Method
                        </div>
                        <div className="font-medium">
                          {
                            PAYMENT_METHOD_LABELS[
                              booking.payment
                                .payment_method as keyof typeof PAYMENT_METHOD_LABELS
                            ]
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Payment Date
                        </div>
                        <div className="font-medium">
                          {format(
                            new Date(booking.payment.payment_date),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Transaction Reference
                      </div>
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {booking.payment.transaction_reference}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">
                    No payment information available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.print()}>Print Details</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
