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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { getRevenueByAircraft } from "@/lib/server/revenue/revenue";
import { RevenueByAircraft } from "@/lib/types/revenue";

// Mock data for development
const mockRevenueByAircraft: RevenueByAircraft[] = [
  {
    aircraft_id: "1",
    aircraft_model: "Citation CJ3+",
    registration_number: "5N-ABC",
    total_revenue: 680000,
    bookings_count: 95,
    utilization_percentage: 78,
  },
  {
    aircraft_id: "2",
    aircraft_model: "King Air 350",
    registration_number: "5N-DEF",
    total_revenue: 520000,
    bookings_count: 73,
    utilization_percentage: 65,
  },
  {
    aircraft_id: "3",
    aircraft_model: "Falcon 7X",
    registration_number: "5N-GHI",
    total_revenue: 890000,
    bookings_count: 124,
    utilization_percentage: 82,
  },
  {
    aircraft_id: "4",
    aircraft_model: "Hawker 4000",
    registration_number: "5N-JKL",
    total_revenue: 360000,
    bookings_count: 50,
    utilization_percentage: 45,
  },
];

interface RevenueByAircraftProps {
  className?: string;
}

const RevenueByAircraftComponent = ({ className }: RevenueByAircraftProps) => {
  const { token } = useAuth();

  // Query for revenue by aircraft (temporarily using mock data)
  const {
    data: revenueByAircraftResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["revenue-by-aircraft"],
    queryFn: () => getRevenueByAircraft(token),
    enabled: false, // Disabled temporarily - use mock data
  });

  // Use mock data for now, but structure is ready for API integration
  const aircraftData = mockRevenueByAircraft;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue by Aircraft</CardTitle>
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
          <CardTitle>Revenue by Aircraft</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Failed to load aircraft revenue data" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue by Aircraft</CardTitle>
        <p className="text-sm text-muted-foreground">
          Performance breakdown by aircraft in your fleet
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aircraft</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aircraftData.map((aircraft) => (
              <TableRow key={aircraft.aircraft_id}>
                <TableCell className="font-medium">
                  {aircraft.aircraft_model}
                </TableCell>
                <TableCell>{aircraft.registration_number}</TableCell>
                <TableCell>{formatCurrency(aircraft.total_revenue)}</TableCell>
                <TableCell>{aircraft.bookings_count}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {aircraft.utilization_percentage}%
                    </div>
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getUtilizationColor(
                          aircraft.utilization_percentage
                        )}`}
                        style={{
                          width: `${aircraft.utilization_percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RevenueByAircraftComponent;
