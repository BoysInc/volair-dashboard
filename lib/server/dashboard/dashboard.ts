"use server";

import { tryCatch } from "@/lib/utils";

export interface DashboardStats {
    total_aircraft: number;
    active_flights: number;
    total_bookings: number;
    average_rating: number;
    monthly_increase: number;
    monthly_revenue: number;
    utilization_rate: number;
}

export const getDashboardStats = async (token: string) => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/widgets`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    )

    if (error) {
        return { data: null, error: error.message };
    }

    const { data: dashboardData, error: dashboardError } = await tryCatch(data.json());

    if (dashboardError) {
        return { data: null, error: dashboardError.message };
    }

    return { data: dashboardData as DashboardStats, error: null };
};