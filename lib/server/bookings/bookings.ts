"use server";

import { GetOperatorBookingsResponse, BookingWidgets } from "@/lib/types/booking";
import { tryCatch } from "@/lib/utils";

export const getOperatorBookings = async (
    operatorId: string,
    token: string | null
): Promise<{ data: GetOperatorBookingsResponse | null; error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/bookings`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: bookings, error: bookingsError } = await tryCatch(data.json());

    if (!data.ok) {
        return { data: null, error: "Error fetching bookings: " + bookings.message };
    }

    if (bookingsError) {
        return { data: null, error: bookingsError.message };
    }

    return { data: bookings, error: null };
};

export const getBookingWidgets = async (
    operatorId: string,
    token: string | null
): Promise<{ data: BookingWidgets | null; error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/bookings/widgets`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: widgets, error: widgetsError } = await tryCatch(data.json());

    if (!data.ok) {
        return { data: null, error: "Error fetching booking widgets: " + widgets.message };
    }

    if (widgetsError) {
        return { data: null, error: widgetsError.message };
    }

    return { data: widgets.data as BookingWidgets, error: null };
};

