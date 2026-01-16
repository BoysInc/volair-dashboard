import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBookingModalStore } from "@/lib/store/booking-modal-store";
import { useBookingsStore } from "@/lib/store/bookings-store";
import { getBookingWidgets, getOperatorBookings } from "@/lib/server/bookings/bookings";
import { BookingWidgets, OperatorBooking } from "@/lib/types/booking";

export const useBookingsViewModel = () => {
  const { token } = useAuth(true);
  const operator = useAuthStore((state) => state.operator);

  // Modal state from Zustand
  const viewingBooking = useBookingModalStore((state) => state.viewingBooking);
  const isViewMode = useBookingModalStore((state) => state.isViewMode);
  const openViewModal = useBookingModalStore((state) => state.openViewModal);
  const closeModal = useBookingModalStore((state) => state.closeModal);

  // Bookings data from Zustand
  const setBookings = useBookingsStore((state) => state.setBookings);

  // Fetch bookings query
  const { data: bookingsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await getOperatorBookings(
        operator?.id || "",
        token
      );

      if (error !== null) {
        throw new Error("Failed to fetch bookings");
      }

      // Sync to Zustand store
      if (data?.data) {
        setBookings(data.data);
      }

      return data;
    },
    enabled: !!token && !!operator,
    refetchOnMount: true,
  });

  const { data: bookingWidgetsResponse, isLoading: isLoadingBookingWidgets, error: bookingWidgetsError } = useQuery<{ data: BookingWidgets | null; error: string | null }>({
    queryKey: ["booking-widgets"],
    queryFn: async () => {
      const { data, error } = await getBookingWidgets(operator?.id || "", token || "");
      if (error !== null) {
        throw new Error("Failed to fetch booking widgets");
      }

      if (!data) {
        throw new Error("Booking widgets not found");
      }

      return { data: data, error: null };
    },
    enabled: !!token && !!operator,
  });

  const bookingWidgets = bookingWidgetsResponse?.data || {
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    revenue: 0,
  };
  const bookings = bookingsResponse?.data || [];

  // Calculate statistics from bookings
  const statistics = {
    totalBookings: bookingWidgets.total_bookings,
    pendingBookings: bookingWidgets.pending_bookings,
    confirmedBookings: bookingWidgets.confirmed_bookings,
    completedBookings: bookings.filter((b) => b.status.toLowerCase() === "completed").length,
    totalRevenue: bookingWidgets.revenue / 100,
  };

  // Actions
  const handleViewBooking = (booking: OperatorBooking) => {
    openViewModal(booking);
  };

  const handleCloseModal = () => {
    closeModal();
  };

  return {
    // Data
    bookings,
    statistics,
    isLoading,
    error,
    isLoadingBookingWidgets,
    bookingWidgetsError,

    // Modal state
    viewingBooking,
    isViewMode,

    // Actions
    handleViewBooking,
    handleCloseModal,
    refetchBookings: refetch,
  };
};

