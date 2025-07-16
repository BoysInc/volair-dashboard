import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStore } from '@/lib/types/auth';

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            operator: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasHydrated: false,

            // Actions
            setAuth: (data) => {
                set({
                    user: data.user,
                    operator: data.operator,
                    token: data.token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setHasHydrated: (hasHydrated) => {
                set({ hasHydrated });
            },
        }),
        {
            name: 'auth-storage', // unique name for storage key
            storage: createJSONStorage(() => sessionStorage), // use session storage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                // Don't persist loading state and hasHydrated
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// Helper functions for easier access
export const getAuthToken = () => useAuthStore.getState().token;
export const getCurrentUser = () => useAuthStore.getState().user;
export const isUserAuthenticated = () => useAuthStore.getState().isAuthenticated; 