"use server";

import { tryCatch } from "@/lib/utils";
import {
    RevenueStats,
    RevenueDashboardData,
    RevenueOverTime,
    PaymentWithDetails,
    PaymentStatusBreakdown,
    RevenueByAircraft,
    MonthlyRevenueComparison,
    PaymentMethodBreakdown
} from "@/lib/types/revenue";

// Get revenue statistics for overview cards
export const getRevenueStats = async (token: string | null): Promise<{ data: RevenueStats | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/revenue/stats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch revenue stats: ${data.status} ${data.statusText}` };
    }

    const { data: revenueStats, error: revenueStatsError } = await tryCatch(data.json());

    if (revenueStatsError) {
        return { data: null, error: revenueStatsError.message };
    }

    return { data: revenueStats.data as RevenueStats, error: null };
};

// Get complete revenue dashboard data
export const getRevenueDashboard = async (token: string | null): Promise<{ data: RevenueDashboardData | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/revenue/dashboard`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch revenue dashboard: ${data.status} ${data.statusText}` };
    }

    const { data: dashboardData, error: dashboardError } = await tryCatch(data.json());

    if (dashboardError) {
        return { data: null, error: dashboardError.message };
    }

    return { data: dashboardData.data as RevenueDashboardData, error: null };
};

// Get revenue over time for chart visualization
export const getRevenueOverTime = async (
    token: string | null,
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    limit: number = 12
): Promise<{ data: RevenueOverTime[] | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/revenue/overtime?period=${period}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch revenue over time: ${data.status} ${data.statusText}` };
    }

    const { data: revenueData, error: revenueError } = await tryCatch(data.json());

    if (revenueError) {
        return { data: null, error: revenueError.message };
    }

    return { data: revenueData.data as RevenueOverTime[], error: null };
};

// Get recent payments with details
export const getRecentPayments = async (
    token: string | null,
    limit: number = 10
): Promise<{ data: PaymentWithDetails[] | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/payments/recent?limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch recent payments: ${data.status} ${data.statusText}` };
    }

    const { data: paymentsData, error: paymentsError } = await tryCatch(data.json());

    if (paymentsError) {
        return { data: null, error: paymentsError.message };
    }

    return { data: paymentsData.data as PaymentWithDetails[], error: null };
};

// Get payment status breakdown
export const getPaymentStatusBreakdown = async (token: string | null): Promise<{ data: PaymentStatusBreakdown[] | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/payments/status-breakdown`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch payment status breakdown: ${data.status} ${data.statusText}` };
    }

    const { data: statusData, error: statusError } = await tryCatch(data.json());

    if (statusError) {
        return { data: null, error: statusError.message };
    }

    return { data: statusData.data as PaymentStatusBreakdown[], error: null };
};

// Get revenue by aircraft
export const getRevenueByAircraft = async (token: string | null): Promise<{ data: RevenueByAircraft[] | null, error: string | null }> => {
    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/revenue/by-aircraft`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        return { data: null, error: `Failed to fetch revenue by aircraft: ${data.status} ${data.statusText}` };
    }

    const { data: aircraftData, error: aircraftError } = await tryCatch(data.json());

    if (aircraftError) {
        return { data: null, error: aircraftError.message };
    }

    return { data: aircraftData.data as RevenueByAircraft[], error: null };
}; 