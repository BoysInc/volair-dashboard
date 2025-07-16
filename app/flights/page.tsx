"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FlightsTable } from "@/components/flights/flights-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, Plane } from "lucide-react";
import {
  FlightWithDetails,
  FlightFormData,
  FlightStatus,
} from "@/lib/types/flight";
import { FlightForm } from "@/components/flights/flight-form";
import { UpdateFlightModal } from "@/components/flights/update-flight-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {getOperatorAircrafts} from "@/lib/server/aircraft/aircraft";
import {useAuth} from "@/hooks/use-auth";
import {useAuthStore} from "@/lib/store/auth-store";
import { Skeleton, TableSkeleton } from "@/components/ui/loading-state";
import { toast } from "sonner";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightWithDetails | null>(
    null
  );

  const { token } = useAuth(true);
  const operator = useAuthStore((state) => state.operator);
  const queryClient = useQueryClient();

  // Delete flight mutation
  const deleteMutation = useMutation({
    mutationFn: async (flightId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/${flightId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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
      await queryClient.invalidateQueries({queryKey: ['flights']});
      await queryClient.invalidateQueries({queryKey: ['flightWidgets']});
      toast.success("Flight deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting flight:", error);
      toast.error("Failed to delete flight. Please try again.");
    },
  });
  const { data } = useQuery({
    queryKey: ["flightWidgets"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights/widgets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch flight widgets");
      }

      return response.json()
    },
    enabled: !!token,
  });

  const { data: flights, isLoading} = useQuery({
    queryKey: ["flights"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator?.id}/flights`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch flights");
      }

      return response.json()
    },
    enabled: !!token,
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
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Flight
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Flight</DialogTitle>
                  <DialogDescription>
                    Create a new flight schedule by selecting aircraft, route,
                    and timing.
                  </DialogDescription>
                </DialogHeader>
                <FlightForm
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Use the first query's isLoading state to determine whether to show skeletons */}
            {!data ? (
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
                    <div className="text-2xl font-bold">{data?.today_flights}</div>
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
                    <div className="text-2xl font-bold">{data?.active_flights}</div>
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
                    <div className="text-2xl font-bold">{data?.completed_flights}</div>
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
              ) : flights && flights.data ? (
                <FlightsTable
                  flights={flights.data}
                  onEdit={setEditingFlight}
                  onDelete={(flightId) => deleteMutation.mutate(flightId)}
                  onStatusUpdate={() => {}}
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
