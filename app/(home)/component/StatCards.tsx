import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  DashboardStats,
  getDashboardStats,
} from "@/lib/server/dashboard/dashboard";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  DollarSign,
  Equal,
  Plane,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";

const StatCards = ({ token }: { token: string }) => {
  const {
    data: stats,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(token),
    enabled: !!token,
  });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (stats?.error !== null && stats?.error !== undefined) {
    return <ErrorState message={stats.error} />;
  }

  if (stats?.data === null || stats?.data === undefined) {
    return <ErrorState message="No data found" />;
  }

  const {
    total_aircraft,
    active_flights,
    total_bookings,
    average_rating,
    monthly_increase,
    monthly_revenue,
    utilization_rate,
  } = stats?.data as DashboardStats;

  const handleMonthlyIncrease = () => {
    if (monthly_increase === null || monthly_increase === undefined) {
      return <Equal className="inline h-3 w-3" />;
    }

    if (monthly_increase.toString().startsWith("-")) {
      return <TrendingDown className="inline h-3 w-3" />;
    } else if (monthly_increase.toString().startsWith("+")) {
      return <TrendingUp className="inline h-3 w-3" />;
    } else {
      return <Equal className="inline h-3 w-3" />;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Aircraft</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total_aircraft}</div>
          <p className="text-xs text-muted-foreground">
            {utilization_rate}% utilization rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active_flights || 0}</div>
          <p className="text-xs text-muted-foreground">
            Today's scheduled flights
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₦{monthly_revenue?.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {handleMonthlyIncrease()} {monthly_increase}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total_bookings || 0}</div>
          <p className="text-xs text-muted-foreground">
            Avg rating: {(average_rating || 0).toFixed(1)}/5.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
