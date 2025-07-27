"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
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
import { formatCurrency } from "@/lib/utils";
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
  FlightStatus,
  FLIGHT_STATUS_LABELS,
  GetOperatorFlightsResponse,
  OperatorFlight,
} from "@/lib/types/flight";

interface FlightsTableProps {
  flights: GetOperatorFlightsResponse;
  onEdit: (flight: OperatorFlight) => void;
  onDelete: (flightId: string) => void;
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

export function FlightsTable({ flights, onEdit, onDelete }: FlightsTableProps) {
  const [deleteFlightId, setDeleteFlightId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteConfirm = () => {
    if (deleteFlightId) {
      onDelete(deleteFlightId);
      setDeleteFlightId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-semibold">
                        {flight.departure_airport?.iata_code}
                      </span>
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-sm font-semibold">
                        {flight.arrival_airport?.iata_code}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {flight.departure_airport?.city} →{" "}
                      {flight.arrival_airport?.city}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">
                    {flight.aircraft?.registration_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flight.aircraft?.manufacturer}{" "}
                    {flight.aircraft?.model_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.aircraft?.seating_capacity} seats
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">
                      {flight.departure_date
                        ? format(new Date(flight.departure_date), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{flight.status}</TableCell>
              <TableCell>
                <div className="font-semibold">
                  {flight.price_usd ? formatCurrency(flight.price_usd) : "N/A"}
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
                    <DropdownMenuItem
                      onClick={() => {
                        // Update URL with flightId parameter instead of directly calling onEdit
                        router.push(`?flightId=${flight.id}`);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Flight
                    </DropdownMenuItem>

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
