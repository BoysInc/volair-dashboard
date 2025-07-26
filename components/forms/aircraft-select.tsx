"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumberWithCommas } from "@/lib/utils";
import {
  Aircraft,
  AircraftStatus,
  AIRCRAFT_STATUS_LABELS,
} from "@/lib/types/flight";
import {useAuth} from "@/hooks/use-auth";
import {useQuery} from "@tanstack/react-query";
import React, {useEffect} from "react";

interface AircraftSelectProps {
  label: string;
  value?: Aircraft;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showAllAircraft?: boolean; // If true, shows all aircraft; if false, shows only available
}

export function AircraftSelect({
  label,
  value,
  onChange,
  error,
  required = false,
  className,
  disabled = false,
}: AircraftSelectProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const { token } = useAuth(true);
  const { data: aircraftData, isLoading } = useQuery({
    queryKey: ["aircraft"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/aircraft`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch aircraft");
      }

      return response.json()
    },
    enabled: !!token,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value?.id || ""} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger
          className={cn('mt-2', error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue placeholder={isLoading ? "Loading..." : "Select an aircraft"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="p-2 text-center">Loading aircraft...</div>
          ) : aircraftData.data && aircraftData.data.length > 0 ? (
            aircraftData.data.map((plane: Aircraft) => (
              <SelectItem key={plane.id} value={plane.id}>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        {plane.registration_number}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plane.manufacturer} {plane.model_name} •{" "}
                      {plane.seating_capacity} seats
                      {plane.price_per_hour_usd && (
                        <> • <span className="font-semibold text-green-600">${formatNumberWithCommas(plane.price_per_hour_usd)}/hr</span></>
                      )}
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
      {!isLoading && aircraftData.data && aircraftData.data.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          No available aircraft. Please add aircraft to your account.{" "}
        </p>
      )}
    </div>
  );
}
