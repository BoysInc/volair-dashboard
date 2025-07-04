"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AircraftTable } from "@/components/aircraft/aircraft-table";
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
import { Plus, Plane, Settings, Activity, Wifi, Users } from "lucide-react";
import { mockAircrafts } from "@/lib/data/mock-flights";
import { AircraftForm } from "@/components/aircraft/aircraft-form";
import {
  Aircraft,
  AircraftFormData,
  AircraftStatus,
} from "@/lib/types/aircraft";

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(mockAircrafts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);

  const handleCreateAircraft = (data: AircraftFormData) => {
    // In a real app, this would make an API call
    const newAircraft: Aircraft = {
      id: `ac-${Date.now()}`,
      operator_id: "op-1",
      ...data,
    };
    console.log("Creating aircraft:", newAircraft);
    setAircraft([...aircraft, newAircraft]);
    setIsCreateDialogOpen(false);
  };

  const handleEditAircraft = (data: AircraftFormData) => {
    if (!editingAircraft) return;

    // In a real app, this would make an API call
    console.log("Editing aircraft:", editingAircraft.id, data);
    setAircraft((prevAircraft) =>
      prevAircraft.map((ac) =>
        ac.id === editingAircraft.id ? { ...ac, ...data } : ac
      )
    );
    setEditingAircraft(null);
  };

  const handleDeleteAircraft = (aircraftId: string) => {
    // In a real app, this would make an API call
    console.log("Deleting aircraft:", aircraftId);
    setAircraft(aircraft.filter((ac) => ac.id !== aircraftId));
  };

  const handleStatusUpdate = (
    aircraftId: string,
    newStatus: AircraftStatus
  ) => {
    // In a real app, this would make an API call
    console.log("Updating aircraft status:", aircraftId, newStatus);
    setAircraft((prevAircraft) =>
      prevAircraft.map((ac) =>
        ac.id === aircraftId ? { ...ac, status: newStatus } : ac
      )
    );
  };

  // Calculate fleet statistics
  const totalAircraft = aircraft.length;
  const availableAircraft = aircraft.filter(
    (ac) => ac.status === AircraftStatus.AVAILABLE
  ).length;
  const inFlightAircraft = aircraft.filter(
    (ac) => ac.status === AircraftStatus.IN_FLIGHT
  ).length;
  const maintenanceAircraft = aircraft.filter(
    (ac) => ac.status === AircraftStatus.MAINTENANCE
  ).length;
  const totalSeats = aircraft.reduce((sum, ac) => sum + ac.seating_capacity, 0);
  const wifiEquippedAircraft = aircraft.filter(
    (ac) => ac.wifi_available
  ).length;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Plane className="h-4 w-4" />
            <span>Aircraft Fleet Management</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Aircraft Fleet
              </h1>
              <p className="text-muted-foreground">
                Manage your aircraft fleet, maintenance schedules, and
                availability
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Aircraft
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Aircraft</DialogTitle>
                  <DialogDescription>
                    Add a new aircraft to your fleet with specifications and
                    details.
                  </DialogDescription>
                </DialogHeader>
                <AircraftForm
                  onSubmit={handleCreateAircraft}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Fleet Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Aircraft
                </CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAircraft}</div>
                <p className="text-xs text-muted-foreground">In your fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {availableAircraft}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for service
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Flight</CardTitle>
                <Plane className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {inFlightAircraft}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Maintenance
                </CardTitle>
                <Settings className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {maintenanceAircraft}
                </div>
                <p className="text-xs text-muted-foreground">
                  Under maintenance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fleet Capabilities */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Capacity
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSeats}</div>
                <p className="text-xs text-muted-foreground">
                  Total passenger seats
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  WiFi Equipped
                </CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wifiEquippedAircraft}</div>
                <p className="text-xs text-muted-foreground">
                  of {totalAircraft} aircraft (
                  {Math.round((wifiEquippedAircraft / totalAircraft) * 100)}%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Aircraft Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>
                Manage aircraft specifications, status, and maintenance
                schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AircraftTable
                aircraft={aircraft}
                onEdit={setEditingAircraft}
                onDelete={handleDeleteAircraft}
                onStatusUpdate={handleStatusUpdate}
              />
            </CardContent>
          </Card>

          {/* Edit Aircraft Dialog */}
          <Dialog
            open={!!editingAircraft}
            onOpenChange={(open) => !open && setEditingAircraft(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Aircraft</DialogTitle>
                <DialogDescription>
                  Update aircraft specifications and details.
                </DialogDescription>
              </DialogHeader>
              {editingAircraft && (
                <AircraftForm
                  aircraft={editingAircraft}
                  onSubmit={handleEditAircraft}
                  onCancel={() => setEditingAircraft(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
