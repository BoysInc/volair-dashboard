"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getOperatorAircrafts } from "@/lib/server/aircraft/aircraft";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAircraftsStore } from "@/lib/store/aircrafts-store";
import { Aircraft } from "@/lib/types/aircraft";
import { FlightAircraft } from "@/lib/types/flight";

interface AircraftSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showAllAircraft?: boolean;
  initialAircraftData?: Aircraft | FlightAircraft | null;
}

export function AircraftSelect({
  label,
  value,
  onChange,
  error,
  required = false,
  className,
  disabled = false,
  showAllAircraft = false,
  initialAircraftData = null,
}: AircraftSelectProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const { token } = useAuth(true);
  const { operator } = useAuthStore();

  // Get aircrafts from Zustand store
  const storeAircrafts = useAircraftsStore((state) => state.aircrafts);
  const setAircrafts = useAircraftsStore((state) => state.setAircrafts);
  const setLoading = useAircraftsStore((state) => state.setLoading);
  const setError = useAircraftsStore((state) => state.setError);

  // TanStack Query to fetch and sync with store
  const { data: aircraftData, isLoading } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: async () => {
      setLoading(true);
      const response = await getOperatorAircrafts(token, operator?.id || "");

      if (response.error) {
        setError(response.error);
        setLoading(false);
        throw new Error(response.error);
      }

      // Sync to Zustand store
      if (response.data) {
        setAircrafts(response.data);
      }
      setLoading(false);
      return response.data;
    },
    enabled: !!token && !!operator,
  });

  // Determine which data to display
  const displayAircraftData = React.useMemo(() => {
    // Prefer store data if available
    if (storeAircrafts && storeAircrafts.length > 0) {
      return showAllAircraft
        ? storeAircrafts
        : storeAircrafts.filter((a) => a.status === "Available");
    }

    // Fallback to query data
    if (aircraftData && aircraftData.length > 0) {
      return showAllAircraft
        ? aircraftData
        : aircraftData.filter((a) => a.status === "Available");
    }

    // If we have initial aircraft data (for editing), show it
    if (initialAircraftData) {
      return [initialAircraftData as Aircraft];
    }

    return [];
  }, [storeAircrafts, aircraftData, showAllAircraft, initialAircraftData]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={cn("mt-2", error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue
            placeholder={isLoading ? "Loading..." : "Select an aircraft"}
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="p-2 text-center">Loading aircraft...</div>
          ) : displayAircraftData && displayAircraftData.length > 0 ? (
            displayAircraftData.map((plane: Aircraft) => (
              <SelectItem key={plane.id} value={plane.id}>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        {plane.registration_number}
                      </span>
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="text-sm text-muted-foreground">
                      {plane.manufacturer} {plane.model_name} •{" "}
                      {plane.seating_capacity} seats
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center">No aircraft available</div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {!isLoading &&
        displayAircraftData &&
        displayAircraftData.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            No available aircraft. Please add aircraft to your account.
          </p>
        )}
    </div>
  );
}
