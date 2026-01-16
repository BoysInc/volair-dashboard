import { create } from 'zustand';

interface PendingFlightsStore {
    // State
    pendingFlightIds: string[];
    aircraftId: string | null;

    // Actions
    setPendingFlights: (flightIds: string[], aircraftId: string) => void;
    clearPendingFlights: () => void;
}

export const usePendingFlightsStore = create<PendingFlightsStore>((set) => ({
    // Initial state
    pendingFlightIds: [],
    aircraftId: null,

    // Actions
    setPendingFlights: (flightIds: string[], aircraftId: string) =>
        set({ pendingFlightIds: flightIds, aircraftId }),

    clearPendingFlights: () =>
        set({ pendingFlightIds: [], aircraftId: null }),
}));
