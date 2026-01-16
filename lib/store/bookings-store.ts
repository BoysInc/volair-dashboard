import { create } from 'zustand';
import { OperatorBooking } from '@/lib/types/booking';

interface BookingsStore {
    bookings: OperatorBooking[];
    setBookings: (bookings: OperatorBooking[]) => void;
    addBooking: (booking: OperatorBooking) => void;
    updateBooking: (bookingId: string, updatedBooking: Partial<OperatorBooking>) => void;
    removeBooking: (bookingId: string) => void;
}

export const useBookingsStore = create<BookingsStore>((set) => ({
    bookings: [],
    
    setBookings: (bookings) => set({ bookings }),
    
    addBooking: (booking) => set((state) => ({
        bookings: [...state.bookings, booking]
    })),
    
    updateBooking: (bookingId, updatedBooking) => set((state) => ({
        bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
        )
    })),
    
    removeBooking: (bookingId) => set((state) => ({
        bookings: state.bookings.filter((booking) => booking.id !== bookingId)
    })),
}));

