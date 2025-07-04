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
import { mockAirports } from "@/lib/data/mock-flights";
import { Airport } from "@/lib/types/flight";

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
  const availableAirports = excludeAirportId
    ? mockAirports.filter((airport) => airport.id !== excludeAirportId)
    : mockAirports;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue placeholder="Select an airport" />
        </SelectTrigger>
        <SelectContent>
          {availableAirports.map((airport) => (
            <SelectItem key={airport.id} value={airport.id}>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">
                  {airport.iata_code}
                </span>
                <span>-</span>
                <span>{airport.name}</span>
                <span className="text-muted-foreground">({airport.city})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
