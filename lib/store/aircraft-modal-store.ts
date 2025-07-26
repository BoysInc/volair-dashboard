import { create } from 'zustand';
import { Aircraft } from '@/lib/types/aircraft';

interface AircraftModalStore {
    // State
    isOpen: boolean;
    isEditMode: boolean;
    isViewMode: boolean;
    editingAircraft: Aircraft | null;
    viewingAircraft: Aircraft | null;

    // Actions
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
    openEditModal: (aircraft: Aircraft) => void;
    openViewModal: (aircraft: Aircraft) => void;
}

export const useAircraftModalStore = create<AircraftModalStore>((set, get) => ({
    // Initial state
    isOpen: false,
    isEditMode: false,
    isViewMode: false,
    editingAircraft: null,
    viewingAircraft: null,

    // Actions
    openModal: () => set({ isOpen: true, isEditMode: false, isViewMode: false, editingAircraft: null, viewingAircraft: null }),
    closeModal: () => set({ isOpen: false, isEditMode: false, isViewMode: false, editingAircraft: null, viewingAircraft: null }),
    toggleModal: () => set({ isOpen: !get().isOpen }),
    openEditModal: (aircraft: Aircraft) => set({
        isOpen: true,
        isEditMode: true,
        isViewMode: false,
        editingAircraft: aircraft,
        viewingAircraft: null
    }),
    openViewModal: (aircraft: Aircraft) => set({
        isOpen: true,
        isEditMode: false,
        isViewMode: true,
        editingAircraft: null,
        viewingAircraft: aircraft
    }),
})); 