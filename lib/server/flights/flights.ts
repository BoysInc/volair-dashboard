"use server";

import { EditFlightFormData, GetOperatorFlightsResponse, FlightWidgets } from "@/lib/types/flight"
import { tryCatch } from "@/lib/utils"



export const getOperatorFlights = async (operatorId: string, token: string | null): Promise<{ data: GetOperatorFlightsResponse | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/flights`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: flights, error: flightsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "Error fetching flights: " + flights.message };
    }

    if (flightsError) {
        return { data: null, error: flightsError.message };
    }

    console.log("Flights: %j", flights.data);

    return { data: flights.data, error: null };
};

export const updateFlight = async (flightId: string, flight: EditFlightFormData, token: string | null, operatorId: string): Promise<{ data: GetOperatorFlightsResponse | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/flights/${flightId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(flight),
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: flights, error: flightsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "Error updating flight: " + flights.message };
    }

    if (flightsError) {
        return { data: null, error: flightsError.message };
    }

    return { data: flights.data, error: null };

}

export const deleteFlight = async (flightId: string, token: string | null, operatorId: string): Promise<{ data: any | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/flights/${flightId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: flights, error: flightsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "Error deleting flight: " + flights.message };
    }

    if (flightsError) {
        return { data: null, error: flightsError.message };
    }

    return { data: flights.data, error: null };
}

export const getFlightWidgets = async (operatorId: string, token: string | null): Promise<{ data: FlightWidgets | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorId}/flights/widgets`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: flights, error: flightsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "Error fetching flight widgets: " + flights.message };
    }

    if (flightsError) {
        return { data: null, error: flightsError.message };
    }

    return { data: flights, error: null };
}