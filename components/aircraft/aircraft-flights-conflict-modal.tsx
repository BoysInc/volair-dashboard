"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { ExternalLink } from "lucide-react";

interface AircraftFlightsConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingFlights: string[];
  onClose: () => void;
}

export function AircraftFlightsConflictModal({
  open,
  onOpenChange,
  conflictingFlights,
  onClose,
}: AircraftFlightsConflictModalProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure this only runs on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFlightClick = (flightId: string) => {
    if (!isMounted) return;
    router.push(`/flights?flightId=${flightId}`);
    onClose();
  };

  const handleGoToFlights = () => {
    if (!isMounted) return;
    if (conflictingFlights && conflictingFlights.length > 0) {
      const flightId = conflictingFlights[0];
      router.push(`/flights?flightId=${flightId}`);
      onClose();
    }
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cannot Delete Aircraft</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="text-sm">
              This aircraft cannot be deleted because it is assigned to active
              flights. You need to either update the aircraft assignment or
              delete the flights first.
            </span>
            <div>
              <p className="font-medium mb-2">Conflicting flights:</p>
              <ul className="list-disc list-inside space-y-1">
                {conflictingFlights?.map((flightId) => (
                  <li key={flightId} className="text-sm font-mono">
                    <button
                      onClick={() => handleFlightClick(flightId)}
                      className="text-primary hover:text-primary/90 hover:underline cursor-pointer"
                    >
                      {flightId}
                    </button>
                  </li>
                )) || []}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleGoToFlights}
            className="bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to Flights
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
