"use client";

import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BookingsTable } from "@/components/bookings/bookings-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, DollarSign } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-state";
import { BookingDetailsModal } from "@/components/bookings/booking-details-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingsViewModel } from "@/hooks/use-bookings-view-model";
import { ErrorState } from "@/components/ui/error-state";

// Component that uses searchParams - needs to be wrapped in Suspense
function BookingsContent() {
  // Use the view model hook for MVVM architecture
  const {
    bookings,
    statistics,
    isLoading,
    error,
    viewingBooking,
    isViewMode,
    isLoadingBookingWidgets,
    bookingWidgetsError,
    handleViewBooking,
    handleCloseModal,
  } = useBookingsViewModel();

  return (
    <DashboardLayout
      title="Bookings"
      description="Manage customer bookings and reservations"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage customer bookings and reservations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoadingBookingWidgets ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : bookingWidgetsError ? (
          <ErrorState message={bookingWidgetsError.message} />
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.totalBookings}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.pendingBookings}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.confirmedBookings}
                </div>
                <p className="text-xs text-muted-foreground">Active bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${statistics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total operator revenue
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage customer bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : error ? (
            <ErrorState message={error.message} />
          ) : bookings.length > 0 ? (
            <BookingsTable
              bookings={bookings}
              onViewBooking={handleViewBooking}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No bookings available
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Booking Modal */}
      <BookingDetailsModal
        booking={viewingBooking}
        open={isViewMode}
        onClose={handleCloseModal}
      />
    </DashboardLayout>
  );
}

// Main page component with Suspense boundary
export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout
          title="Bookings"
          description="Manage customer bookings and reservations"
        >
          {/* Loading fallback */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
              <p className="text-muted-foreground">
                Manage customer bookings and reservations
              </p>
            </div>
          </div>

          {/* Stats Cards Loading */}
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>

          {/* Table Loading */}
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                View and manage customer bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={5} />
            </CardContent>
          </Card>
        </DashboardLayout>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
