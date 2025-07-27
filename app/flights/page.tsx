"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FlightsTable } from "@/components/flights/flights-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar, Plane } from "lucide-react";
import { OperatorFlight } from "@/lib/types/flight";
import { CreateFlightModal } from "@/components/flights/create-flight-modal";
import { UpdateFlightModal } from "@/components/flights/update-flight-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { Skeleton, TableSkeleton } from "@/components/ui/loading-state";
import { toast } from "sonner";
import {
  getFlightWidgets,
  getOperatorFlights,
} from "@/lib/server/flights/flights";

// Custom StatCardSkeleton component for the stats cards
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  );
}

export default function FlightsPage() {
  const [editingFlight, setEditingFlight] = useState<OperatorFlight | null>(
    null
  );
  const searchParams = useSearchParams();
  // Ref to track if we're currently editing a flight to avoid dependency issues
  const editingFlightIdRef = useRef<string | null>(null);

  const { token } = useAuth(true);
  const operator = useAuthStore((state) => state.operator);
  const queryClient = useQueryClient();

  // Function to fetch a single flight by ID
  const fetchFlightById = async (flightId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flightId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Failed to fetch flight");
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching flight:", error);
      toast.error("Failed to load flight details");
      return null;
    }
  };

  // Update the ref when editingFlight changes
  useEffect(() => {
    editingFlightIdRef.current = editingFlight?.id || null;
  }, [editingFlight]);

  // Check for flightId in URL and open edit modal if present
  useEffect(() => {
    const flightId = searchParams.get("flightId");

    if (flightId && token && operator) {
      // Only fetch if we're not already editing this flight
      if (editingFlightIdRef.current !== flightId) {
        fetchFlightById(flightId).then((data) => {
          if (data) {
            setEditingFlight(data.data);
          }
        });
      }
    } else if (!flightId && editingFlightIdRef.current) {
      // Close the modal if flightId is removed from URL
      setEditingFlight(null);
    }
  }, [searchParams, token, operator]);

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
    onSuccess: async () => {
      // Invalidate queries to refresh the data
      await queryClient.refetchQueries({ queryKey: ["flights"] });
      await queryClient.refetchQueries({ queryKey: ["flightWidgets"] });
      toast.success("Flight deleted successfully!");
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
      return data;
    },
    enabled: !!token && !!operator,
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Plane className="h-4 w-4" />
            <span>Flight Schedule Management</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Flight Schedule
              </h1>
              <p className="text-muted-foreground">
                Manage your flight schedules and aircraft assignments
              </p>
            </div>
            <CreateFlightModal />
          </div>

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
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
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
                  onEdit={setEditingFlight}
                  onDelete={(flightId) => deleteMutation.mutate(flightId)}
                />
              ) : (
                <div>No flight data available</div>
              )}
            </CardContent>
          </Card>

          {/* Edit Flight Modal */}
          {editingFlight && (
            <UpdateFlightModal
              flight={editingFlight}
              open={!!editingFlight}
              onOpenChange={(open) => !open && setEditingFlight(null)}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
