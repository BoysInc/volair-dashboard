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
import { cn } from "@/lib/utils";

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
      return <Equal className="inline h-3 w-3 text-slate-500" />;
    }

    if (monthly_increase.toString().startsWith("-")) {
      return <TrendingDown className="inline h-3 w-3 text-red-500" />;
    } else if (monthly_increase.toString().startsWith("+")) {
      return <TrendingUp className="inline h-3 w-3 text-emerald-500" />;
    } else {
      return <Equal className="inline h-3 w-3 text-slate-500" />;
    }
  };

  const getMetricChangeColor = () => {
    if (monthly_increase === null || monthly_increase === undefined) {
      return "text-slate-600";
    }

    if (monthly_increase.toString().startsWith("-")) {
      return "text-red-600";
    } else if (monthly_increase.toString().startsWith("+")) {
      return "text-emerald-600";
    } else {
      return "text-slate-600";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Total Aircraft
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
            <Plane className="h-5 w-5 text-teal-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {total_aircraft}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">{utilization_rate}%</span> utilization
            rate
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Active Flights
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {active_flights || 0}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Today's scheduled flights
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Monthly Revenue
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            ₦{monthly_revenue?.toLocaleString()}
          </div>
          <p className={cn("text-sm mt-1 font-medium", getMetricChangeColor())}>
            {handleMonthlyIncrease()} {monthly_increase}% from last month
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Total Bookings
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {total_bookings || 0}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Avg rating:{" "}
            <span className="font-medium text-amber-600">
              {(average_rating || 0).toFixed(1)}/5.0
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
