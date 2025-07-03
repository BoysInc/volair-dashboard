"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function Page() {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex justify-center items-center w-full"
    >
      <AppSidebar />
      <SidebarInset className="relative">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 z-10 absolute top-0 right-0">
          <SidebarTrigger className="" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 mt-16 w-9/12 mx-auto">
          <DashboardOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
