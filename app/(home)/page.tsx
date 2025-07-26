"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardOverview } from "@/components/dashboard-overview";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex justify-center items-center w-full"
    >
      <AppSidebar />
      <SidebarInset className="relative max-h-[100svh] overflow-y-auto bg-professional-background">
        <header className="flex h-16 shrink-0 items-center gap-4 px-6 z-10 sticky top-0 bg-professional-background/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <SidebarTrigger className="hover:bg-professional-background/80 text-slate-600 hover:text-background transition-colors" />
          <Separator
            orientation="vertical"
            className="h-6 bg-professional-background/80"
          />
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground leading-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Welcome back, monitor your operations
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-slate-500">
                Last updated:{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-6">
          <DashboardOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
