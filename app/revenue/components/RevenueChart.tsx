import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getRevenueOverTime } from "@/lib/server/revenue/revenue";
import { RevenueOverTime } from "@/lib/types/revenue";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

// Chart configuration
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-2))",
  },
  payments: {
    label: "Payments",
    color: "hsl(var(--chart-3))",
  },
};

// Mock data for development
const mockRevenueOverTime: RevenueOverTime[] = [
  { date: "2024-01", revenue: 380000, bookings_count: 45, payments_count: 48 },
  { date: "2024-02", revenue: 420000, bookings_count: 52, payments_count: 55 },
  { date: "2024-03", revenue: 465000, bookings_count: 58, payments_count: 61 },
  { date: "2024-04", revenue: 445000, bookings_count: 54, payments_count: 57 },
  { date: "2024-05", revenue: 520000, bookings_count: 63, payments_count: 66 },
  { date: "2024-06", revenue: 485000, bookings_count: 59, payments_count: 62 },
  { date: "2024-07", revenue: 510000, bookings_count: 61, payments_count: 64 },
  { date: "2024-08", revenue: 475000, bookings_count: 57, payments_count: 60 },
  { date: "2024-09", revenue: 535000, bookings_count: 64, payments_count: 67 },
  { date: "2024-10", revenue: 495000, bookings_count: 58, payments_count: 61 },
  { date: "2024-11", revenue: 480000, bookings_count: 56, payments_count: 59 },
  { date: "2024-12", revenue: 450000, bookings_count: 53, payments_count: 56 },
];

interface RevenueChartProps {
  selectedPeriod: "month" | "week" | "day";
  onPeriodChange: (period: "month" | "week" | "day") => void;
  className?: string;
}

const RevenueChart = ({
  selectedPeriod,
  onPeriodChange,
  className,
}: RevenueChartProps) => {
  const { token } = useAuth();

  // Query for revenue over time (temporarily using mock data)
  const {
    data: revenueOverTimeResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["revenue-overtime", selectedPeriod],
    queryFn: () => getRevenueOverTime(token, selectedPeriod),
    enabled: false, // Disabled temporarily - use mock data
  });

  // Use mock data for now, but structure is ready for API integration
  const timeData = mockRevenueOverTime;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Failed to load revenue trends" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Trends</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revenue and booking trends over time
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <AreaChart data={timeData}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
