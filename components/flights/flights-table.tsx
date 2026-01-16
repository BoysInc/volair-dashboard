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
  Eye,
} from "lucide-react";
import { GetOperatorFlightsResponse } from "@/lib/types/flight";
import { TZDate } from "@date-fns/tz";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";

interface FlightsTableProps {
  flights: GetOperatorFlightsResponse;
  onDelete: (flightId: string) => void;
}

export function FlightsTable({ flights, onDelete }: FlightsTableProps) {
  const [deleteFlightId, setDeleteFlightId] = useState<string | null>(null);
  const openEditModal = useFlightModalStore((state) => state.openEditModal);
  const openViewModal = useFlightModalStore((state) => state.openViewModal);

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
          {flights.length > 0 &&
            flights?.map((flight) => (
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
                          ? formatServerDate(flight.departure_date)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{flight.status}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        One-way:
                      </span>
                      <span className="font-semibold">
                        {flight.one_way_price_usd
                          ? formatCurrency(flight.one_way_price_usd)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Round-trip:
                      </span>
                      <span className="font-semibold">
                        {flight.round_trip_price_usd
                          ? formatCurrency(flight.round_trip_price_usd)
                          : "N/A"}
                      </span>
                    </div>
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
                          openViewModal(flight);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          openEditModal(flight);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
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

const formatServerDate = (serverDate: string): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateInUsersTimezone = new TZDate(serverDate, timezone);

    return format(dateInUsersTimezone, "EEEE, MMMM d h:mm aaa");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
