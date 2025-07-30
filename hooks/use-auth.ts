import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { getMe } from '@/lib/server/auth/me';
import { toast } from 'sonner';

export function useAuth(requireAuth: boolean = false) {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const setAuth = useAuthStore((state) => state.setAuth);
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const operator = useAuthStore((state) => state.operator);

    const router = useRouter();

    const getUser = useCallback(async () => {
        // Don't check token until the store has been hydrated
        if (!hasHydrated) {
            return;
        }

        if (!token) {
            logout();
            router.push('/auth');
            return;
        }

        const { user: userData, operator, error: userError } = await getMe(token);

        if (userError !== null) {
            logout();
            router.push('/auth');
            return;
        }

        if (userData && operator) {
            setAuth({ user: userData, token: token || "", operator });
        }

        if (!operator) {
            logout();
            toast.error("You are not authorized to access this application, please contact your administrator");
            router.push('/auth');
            return;
        }
    }, [token, logout, router, setAuth, hasHydrated]);

    useEffect(() => {
        getUser();
    }, [requireAuth, isLoading, isAuthenticated, router, getUser]);

    const signOut = () => {
        logout();
        router.push('/auth');
    };

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        signOut,
        operator,
    };
}

export function useRequireAuth() {
    return useAuth(true);
} 