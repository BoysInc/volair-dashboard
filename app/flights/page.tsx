"use client";

import { Suspense, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FlightsTable } from "@/components/flights/flights-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plane } from "lucide-react";
import { CreateFlightModal } from "@/components/flights/create-flight-modal";
import { EditFlightModal } from "@/components/flights/edit-flight-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { useFlightsStore } from "@/lib/store/flights-store";
import { TableSkeleton } from "@/components/ui/loading-state";
import { toast } from "sonner";
import {
  getFlightWidgets,
  getOperatorFlights,
} from "@/lib/server/flights/flights";
import { invalidateAndRefetchQueries } from "@/lib/utils";
import { StatCardSkeleton } from "@/components/flights/skeleton/StatCardSkeleton";
import { ViewFlightModal } from "@/components/flights/view-flight-modal";
import { usePendingFlightsStore } from "@/lib/store/pending-flights-store";
import { PendingFlightsNotice } from "@/components/flights/pending-flights-notice";

// Component that uses searchParams - needs to be wrapped in Suspense
function FlightsContent() {
  const { token } = useAuth(true);
  const operator = useAuthStore((state) => state.operator);
  const queryClient = useQueryClient();

  // Get editing flight from Zustand store
  const editingFlight = useFlightModalStore((state) => state.editingFlight);
  const isEditMode = useFlightModalStore((state) => state.isEditMode);
  const closeModal = useFlightModalStore((state) => state.closeModal);

  // Pending flights store
  const pendingFlightIds = usePendingFlightsStore(
    (state) => state.pendingFlightIds
  );
  const aircraftId = usePendingFlightsStore((state) => state.aircraftId);
  const clearPendingFlights = usePendingFlightsStore(
    (state) => state.clearPendingFlights
  );
  const getFlightById = useFlightsStore((state) => state.getFlightById);

  // Delete flight mutation
  const deleteMutation = useMutation({
    mutationFn: async (flightId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flightId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete flight");
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return { success: true };
      }

      return response.json();
    },
    onSuccess: async (_, flightId) => {
      // Invalidate queries to refresh the data
      invalidateAndRefetchQueries(queryClient, ["flights", "flightWidgets"]);
      toast.success("Flight deleted successfully!");

      // Check if this was a pending flight and clear if all are resolved
      if (pendingFlightIds.includes(flightId)) {
        const remainingPendingFlights = pendingFlightIds.filter(
          (id) => id !== flightId
        );
        if (remainingPendingFlights.length === 0) {
          clearPendingFlights();
        }
      }
    },
    onError: (error) => {
      console.error("Error deleting flight:", error);
      toast.error("Failed to delete flight. Please try again.");
    },
  });
  const { data: flightWidgets } = useQuery({
    queryKey: ["flightWidgets"],
    queryFn: async () => {
      const { data, error } = await getFlightWidgets(operator?.id || "", token);

      if (error !== null) {
        throw new Error("Failed to fetch flight widgets");
      }
      return data;
    },
    enabled: !!token && !!operator,
  });

  // Zustand store
  const setFlights = useFlightsStore((state) => state.setFlights);

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights"],
    queryFn: async () => {
      const { data, error } = await getOperatorFlights(
        operator?.id || "",
        token
      );

      if (error !== null) {
        throw new Error("Failed to fetch flights");
      }

      // Sync to Zustand store
      if (data) {
        setFlights(data);
      }

      return data;
    },
    enabled: !!token && !!operator,
    refetchOnMount: true,
  });

  // Check if pending flights have been resolved (aircraft changed or deleted)
  useEffect(() => {
    if (pendingFlightIds.length === 0 || !flights || !aircraftId) {
      return;
    }

    // Check if all pending flights have been resolved
    const unresolvedFlights = pendingFlightIds.filter((flightId) => {
      const flight = getFlightById(flightId);
      // Flight is resolved if it doesn't exist (deleted) or aircraft has changed
      return flight && flight.aircraft.id === aircraftId;
    });

    // If all flights are resolved, clear the pending state
    if (unresolvedFlights.length === 0) {
      clearPendingFlights();
    }
  }, [flights, pendingFlightIds, aircraftId, getFlightById, clearPendingFlights]);

  const handleDismissNotice = () => {
    clearPendingFlights();
  };

  const handleDeleteFlight = (flightId: string) => {
    deleteMutation.mutate(flightId);
  };

  return (
    <DashboardLayout
      title="Flight Schedule"
      description="Manage your flight schedules and aircraft assignments"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flight Schedule</h1>
          <p className="text-muted-foreground">
            Manage your flight schedules and aircraft assignments
          </p>
        </div>
        <CreateFlightModal />
      </div>

      {/* Pending Flights Notice */}
      {pendingFlightIds.length > 0 && (
        <PendingFlightsNotice
          flightIds={pendingFlightIds}
          aircraftId={aircraftId}
          onDismiss={handleDismissNotice}
          onDelete={handleDeleteFlight}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Use the first query's isLoading state to determine whether to show skeletons */}
        {!flightWidgets ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Flights
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {flightWidgets?.today_flights}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled for today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Flights
                </CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {flightWidgets?.active_flights}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {flightWidgets?.completed_flights}
                </div>
                <p className="text-xs text-muted-foreground">
                  Flights completed
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Schedule</CardTitle>
          <CardDescription>
            View and manage all scheduled flights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : flights ? (
            <FlightsTable
              flights={flights}
              onDelete={(flightId) => deleteMutation.mutate(flightId)}
            />
          ) : (
            <div>No flight data available</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Flight Modal */}
      <EditFlightModal />
      <ViewFlightModal />
    </DashboardLayout>
  );
}

// Main page component with Suspense boundary
export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout
          title="Flight Schedule"
          description="Manage your flight schedules and aircraft assignments"
        >
          {/* Loading fallback */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Flight Schedule
              </h1>
              <p className="text-muted-foreground">
                Manage your flight schedules and aircraft assignments
              </p>
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>

          {/* Stats Cards Loading */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Table Loading */}
          <Card>
            <CardHeader>
              <CardTitle>Flight Schedule</CardTitle>
              <CardDescription>
                All scheduled flights for your operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={5} />
            </CardContent>
          </Card>
        </DashboardLayout>
      }
    >
      <FlightsContent />
    </Suspense>
  );
}
