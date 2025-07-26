import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingState } from "@/components/ui/loading-state";
import { getOperatorAircrafts } from "@/lib/server/aircraft/aircraft";
import { useQuery } from "@tanstack/react-query";
import { Edit, Eye, Plus, ArrowRight } from "lucide-react";
import React, { useMemo } from "react";
import { useAircraftModalStore } from "@/lib/store/aircraft-modal-store";
import Link from "next/link";

type AircraftTabViewProps = {
  token: string;
};

const AircraftTabView = ({ token }: AircraftTabViewProps) => {
  const { openModal, openEditModal, openViewModal } = useAircraftModalStore();
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => getOperatorAircrafts(token),
    enabled: !!token,
  });

  const { data: aircraftsData, error: aircraftsError } = useMemo(() => {
    const { data, error } = aircrafts || { data: null, error: null };
    return {
      data: data,
      error: error,
    };
  }, [aircrafts]);

  if (isLoadingAircrafts) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <LoadingState message="Loading aircraft data..." size="lg" />
      </div>
    );
  }

  if (aircraftsError !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <ErrorState
          title="Failed to load aircrafts"
          message="Unable to fetch aircraft data. Please try again."
          error={aircraftsError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between space-y-4">
        <div>
          <h3 className="text-lg font-medium">Aircraft Fleet</h3>
          <p className="text-sm text-muted-foreground">
            Manage your aircraft inventory and specifications
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Aircraft
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aircraftsData &&
            aircraftsData.slice(0, 5).map((aircraft) => (
              <Card key={aircraft.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {aircraft.model_name}
                    </CardTitle>
                    {aircraft.status}
                  </div>
                  <CardDescription>{aircraft.manufacturer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <img
                    src={aircraft?.media[0]?.url || "/placeholder.svg"}
                    alt={aircraft.model_name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Registration:
                      </span>
                      <span className="font-medium">
                        {aircraft.registration_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>{aircraft.seating_capacity} passengers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WiFi:</span>
                      <span>
                        {aircraft.wifi_available
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openViewModal(aircraft)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditModal(aircraft)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Show View All CTA if there are more than 5 aircraft */}
        {aircraftsData && aircraftsData.length > 5 && (
          <div className="flex justify-center pt-4">
            <Link href="/aircraft">
              <Button variant="outline" className="gap-2">
                View All Aircraft ({aircraftsData.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AircraftTabView;
