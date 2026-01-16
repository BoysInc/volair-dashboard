import { create } from 'zustand';
import { Aircraft } from '@/lib/types/aircraft';

interface AircraftsStore {
    // State
    aircrafts: Aircraft[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setAircrafts: (aircrafts: Aircraft[]) => void;
    addAircraft: (aircraft: Aircraft) => void;
    updateAircraft: (id: string, updates: Partial<Aircraft>) => void;
    removeAircraft: (id: string) => void;
    getAircraftById: (id: string) => Aircraft | undefined;
    getAvailableAircrafts: () => Aircraft[];
    getAllAircrafts: () => Aircraft[];
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearAircrafts: () => void;
}

export const useAircraftsStore = create<AircraftsStore>((set, get) => ({
    // Initial state
    aircrafts: [],
    isLoading: false,
    error: null,

    // Actions
    setAircrafts: (aircrafts: Aircraft[]) => set({ aircrafts, error: null }),

    addAircraft: (aircraft: Aircraft) =>
        set((state) => ({
            aircrafts: [...state.aircrafts, aircraft],
        })),

    updateAircraft: (id: string, updates: Partial<Aircraft>) =>
        set((state) => ({
            aircrafts: state.aircrafts.map((aircraft) =>
                aircraft.id === id ? { ...aircraft, ...updates } : aircraft
            ),
        })),

    removeAircraft: (id: string) =>
        set((state) => ({
            aircrafts: state.aircrafts.filter((aircraft) => aircraft.id !== id),
        })),

    getAircraftById: (id: string) => {
        const state = get();
        return state.aircrafts.find((aircraft) => aircraft.id === id);
    },

    getAvailableAircrafts: () => {
        const state = get();
        return state.aircrafts.filter((aircraft) => aircraft.status === "Available");
    },

    getAllAircrafts: () => {
        return get().aircrafts;
    },

    setLoading: (isLoading: boolean) => set({ isLoading }),

    setError: (error: string | null) => set({ error }),

    clearAircrafts: () => set({ aircrafts: [], error: null }),
}));

