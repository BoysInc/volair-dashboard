import { create } from 'zustand';
import { OperatorFlight } from '@/lib/types/flight';

interface FlightsStore {
    // State
    flights: OperatorFlight[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setFlights: (flights: OperatorFlight[]) => void;
    addFlight: (flight: OperatorFlight) => void;
    updateFlight: (id: string, updates: Partial<OperatorFlight>) => void;
    removeFlight: (id: string) => void;
    getFlightById: (id: string) => OperatorFlight | undefined;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearFlights: () => void;
}

export const useFlightsStore = create<FlightsStore>((set, get) => ({
    // Initial state
    flights: [],
    isLoading: false,
    error: null,

    // Actions
    setFlights: (flights: OperatorFlight[]) => set({ flights, error: null }),

    addFlight: (flight: OperatorFlight) =>
        set((state) => ({
            flights: [...state.flights, flight],
        })),

    updateFlight: (id: string, updates: Partial<OperatorFlight>) =>
        set((state) => ({
            flights: state.flights.map((flight) =>
                flight.id === id ? { ...flight, ...updates } : flight
            ),
        })),

    removeFlight: (id: string) =>
        set((state) => ({
            flights: state.flights.filter((flight) => flight.id !== id),
        })),

    getFlightById: (id: string) => {
        const state = get();
        return state.flights.find((flight) => flight.id === id);
    },

    setLoading: (isLoading: boolean) => set({ isLoading }),

    setError: (error: string | null) => set({ error }),

    clearFlights: () => set({ flights: [], error: null }),
}));

