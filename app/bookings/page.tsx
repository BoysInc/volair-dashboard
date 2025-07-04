"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingDetailsModal } from "@/components/bookings/booking-details-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { BookingWithDetails } from "@/lib/types/database";
import { BookingStatus } from "@/lib/constants/booking-status";
import { mockBookings } from "@/lib/data/mock-bookings";

export default function BookingsPage() {
  const [bookings, setBookings] =
    React.useState<BookingWithDetails[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.total_price,
      0
    );
    const totalPassengers = bookings.reduce(
      (sum, booking) => sum + booking.passenger_count,
      0
    );

    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const pendingBookings = statusCounts[BookingStatus.PENDING] || 0;
    const confirmedBookings = statusCounts[BookingStatus.CONFIRMED] || 0;
    const completedBookings = statusCounts[BookingStatus.COMPLETED] || 0;
    const cancelledBookings = statusCounts[BookingStatus.CANCELLED] || 0;

    return {
      totalBookings,
      totalRevenue,
      totalPassengers,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    };
  }, [bookings]);

  const handleViewBooking = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleEditBooking = (booking: BookingWithDetails) => {
    // TODO: Implement edit booking functionality
    console.log("Edit booking:", booking.id);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setIsLoading(true);
      try {
        // TODO: Implement actual delete API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } catch (error) {
        console.error("Error deleting booking:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual update API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="max-h-[100svh] overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Bookings Management</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Passengers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalPassengers}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  +15% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Bookings
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingBookings}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Confirmed</div>
                    <div className="text-2xl font-bold">
                      {stats.confirmedBookings}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium">Pending</div>
                    <div className="text-2xl font-bold">
                      {stats.pendingBookings}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Completed</div>
                    <div className="text-2xl font-bold">
                      {stats.completedBookings}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-sm font-medium">Cancelled</div>
                    <div className="text-2xl font-bold">
                      {stats.cancelledBookings}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>

            <TabsContent value="all" className="space-y-4">
              <BookingsTable
                bookings={bookings}
                onViewBooking={handleViewBooking}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <BookingsTable
                bookings={bookings.filter(
                  (b) => b.status === BookingStatus.PENDING
                )}
                onViewBooking={handleViewBooking}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              <BookingsTable
                bookings={bookings.filter(
                  (b) => b.status === BookingStatus.CONFIRMED
                )}
                onViewBooking={handleViewBooking}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <BookingsTable
                bookings={bookings.filter(
                  (b) => b.status === BookingStatus.COMPLETED
                )}
                onViewBooking={handleViewBooking}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
