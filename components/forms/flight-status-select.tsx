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
import { FlightStatus, FLIGHT_STATUS_LABELS } from "@/lib/types/flight";
import {
  AlertTriangle,
  Clock,
  Plane,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface FlightStatusSelectProps {
  label: string;
  value?: FlightStatus;
  onChange: (value: FlightStatus) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
}

const getStatusIcon = (status: FlightStatus) => {
  switch (status) {
    case FlightStatus.SCHEDULED:
      return <Clock className="h-3 w-3" />;
    case FlightStatus.BOARDING:
      return <AlertTriangle className="h-3 w-3" />;
    case FlightStatus.DEPARTED:
    case FlightStatus.IN_FLIGHT:
      return <Plane className="h-3 w-3" />;
    case FlightStatus.ARRIVED:
      return <CheckCircle className="h-3 w-3" />;
    case FlightStatus.DELAYED:
      return <AlertTriangle className="h-3 w-3" />;
    case FlightStatus.CANCELLED:
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

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

// Define which statuses operators can typically set
const operatorEditableStatuses = [
  FlightStatus.SCHEDULED,
  FlightStatus.BOARDING,
  FlightStatus.DEPARTED,
  FlightStatus.DELAYED,
  FlightStatus.CANCELLED,
];

export function FlightStatusSelect({
  label,
  value,
  onChange,
  error,
  required = false,
  className,
  disabled = false,
  showIcon = true,
}: FlightStatusSelectProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const handleValueChange = (stringValue: string) => {
    const statusValue = parseInt(stringValue) as FlightStatus;
    onChange(statusValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value !== undefined ? value.toString() : ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue placeholder="Select flight status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key={status} value={status.toString()}>
            <div className="flex items-center gap-2 w-full">
              <Badge
                  variant={getStatusColor(status) as any}
                  className="text-xs flex items-center gap-1"
              >
                {showIcon && getStatusIcon(status)}
                {FLIGHT_STATUS_LABELS[status]}
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
