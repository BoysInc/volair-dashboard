import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getAircraftWidgets } from "@/lib/server/aircraft/aircraft";
import { useQuery } from "@tanstack/react-query";
import { Activity, Plane, Users } from "lucide-react";
import React, { useMemo } from "react";
import { Settings, Wifi } from "lucide-react";

const AircraftWidgets = () => {
  const { token } = useAuth();

  const {
    data: aircraftWidgets,
    isLoading: isLoadingAircraftWidgets,
    error: aircraftWidgetsError,
  } = useQuery({
    queryKey: ["aircraftWidgets"],
    queryFn: () => getAircraftWidgets(token),
    enabled: !!token,
  });

  const { data: aircraftWidgetsData, error: aircraftWidgetsDataError } =
    useMemo(() => {
      const { data, error } = aircraftWidgets || { data: null, error: null };
      return {
        data: data,
        error: error,
      };
    }, [aircraftWidgets]);

  if (isLoadingAircraftWidgets) {
    return <LoadingState />;
  }

  if (aircraftWidgetsError) {
    return <ErrorState />;
  }

  if (!aircraftWidgetsData) {
    return <ErrorState />;
  }

  return (
    <div className="mb-4 flex flex-col gap-4">
      {/* Fleet Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Aircraft
            </CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aircraftWidgetsData.total_aircraft}
            </div>
            <p className="text-xs text-muted-foreground">In your fleet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {aircraftWidgetsData.available_aircraft}
            </div>
            <p className="text-xs text-muted-foreground">Ready for service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Flight</CardTitle>
            <Plane className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {aircraftWidgetsData.aircraft_under_maintenance}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {aircraftWidgetsData.aircraft_under_maintenance}
            </div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Capabilities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aircraftWidgetsData.available_capacity}
            </div>
            <p className="text-xs text-muted-foreground">
              Total passenger seats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WiFi Equipped</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aircraftWidgetsData.aircraft_with_wifi}
            </div>
            <p className="text-xs text-muted-foreground">
              of {aircraftWidgetsData.total_aircraft} aircraft (
              {Math.round(
                (aircraftWidgetsData.aircraft_with_wifi /
                  aircraftWidgetsData.total_aircraft) *
                  100
              )}
              %)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AircraftWidgets;
