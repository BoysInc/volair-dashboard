"use server";

import { Aircraft, AircraftWidget, DeleteAircraftError } from "@/lib/types/aircraft";
import { tryCatch } from "@/lib/utils";
import { DeleteAircraftErrorEnum } from "@/lib/utils/aircraft";
import { AddAircraftFormData } from "@/lib/validations/aircraft";

export const getOperatorAircrafts = async (token: string | null, operatorID: string): Promise<{ data: Aircraft[] | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorID}/aircraft`, {
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

    const { data: aircrafts, error: aircraftsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "No data returned: " + data.statusText + " " + data.status };
    }

    if (aircraftsError) {
        return { data: null, error: aircraftsError.message };
    }

    return { data: aircrafts?.data as Aircraft[], error: null };
}

export const createAircraft = async (
    token: string | null,
    aircraftData: AddAircraftFormData,
    operatorID: string,
): Promise<{ data: Aircraft | null, error: string | null }> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorID}/aircraft`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(aircraftData),
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }

    const { data: aircraft, error: aircraftError } = await tryCatch(data.json())
    if (!data.ok) {
        return { data: null, error: "Failed to create aircraft: " + data.statusText + " " + data.status };
    }

    if (aircraftError) {
        return { data: null, error: aircraftError.message };
    }

    return { data: aircraft as Aircraft, error: null };
}

export const getAircraftWidgets = async (token: string | null, operatorID: string): Promise<{ data: AircraftWidget | null, error: string | null }> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorID}/aircraft/widgets`, {
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

    const { data: aircraftWidgets, error: aircraftWidgetsError } = await tryCatch(data.json())

    if (!data.ok) {
        return { data: null, error: "Failed to get aircraft widgets: " + data.statusText + " " + aircraftWidgets.message };
    }

    if (aircraftWidgetsError) {
        return { data: null, error: aircraftWidgetsError.message };
    }

    return { data: aircraftWidgets as AircraftWidget, error: null };
}

export const updateAircraft = async (
    token: string | null,
    aircraftId: string,
    updateData: Partial<AddAircraftFormData>,
    operatorID: string
): Promise<{ data: Aircraft | null, error: string | null }> => {

    // Defensive checks to prevent throws
    if (!token) {
        return { data: null, error: "Authentication token is required" };
    }

    if (!aircraftId || aircraftId.trim() === "") {
        return { data: null, error: "Aircraft ID is required" };
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        return { data: null, error: "No update data provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorID}/aircraft/${aircraftId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }


    const { data: aircraft, error: aircraftError } = await tryCatch(data.json())

    // console.log("Aircraft data", aircraft);
    if (!data.ok) {
        return { data: null, error: "Failed to update aircraft: " + aircraft?.message };
    }

    if (aircraftError) {
        return { data: null, error: aircraftError.message };
    }

    // According to API docs, successful response has structure: { message: string, data: AircraftResource }
    // Handle both cases: with and without data field for defensive programming
    const responseData = aircraft?.data || aircraft;

    if (!responseData) {
        return { data: null, error: "No aircraft data returned from server" };
    }

    return { data: responseData as Aircraft, error: null };
}

export const deleteAircraft = async (
    token: string | null,
    aircraftId: string,
    operatorID: string
): Promise<{ data: Aircraft | null, error: string | null | DeleteAircraftError }> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators/${operatorID}/aircraft/${aircraftId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    )

    if (error !== null) {
        return { data: null, error: error.message };
    }


    if (!data.ok) {
        const { data: aircraft, error: aircraftError } = await tryCatch(data.json())

        if (aircraftError) {
            return { data: null, error: aircraftError.message };
        }

        if (aircraft?.message == DeleteAircraftErrorEnum.AIRCRAFT_WITH_FLIGHTS) {
            return { data: null, error: aircraft as DeleteAircraftError };
        }

        return { data: null, error: "Failed to delete aircraft: " + aircraft?.message };
    }


    return { data: null, error: null };
}