import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { getRevenueStats } from "@/lib/server/revenue/revenue";
import { RevenueStats } from "@/lib/types/revenue";

// Mock data for development (remove when API is available)
const mockRevenueStats: RevenueStats = {
  total_revenue: 2450000,
  monthly_revenue: 450000,
  weekly_revenue: 125000,
  daily_revenue: 18500,
  revenue_growth_percentage: 12.5,
  total_payments: 342,
  pending_payments: 15,
  completed_payments: 305,
  failed_payments: 12,
  average_booking_value: 7163,
  total_bookings: 342,
};

interface RevenueStatsCardsProps {
  className?: string;
}

const RevenueStatsCards = ({ className }: RevenueStatsCardsProps) => {
  const { token } = useAuth();

  // Query for revenue stats (temporarily using mock data)
  const {
    data: revenueStatsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["revenue-stats"],
    queryFn: () => getRevenueStats(token),
    enabled: false, // Disabled temporarily - use mock data
  });

  // Use mock data for now, but structure is ready for API integration
  const stats = mockRevenueStats;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load revenue statistics" />;
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.total_revenue)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {stats.revenue_growth_percentage >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(stats.revenue_growth_percentage)}% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.monthly_revenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Average: {formatCurrency(stats.average_booking_value)} per booking
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_payments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.completed_payments} completed, {stats.pending_payments}{" "}
            pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((stats.completed_payments / stats.total_payments) * 100).toFixed(
              1
            )}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.failed_payments} failed payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStatsCards;
