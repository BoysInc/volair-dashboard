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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Plane,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import { OperatorBooking } from "@/lib/types/booking";

interface BookingsTableProps {
  bookings: OperatorBooking[];
  onViewBooking: (booking: OperatorBooking) => void;
  isLoading?: boolean;
}

export function BookingsTable({
  bookings,
  onViewBooking,
  isLoading = false,
}: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("departure_date");
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
          booking.from.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.to.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.aircraft.model_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "departure_date":
          aValue = new Date(a.departure_date);
          bValue = new Date(b.departure_date);
          break;
        case "price_usd":
          aValue = a.price_usd;
          bValue = b.price_usd;
          break;
        case "passenger_count":
          aValue = a.departure_passenger_count;
          bValue = b.departure_passenger_count;
          break;
        case "customer_name":
          aValue = `${a.user.first_name} ${a.user.last_name}`;
          bValue = `${b.user.first_name} ${b.user.last_name}`;
          break;
        default:
          aValue = a.departure_date;
          bValue = b.departure_date;
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
        className={`${colorMap[statusLower] || "bg-slate-50 text-slate-700 border-slate-200"} border font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="departure_date">Departure Date</SelectItem>
            <SelectItem value="price_usd">Total Price</SelectItem>
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

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Flight Details</TableHead>
                <TableHead>Aircraft</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
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
                          {booking.from.iata_code}
                        </span>
                        <span>→</span>
                        <span className="font-medium">
                          {booking.to.iata_code}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.from.city} → {booking.to.city}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(booking.departure_date),
                          "MMM dd, yyyy"
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {booking.flight_duration}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Type: {booking.type}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {booking.aircraft.model_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.aircraft.manufacturer}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.aircraft.registration_number}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">
                        {booking.departure_passenger_count}
                        {booking.return_passenger_count > 0 && ` / ${booking.return_passenger_count}`}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(booking.price_usd)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Operator: {formatCurrency(booking.operator_price_usd)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(booking.status)}
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
    </div>
  );
}
