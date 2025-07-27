"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw } from "lucide-react";
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
    <DashboardLayout
      title="Revenue Analytics"
      description="Track and analyze revenue performance"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">
            Track and analyze revenue performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
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
    </DashboardLayout>
  );
}
