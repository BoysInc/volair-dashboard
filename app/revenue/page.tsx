"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Import the separated components
import RevenueStatsCards from "./components/RevenueStatsCards";
import RevenueChart from "./components/RevenueChart";
import PaymentStatusBreakdown from "./components/PaymentStatusBreakdown";
import RevenueByAircraft from "./components/RevenueByAircraft";

export default function RevenuePage() {
  useAuth(true); // Ensure user is authenticated
  const [selectedPeriod, setSelectedPeriod] = useState<
    "month" | "week" | "day"
  >("month");

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting revenue data...");
  };

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log("Refreshing revenue data...");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="max-h-[100svh] overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Revenue Analytics</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Revenue Overview Stats */}
          <RevenueStatsCards />

          {/* Main Charts and Tables */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="aircraft">By Aircraft</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <RevenueChart
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <PaymentStatusBreakdown />
            </TabsContent>

            <TabsContent value="aircraft" className="space-y-4">
              <RevenueByAircraft />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
