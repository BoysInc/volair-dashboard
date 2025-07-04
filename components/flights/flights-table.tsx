"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plane,
  Clock,
  MapPin,
} from "lucide-react";
import {
  FlightWithDetails,
  FlightStatus,
  FLIGHT_STATUS_LABELS,
} from "@/lib/types/flight";

interface FlightsTableProps {
  flights: FlightWithDetails[];
  onEdit: (flight: FlightWithDetails) => void;
  onDelete: (flightId: string) => void;
  onStatusUpdate?: (flightId: string, newStatus: FlightStatus) => void;
}

const getStatusColor = (status: FlightStatus): string => {
  switch (status) {
    case FlightStatus.SCHEDULED:
      return "default";
    case FlightStatus.BOARDING:
      return "secondary";
    case FlightStatus.DEPARTED:
    case FlightStatus.IN_FLIGHT:
      return "default";
    case FlightStatus.ARRIVED:
      return "secondary";
    case FlightStatus.DELAYED:
      return "destructive";
    case FlightStatus.CANCELLED:
      return "destructive";
    default:
      return "default";
  }
};

export function FlightsTable({
  flights,
  onEdit,
  onDelete,
  onStatusUpdate,
}: FlightsTableProps) {
  const [deleteFlightId, setDeleteFlightId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteFlightId) {
      onDelete(deleteFlightId);
      setDeleteFlightId(null);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getAvailableStatusTransitions = (
    currentStatus: FlightStatus
  ): FlightStatus[] => {
    switch (currentStatus) {
      case FlightStatus.SCHEDULED:
        return [
          FlightStatus.BOARDING,
          FlightStatus.DELAYED,
          FlightStatus.CANCELLED,
        ];
      case FlightStatus.BOARDING:
        return [
          FlightStatus.DEPARTED,
          FlightStatus.DELAYED,
          FlightStatus.CANCELLED,
        ];
      case FlightStatus.DEPARTED:
        return [FlightStatus.IN_FLIGHT, FlightStatus.DELAYED];
      case FlightStatus.IN_FLIGHT:
        return [FlightStatus.ARRIVED];
      case FlightStatus.DELAYED:
        return [
          FlightStatus.BOARDING,
          FlightStatus.SCHEDULED,
          FlightStatus.CANCELLED,
        ];
      case FlightStatus.ARRIVED:
        return []; // Arrived flights typically don't change status
      case FlightStatus.CANCELLED:
        return [FlightStatus.SCHEDULED]; // Allow rescheduling cancelled flights
      default:
        return [];
    }
  };

  const handleStatusUpdate = (flightId: string, newStatus: FlightStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(flightId, newStatus);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flight Details</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Aircraft</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => (
            <TableRow key={flight.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">
                      Flight {flight.id.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {flight.estimated_duration}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-semibold">
                        {flight.departure_airport.iata_code}
                      </span>
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-sm font-semibold">
                        {flight.arrival_airport.iata_code}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {flight.departure_airport.city} →{" "}
                      {flight.arrival_airport.city}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">
                    {flight.aircraft.registration_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flight.aircraft.manufacturer} {flight.aircraft.model_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.aircraft.seating_capacity} seats
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">
                      {formatTime(flight.departure_time)} -{" "}
                      {formatTime(flight.arrival_time)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(flight.departure_time)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(flight.status) as any}>
                  {FLIGHT_STATUS_LABELS[flight.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-semibold">
                  ${flight.price_usd.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(flight)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Flight
                    </DropdownMenuItem>

                    {onStatusUpdate &&
                      getAvailableStatusTransitions(flight.status).length >
                        0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {getAvailableStatusTransitions(flight.status).map(
                            (status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  handleStatusUpdate(flight.id, status)
                                }
                              >
                                <div className="flex items-center">
                                  <Badge
                                    variant={getStatusColor(status) as any}
                                    className="mr-2 text-xs"
                                  >
                                    {FLIGHT_STATUS_LABELS[status]}
                                  </Badge>
                                </div>
                              </DropdownMenuItem>
                            )
                          )}
                        </>
                      )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteFlightId(flight.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Flight
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {flights.length === 0 && (
        <div className="text-center py-8">
          <Plane className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No flights scheduled
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by scheduling your first flight.
          </p>
        </div>
      )}

      <AlertDialog
        open={!!deleteFlightId}
        onOpenChange={() => setDeleteFlightId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              flight from your schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
