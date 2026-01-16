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

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: dashboardData, error: dashboardError } = await tryCatch(data.json());

    if (dashboardError !== null) {
        return { data: null, error: dashboardError.message };
    }

    console.log(dashboardData);

    if (!data.ok) {
        return { data: null, error: "Failed to get dashboard stats: " + data.statusText + " " + data.status };
    }

    return { data: dashboardData as DashboardStats, error: null };
};