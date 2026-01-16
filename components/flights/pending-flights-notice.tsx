"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useFlightsStore } from "@/lib/store/flights-store";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { OperatorFlight } from "@/lib/types/flight";
import { format } from "date-fns";

interface PendingFlightsNoticeProps {
  flightIds: string[];
  aircraftId: string | null;
  onDismiss: () => void;
  onDelete: (flightId: string) => void;
}

export function PendingFlightsNotice({
  flightIds,
  aircraftId,
  onDismiss,
  onDelete,
}: PendingFlightsNoticeProps) {
  const getFlightById = useFlightsStore((state) => state.getFlightById);
  const openEditModal = useFlightModalStore((state) => state.openEditModal);

  const flights = flightIds
    .map((id) => getFlightById(id))
    .filter((flight): flight is OperatorFlight => flight !== undefined);

  // Show notice even if flight details aren't loaded yet
  if (flightIds.length === 0) {
    return null;
  }

  const handleEditFlight = (flight: OperatorFlight) => {
    openEditModal(flight);
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Cannot Delete Aircraft - Active Flights Found</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-3 mt-2">
        <p className="text-sm">
          This aircraft cannot be deleted because it is assigned to active
          flights. Please either update the aircraft assignment for these flights
          or delete them first.
        </p>
        <div className="space-y-2">
          <p className="font-medium text-sm">Affected flights:</p>
          <ul className="space-y-2">
            {flightIds.map((flightId) => {
              const flight = getFlightById(flightId);
              if (!flight) {
                // Show flight ID if details aren't loaded yet
                return (
                  <li
                    key={flightId}
                    className="flex items-center justify-between p-2 bg-background/50 rounded-md border"
                  >
                    <div className="flex-1">
                      <span className="font-mono text-sm font-semibold">
                        Flight ID: {flightId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(flightId)}
                        className="h-8"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              }
              return (
                <li
                  key={flight.id}
                  className="flex items-center justify-between p-2 bg-background/50 rounded-md border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {flight.departure_airport?.iata_code} →{" "}
                        {flight.arrival_airport?.iata_code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {flight.departure_airport?.city} →{" "}
                        {flight.arrival_airport?.city}
                      </span>
                    </div>
                    {flight.departure_date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(flight.departure_date), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFlight(flight)}
                      className="h-8"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(flight.id)}
                      className="h-8"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
