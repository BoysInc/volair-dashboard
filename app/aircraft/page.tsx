"use client";

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
import { Plus, Plane } from "lucide-react";
import { AddAircraftModal } from "@/components/aircraft/add-aircraft-modal";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import AircraftWidgets from "./components/AircraftWidgets";
import { useAuth } from "@/hooks/use-auth";

export default function AircraftPage() {
  const { openModal } = useAircraftModalStore();
  const { token } = useAuth(true);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-professional-foreground font-bold tracking-tight">
                Aircraft Fleet
              </h1>
              <p className="text-muted-foreground">
                Manage your aircraft fleet, maintenance schedules, and
                availability
              </p>
            </div>
            <Button className="gap-2" onClick={openModal}>
              <Plus className="h-4 w-4" />
              Add Aircraft
            </Button>
          </div>

          <AircraftWidgets />

          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>
                Manage aircraft specifications, status, and maintenance
                schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AircraftTable token={token || ""} />
            </CardContent>
          </Card>

          <AddAircraftModal />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
