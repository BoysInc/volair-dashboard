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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton, TableSkeleton } from "@/components/ui/loading-state";
import { AirportsTable } from "@/components/airports/airports-table";
import { AirportForm } from "@/components/airports/airport-form";

export default function AirportsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);

  const { token } = useAuth(true);
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
                  onDelete={() => {}}
                />
              )}
            </CardContent>
          </Card>

          {/* Edit Airport Dialog */}
          <Dialog
            open={!!editingAirport}
            onOpenChange={(open) => !open && setEditingAirport(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Airport</DialogTitle>
                <DialogDescription>
                  Update airport details and location information.
                </DialogDescription>
              </DialogHeader>
              {editingAirport && (
                <AirportForm
                  airport={editingAirport}
                  onCancel={() => setEditingAirport(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}