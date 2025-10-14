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
import { Airport } from "@/lib/types/flight";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import React from "react";

interface AirportSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  excludeAirportId?: string; // To exclude selected departure airport from arrival options
}

export function AirportSelect({
  label,
  value,
  onChange,
  error,
  required = false,
  className,
  disabled = false,
  excludeAirportId,
}: AirportSelectProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const { token } = useAuth(true);
  const { data: airports, isLoading } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }

      return response.json();
    },
    enabled: !!token,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn("mt-2", error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue placeholder="Select an airport" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="p-2 text-center">Loading aircraft...</div>
          ) : (
            airports?.data
              .filter(
                (airport: Airport) =>
                  !excludeAirportId || airport.id !== excludeAirportId
              )
              .map((airport: Airport) => (
                <SelectItem key={airport.id} value={airport.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {airport.iata_code}
                    </span>
                    <span>-</span>
                    <span>{airport.name}</span>
                    <span className="text-muted-foreground">
                      ({airport.city})
                    </span>
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
