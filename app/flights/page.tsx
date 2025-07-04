"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FlightsTable } from "@/components/flights/flights-table";
// import { FlightForm } from "@/components/flights/flight-form";
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
import { getFlightsWithDetails } from "@/lib/data/mock-flights";
import {
  FlightWithDetails,
  FlightFormData,
  FlightStatus,
} from "@/lib/types/flight";
import { FlightForm } from "@/components/flights/flight-form";

export default function FlightsPage() {
  const [flights, setFlights] = useState<FlightWithDetails[]>(
    getFlightsWithDetails()
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightWithDetails | null>(
    null
  );

  const handleCreateFlight = (data: FlightFormData) => {
    // In a real app, this would make an API call
    console.log("Creating flight:", data);
    setIsCreateDialogOpen(false);
    // Refresh flights list
    setFlights(getFlightsWithDetails());
  };

  const handleEditFlight = (data: FlightFormData) => {
    // In a real app, this would make an API call
    console.log("Editing flight:", editingFlight?.id, data);
    setEditingFlight(null);
    // Refresh flights list
    setFlights(getFlightsWithDetails());
  };

  const handleDeleteFlight = (flightId: string) => {
    // In a real app, this would make an API call
    console.log("Deleting flight:", flightId);
    setFlights(flights.filter((f) => f.id !== flightId));
  };

  const handleStatusUpdate = (flightId: string, newStatus: FlightStatus) => {
    // In a real app, this would make an API call
    console.log("Updating flight status:", flightId, newStatus);
    setFlights((prevFlights) =>
      prevFlights.map((flight) =>
        flight.id === flightId ? { ...flight, status: newStatus } : flight
      )
    );
  };

  const totalFlights = flights.length;
  const activeFlights = flights.filter((f) => f.status <= 3).length; // Scheduled, Boarding, Departed, In Flight
  const completedFlights = flights.filter((f) => f.status === 4).length; // Arrived

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
                  onSubmit={handleCreateFlight}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Flights
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFlights}</div>
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
                <div className="text-2xl font-bold">{activeFlights}</div>
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
                <div className="text-2xl font-bold">{completedFlights}</div>
                <p className="text-xs text-muted-foreground">
                  Flights completed
                </p>
              </CardContent>
            </Card>
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
              <FlightsTable
                flights={flights}
                onEdit={setEditingFlight}
                onDelete={handleDeleteFlight}
                onStatusUpdate={handleStatusUpdate}
              />
            </CardContent>
          </Card>

          {/* Edit Flight Dialog */}
          <Dialog
            open={!!editingFlight}
            onOpenChange={(open) => !open && setEditingFlight(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Flight</DialogTitle>
                <DialogDescription>
                  Update flight details and schedule information.
                </DialogDescription>
              </DialogHeader>
              {editingFlight && (
                <FlightForm
                  flight={editingFlight}
                  onSubmit={handleEditFlight}
                  onCancel={() => setEditingFlight(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
