"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plane,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import { BookingWithDetails } from "@/lib/types/database";
import {
  BookingStatus,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PaymentStatus,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  FlightStatus,
  FLIGHT_STATUS_LABELS,
  FLIGHT_STATUS_COLORS,
} from "@/lib/constants/booking-status";

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  onViewBooking: (booking: BookingWithDetails) => void;
  onEditBooking: (booking: BookingWithDetails) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  isLoading?: boolean;
}

export function BookingsTable({
  bookings,
  onViewBooking,
  onEditBooking,
  onDeleteBooking,
  onUpdateBookingStatus,
  isLoading = false,
}: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("departure_time");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const filteredBookings = React.useMemo(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.user.first_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.user.last_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.flight.departure_airport.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.flight.arrival_airport.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.flight.aircraft.model_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status === parseInt(statusFilter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "departure_time":
          aValue = new Date(a.flight.departure_time);
          bValue = new Date(b.flight.departure_time);
          break;
        case "total_price":
          aValue = a.total_price;
          bValue = b.total_price;
          break;
        case "passenger_count":
          aValue = a.passenger_count;
          bValue = b.passenger_count;
          break;
        case "customer_name":
          aValue = `${a.user.first_name} ${a.user.last_name}`;
          bValue = `${b.user.first_name} ${b.user.last_name}`;
          break;
        default:
          aValue = a.flight.departure_time;
          bValue = b.flight.departure_time;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, sortBy, sortOrder]);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Bookings Management
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="1">Pending</SelectItem>
              <SelectItem value="2">Confirmed</SelectItem>
              <SelectItem value="3">Cancelled</SelectItem>
              <SelectItem value="4">Completed</SelectItem>
              <SelectItem value="5">No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="departure_time">Departure Time</SelectItem>
              <SelectItem value="total_price">Total Price</SelectItem>
              <SelectItem value="passenger_count">Passengers</SelectItem>
              <SelectItem value="customer_name">Customer Name</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Flight Details</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user.first_name} ${booking.user.last_name}`}
                          />
                          <AvatarFallback>
                            {booking.user.first_name[0]}
                            {booking.user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {booking.user.first_name} {booking.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.user.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">
                            {booking.flight.departure_airport.iata_code}
                          </span>
                          <span>→</span>
                          <span className="font-medium">
                            {booking.flight.arrival_airport.iata_code}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.flight.departure_airport.city} →{" "}
                          {booking.flight.arrival_airport.city}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(booking.flight.departure_time),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(
                            new Date(booking.flight.departure_time),
                            "HH:mm"
                          )}{" "}
                          -{" "}
                          {format(
                            new Date(booking.flight.arrival_time),
                            "HH:mm"
                          )}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(booking.flight.status, "flight")}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {booking.flight.aircraft.model_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.flight.aircraft.manufacturer}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.flight.aircraft.registration_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Operator: {booking.flight.aircraft.operator.name}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {booking.passenger_count}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(booking.total_price)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={booking.status.toString()}
                        onValueChange={(value) =>
                          onUpdateBookingStatus(
                            booking.id,
                            parseInt(value) as BookingStatus
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Pending</SelectItem>
                          <SelectItem value="2">Confirmed</SelectItem>
                          <SelectItem value="3">Cancelled</SelectItem>
                          <SelectItem value="4">Completed</SelectItem>
                          <SelectItem value="5">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      {booking.payment ? (
                        <div className="space-y-1">
                          {getStatusBadge(
                            booking.payment.payment_status,
                            "payment"
                          )}
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(booking.payment.amount)}
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800"
                        >
                          No Payment
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewBooking(booking)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditBooking(booking)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteBooking(booking.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found matching your criteria.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
