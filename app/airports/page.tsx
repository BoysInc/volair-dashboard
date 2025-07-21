"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import { Plus, MapPin, Building } from "lucide-react";
import { Airport } from "@/lib/types/flight";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton, TableSkeleton } from "@/components/ui/loading-state";
import { AirportsTable } from "@/components/airports/airports-table";
import { AirportForm } from "@/components/airports/airport-form";
import { UpdateAirportModal } from "@/components/airports/update-airport-modal";
import { toast } from "sonner";

export default function AirportsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);

  const { token } = useAuth(true);
  const queryClient = useQueryClient();
  
  const { data: airports, isLoading } = useQuery({
    queryKey: ["airports"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }

      return response.json()
    },
    enabled: !!token,
  });
  
  const deleteAirportMutation = useMutation({
    mutationFn: async (airportId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports/${airportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete airport");
      }
      
      // Handle 204 No Content response
      if (response.status === 204) {
        return null; // No content to return
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airports"] });
      toast.success("Airport deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting airport:", error);
      toast.error("Failed to delete airport. Please try again.");
    },
  });
  
  const handleDeleteAirport = (airportId: string) => {
    deleteAirportMutation.mutate(airportId);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Airport Management</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Airports
              </h1>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Airport
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Airport</DialogTitle>
                </DialogHeader>
                <AirportForm
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Airports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Airport Database</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !airports ? (
                <TableSkeleton rows={5} />
              ) : (
                <AirportsTable
                  airports={airports?.data ?? []}
                  onEdit={setEditingAirport}
                  onDelete={handleDeleteAirport}
                />
              )}
            </CardContent>
          </Card>

          {/* Edit Airport Modal */}
          {editingAirport && (
            <UpdateAirportModal
              airport={editingAirport}
              open={!!editingAirport}
              onOpenChange={(open) => !open && setEditingAirport(null)}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}