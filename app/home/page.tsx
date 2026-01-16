"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function Page() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back, monitor your operations"
    >
      <DashboardOverview />
    </DashboardLayout>
  );
}
