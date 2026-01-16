import { create } from 'zustand';
import { OperatorBooking } from '@/lib/types/booking';

interface BookingModalStore {
    // State
    isOpen: boolean;
    isViewMode: boolean;
    viewingBooking: OperatorBooking | null;

    // Actions
    openViewModal: (booking: OperatorBooking) => void;
    closeModal: () => void;
}

export const useBookingModalStore = create<BookingModalStore>((set) => ({
    // Initial state
    isOpen: false,
    isViewMode: false,
    viewingBooking: null,

    // Actions
    openViewModal: (booking: OperatorBooking) => set({
        isOpen: true,
        isViewMode: true,
        viewingBooking: booking,
    }),
    closeModal: () => set({
        isOpen: false,
        isViewMode: false,
        viewingBooking: null,
    }),
}));

