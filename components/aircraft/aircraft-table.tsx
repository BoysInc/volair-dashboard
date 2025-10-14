"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
  DeleteAircraftError,
} from "@/lib/types/aircraft";
import {
  getStatusBadgeVariant,
  getStatusColor,
  getAvailableStatusTransitions,
  DeleteAircraftErrorEnum,
} from "@/lib/utils/aircraft";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAircraft,
  getOperatorAircrafts,
  updateAircraft,
} from "@/lib/server/aircraft/aircraft";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";
import { toast } from "sonner";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import { DeleteAircraftConfirmationModal } from "./delete-aircraft-confirmation-modal";
import { AircraftFlightsConflictModal } from "./aircraft-flights-conflict-modal";
import { useAuthStore } from "@/lib/store/auth-store";

interface AircraftTableProps {
  token: string;
}

export function AircraftTable({ token }: AircraftTableProps) {
  const { openEditModal } = useAircraftModalStore();
  const queryClient = useQueryClient();

  // State for flights conflict modal
  const [showFlightsModal, setShowFlightsModal] = useState(false);
  const [conflictingFlights, setConflictingFlights] = useState<string[]>([]);
  const [aircraftToDelete, setAircraftToDelete] = useState<string | null>(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const operator = useAuthStore((state) => state.operator);
  const {
    data: aircraftData,
    isLoading: isLoadingAircraft,
    error: aircraftError,
  } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => getOperatorAircrafts(token, operator?.id!),
    enabled: !!token && operator !== null,
  });

  const { data: aircraftDataMemo, error: aircraftErrorMemo } = useMemo(() => {
    const { data, error } = aircraftData || { data: null, error: null };
    return {
      data: data,
      error: error,
    };
  }, [aircraftData, aircraftError]);

  if (isLoadingAircraft) {
    return <LoadingState />;
  }

  if (aircraftErrorMemo !== null) {
    return <ErrorState />;
  }

  const handleStatusUpdate = async (
    aircraftId: string,
    newStatus: AircraftStatus
  ) => {
    const { data, error } = await updateAircraft(
      token,
      aircraftId,
      {
        status: newStatus,
      },
      operator?.id!
    );
    if (error !== null) {
      console.error("Error updating aircraft status:", error);
      toast.error("Error updating aircraft status");
      return;
    }

    toast.success("Aircraft status updated");
    // First invalidate, then refetch to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
    await queryClient.refetchQueries({ queryKey: ["aircrafts"] });
    await queryClient.invalidateQueries({ queryKey: ["aircraftWidgets"] });
    await queryClient.refetchQueries({ queryKey: ["aircraftWidgets"] });
    return;
  };

  const handleDeleteClick = (aircraftId: string) => {
    setAircraftToDelete(aircraftId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!aircraftToDelete) return;

    setIsDeleting(true);
    const { error } = await deleteAircraft(
      token,
      aircraftToDelete,
      operator?.id!
    );

    if (error !== null) {
      if (
        typeof error === "object" &&
        error.message === DeleteAircraftErrorEnum.AIRCRAFT_WITH_FLIGHTS
      ) {
        try {
          const errorData = error as DeleteAircraftError;
          if (errorData.errors?.flights) {
            setConflictingFlights(errorData.errors.flights);
            setShowDeleteModal(false);
            setShowFlightsModal(true);
            setIsDeleting(false);
            return;
          }
        } catch {
          toast.error("Cannot delete aircraft with flights");
          setIsDeleting(false);
          return;
        }
      }
      toast.error("Error deleting aircraft: " + error);
      setIsDeleting(false);
      return;
    }

    toast.success("Aircraft deleted successfully");
    // First invalidate, then refetch to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
    await queryClient.refetchQueries({ queryKey: ["aircrafts"] });
    await queryClient.invalidateQueries({ queryKey: ["aircraftWidgets"] });
    await queryClient.refetchQueries({ queryKey: ["aircraftWidgets"] });
    setShowDeleteModal(false);
    setAircraftToDelete(null);
    setIsDeleting(false);
    return;
  };

  if (aircraftDataMemo === null) {
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
            {aircraftDataMemo.map((ac: Aircraft) => (
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
                    {ac.status}
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
                      <DropdownMenuItem onClick={() => openEditModal(ac)}>
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
                              handleStatusUpdate(ac.id, transition.status)
                            }
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            {transition.label}
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(ac.id)}
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

      {/* Modal Components */}
      <AircraftFlightsConflictModal
        open={showFlightsModal}
        onOpenChange={setShowFlightsModal}
        conflictingFlights={conflictingFlights}
        onClose={() => {
          setShowFlightsModal(false);
          setConflictingFlights([]);
          setAircraftToDelete(null);
        }}
      />

      <DeleteAircraftConfirmationModal
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) {
            setAircraftToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
