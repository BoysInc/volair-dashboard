// Auth Types based on API response structure

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
}

export interface Operator {
    id: string,
    name: string,
    country: string,
    license_number: string,
    verified_at: string|null,
}

export interface LoginResponse {
    message: string;
    data: {
        user: User;
        operator: Operator | null;
        token: string;
    };
}

export interface AuthState {
    user: User | null;
    operator: Operator | null;
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