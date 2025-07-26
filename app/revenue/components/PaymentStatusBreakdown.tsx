import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { getPaymentStatusBreakdown } from "@/lib/server/revenue/revenue";
import { PaymentStatusBreakdown, PaymentStatus } from "@/lib/types/revenue";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

// Chart configuration
const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-3))",
  },
  refunded: {
    label: "Refunded",
    color: "hsl(var(--chart-4))",
  },
};

// Mock data for development
const mockPaymentStatusBreakdown: PaymentStatusBreakdown[] = [
  {
    status: 1,
    status_name: "Completed",
    count: 305,
    total_amount: 2187500,
    percentage: 89.2,
  },
  {
    status: 0,
    status_name: "Pending",
    count: 15,
    total_amount: 107500,
    percentage: 4.4,
  },
  {
    status: 2,
    status_name: "Failed",
    count: 12,
    total_amount: 86000,
    percentage: 3.5,
  },
  {
    status: 3,
    status_name: "Refunded",
    count: 10,
    total_amount: 69000,
    percentage: 2.9,
  },
];

interface PaymentStatusBreakdownProps {
  className?: string;
}

const PaymentStatusBreakdownComponent = ({
  className,
}: PaymentStatusBreakdownProps) => {
  const { token } = useAuth();

  // Query for payment status breakdown (temporarily using mock data)
  const {
    data: paymentBreakdownResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payment-status-breakdown"],
    queryFn: () => getPaymentStatusBreakdown(token),
    enabled: false, // Disabled temporarily - use mock data
  });

  // Use mock data for now, but structure is ready for API integration
  const statusData = mockPaymentStatusBreakdown;

  const getPaymentStatusBadgeVariant = (status: number) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "default";
      case PaymentStatus.PENDING:
        return "secondary";
      case PaymentStatus.FAILED:
        return "destructive";
      case PaymentStatus.REFUNDED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPieChartData = () => {
    return statusData.map((item, index) => ({
      name: item.status_name,
      value: item.total_amount,
      fill: `hsl(var(--chart-${index + 1}))`,
    }));
  };

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 ${className || ""}`}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 ${className || ""}`}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorState message="Failed to load payment status breakdown" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorState message="Failed to load payment status details" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className || ""}`}>
      {/* Payment Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Breakdown by payment status
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={getPieChartData()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Payment Status Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Status Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed payment status breakdown
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusData.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(item.status)}>
                      {item.status_name}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{formatCurrency(item.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusBreakdownComponent;
