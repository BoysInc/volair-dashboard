// Auth Types based on API response structure

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasHydrated: boolean;
}

export interface AuthActions {
    setAuth: (data: LoginResponse['data']) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
}

export type AuthStore = AuthState & AuthActions; 