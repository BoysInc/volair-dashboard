import { create } from 'zustand';
import { OperatorFlight } from '@/lib/types/flight';

interface FlightModalStore {
    // State
    isOpen: boolean;
    isViewMode: boolean;
    isEditMode: boolean;
    isCreateMode: boolean;
    viewingFlight: OperatorFlight | null;
    editingFlight: OperatorFlight | null;

    // Actions
    openViewModal: (flight: OperatorFlight) => void;
    openEditModal: (flight: OperatorFlight) => void;
    openCreateModal: () => void;
    closeModal: () => void;
}

export const useFlightModalStore = create<FlightModalStore>((set) => ({
    // Initial state
    isOpen: false,
    isViewMode: false,
    isEditMode: false,
    isCreateMode: false,
    viewingFlight: null,
    editingFlight: null,

    // Actions
    openViewModal: (flight: OperatorFlight) => set({
        isOpen: true,
        isViewMode: true,
        isEditMode: false,
        isCreateMode: false,
        viewingFlight: flight,
        editingFlight: null
    }),
    openEditModal: (flight: OperatorFlight) => set({
        isOpen: true,
        isViewMode: false,
        isEditMode: true,
        isCreateMode: false,
        viewingFlight: null,
        editingFlight: flight
    }),
    openCreateModal: () => set({
        isOpen: true,
        isViewMode: false,
        isEditMode: false,
        isCreateMode: true,
        viewingFlight: null,
        editingFlight: null
    }),
    closeModal: () => set({
        isOpen: false,
        isViewMode: false,
        isEditMode: false,
        isCreateMode: false,
        viewingFlight: null,
        editingFlight: null
    }),
})); 