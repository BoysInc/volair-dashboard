"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Plane,
  Wifi,
  WifiOff,
  MapPin,
  Gauge,
  Users,
} from "lucide-react";
import {
  Aircraft,
  AircraftStatus,
  AIRCRAFT_STATUS_LABELS,
} from "@/lib/types/aircraft";

interface AircraftTableProps {
  aircraft: Aircraft[];
  onEdit: (aircraft: Aircraft) => void;
  onDelete: (aircraftId: string) => void;
  onStatusUpdate: (aircraftId: string, newStatus: AircraftStatus) => void;
}

export function AircraftTable({
  aircraft,
  onEdit,
  onDelete,
  onStatusUpdate,
}: AircraftTableProps) {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: AircraftStatus) => {
    switch (status) {
      case AircraftStatus.AVAILABLE:
        return "default";
      case AircraftStatus.IN_FLIGHT:
        return "secondary";
      case AircraftStatus.MAINTENANCE:
        return "destructive";
      case AircraftStatus.OUT_OF_SERVICE:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: AircraftStatus) => {
    switch (status) {
      case AircraftStatus.AVAILABLE:
        return "text-green-600";
      case AircraftStatus.IN_FLIGHT:
        return "text-blue-600";
      case AircraftStatus.MAINTENANCE:
        return "text-orange-600";
      case AircraftStatus.OUT_OF_SERVICE:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getAvailableStatusTransitions = (currentStatus: AircraftStatus) => {
    switch (currentStatus) {
      case AircraftStatus.AVAILABLE:
        return [
          { status: AircraftStatus.IN_FLIGHT, label: "Mark as In Flight" },
          { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
          {
            status: AircraftStatus.OUT_OF_SERVICE,
            label: "Take Out of Service",
          },
        ];
      case AircraftStatus.IN_FLIGHT:
        return [
          { status: AircraftStatus.AVAILABLE, label: "Mark as Available" },
          { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
        ];
      case AircraftStatus.MAINTENANCE:
        return [
          { status: AircraftStatus.AVAILABLE, label: "Return to Service" },
          {
            status: AircraftStatus.OUT_OF_SERVICE,
            label: "Take Out of Service",
          },
        ];
      case AircraftStatus.OUT_OF_SERVICE:
        return [
          { status: AircraftStatus.AVAILABLE, label: "Return to Service" },
          { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
        ];
      default:
        return [];
    }
  };

  if (aircraft.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Aircraft</CardTitle>
          <CardDescription>
            You haven't added any aircraft to your fleet yet. Click "Add
            Aircraft" to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Aircraft</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Specifications</TableHead>
              <TableHead>Range & Speed</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aircraft.map((ac) => (
              <TableRow key={ac.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Plane className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{ac.model_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {ac.manufacturer}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm font-medium">
                    {ac.registration_number}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {ac.wifi_available ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Wifi className="h-3 w-3" />
                        <span className="text-xs">WiFi</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <WifiOff className="h-3 w-3" />
                        <span className="text-xs">No WiFi</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{ac.range_km.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      <span>{ac.speed_kph.toLocaleString()} kph</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{ac.seating_capacity} seats</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(ac.status)}
                    className={getStatusColor(ac.status)}
                  >
                    {AIRCRAFT_STATUS_LABELS[ac.status]}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => onEdit(ac)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Aircraft
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Status Updates</DropdownMenuLabel>
                      {getAvailableStatusTransitions(ac.status).map(
                        (transition) => (
                          <DropdownMenuItem
                            key={transition.status}
                            onClick={() =>
                              onStatusUpdate(ac.id, transition.status)
                            }
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            {transition.label}
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(ac.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Aircraft
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
