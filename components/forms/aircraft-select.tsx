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
import { cn } from "@/lib/utils";
import { getAvailableAircraft } from "@/lib/data/mock-flights";
import {
  Aircraft,
  AircraftStatus,
  AIRCRAFT_STATUS_LABELS,
} from "@/lib/types/flight";

interface AircraftSelectProps {
  label: string;
  value?: string;
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
  showAllAircraft = false,
}: AircraftSelectProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const aircraft = showAllAircraft ? [] : getAvailableAircraft(); // For now, only show available aircraft

  const getStatusColor = (status: AircraftStatus) => {
    switch (status) {
      case AircraftStatus.AVAILABLE:
        return "default";
      case AircraftStatus.IN_FLIGHT:
        return "secondary";
      case AircraftStatus.MAINTENANCE:
        return "destructive";
      case AircraftStatus.OUT_OF_SERVICE:
        return "destructive";
      default:
        return "default";
    }
  };

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
          <SelectValue placeholder="Select an aircraft" />
        </SelectTrigger>
        <SelectContent>
          {aircraft.map((plane) => (
            <SelectItem key={plane.id} value={plane.id}>
              <div className="flex items-center gap-2 w-full">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {plane.registration_number}
                    </span>
                    <Badge
                      variant={getStatusColor(plane.status) as any}
                      className="text-xs"
                    >
                      {AIRCRAFT_STATUS_LABELS[plane.status]}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plane.manufacturer} {plane.model_name} •{" "}
                    {plane.seating_capacity} seats
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {aircraft.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          No available aircraft. Please check aircraft availability.
        </p>
      )}
    </div>
  );
}
