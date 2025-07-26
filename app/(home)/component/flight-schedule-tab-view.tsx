import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getOperatorFlights } from "@/lib/server/flights/flights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-state";
import {
  Clock,
  MapPin,
  MoreHorizontal,
  Plane,
  ArrowRight,
  Eye,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { ViewFlightModal } from "@/components/flights/view-flight-modal";
import { EditFlightModal } from "@/components/flights/edit-flight-modal";
import { CreateFlightModal } from "@/components/flights/create-flight-modal";
import Link from "next/link";

// Loading skeleton for flight cards
function FlightCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="text-muted-foreground">→</div>
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Time and Details skeleton */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const FlightScheduleTabView = () => {
  const { token, operator } = useAuth(true);
  const { openViewModal, openEditModal } = useFlightModalStore();

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights"],
    queryFn: () => getOperatorFlights(operator?.id || "", token || ""),
    enabled: !!token && !!operator?.id,
  });

  console.log("Flights: %j", flights?.data);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Flight Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Manage your flight schedules and routes
          </p>
        </div>
        <CreateFlightModal />
      </div>

      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <FlightCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Flight Cards */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {flights?.data?.slice(0, 5).map((flight) => (
              <Card
                key={flight.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        {flight.aircraft?.model_name}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {flight.aircraft?.registration_number}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {flight.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openViewModal(flight)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditModal(flight)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Flight
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Route */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {flight.departure_airport?.name}
                      </span>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="text-right">
                      <span className="font-medium">
                        {flight.arrival_airport?.name}
                      </span>
                    </div>
                  </div>

                  {/* Time and Details */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Departure:
                        </span>
                      </div>
                      <div className="font-medium">
                        {new Date(flight.departure_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Price:
                      </div>
                      <div className="font-medium text-lg">
                        ${flight.price_usd.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show View All CTA if there are more than 5 flights */}
        {!isLoading && flights?.data && flights.data.length > 5 && (
          <div className="flex justify-center pt-4">
            <Link href="/flights">
              <Button variant="outline" className="gap-2">
                View All Flights ({flights.data.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && flights?.data && flights.data.length === 0 && (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <Plane className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="font-medium">No flights scheduled</h3>
              <p className="text-sm text-muted-foreground">
                Schedule your first flight to get started
              </p>
              <CreateFlightModal triggerText="Schedule First Flight" />
            </div>
          </Card>
        )}
      </div>

      {/* Flight Modals */}
      <ViewFlightModal />
      <EditFlightModal />
      <CreateFlightModal showTrigger={false} />
    </div>
  );
};

export default FlightScheduleTabView;
