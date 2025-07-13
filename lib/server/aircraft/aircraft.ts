"use server";

import { Aircraft } from "@/lib/types/aircraft";
import { tryCatch } from "@/lib/utils";
import { AddAircraftFormData } from "@/lib/validations/aircraft";

export const getOperatorAircrafts = async (token: string | null): Promise<{ data: Aircraft[] | null, error: string | null }> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/aircraft`, {
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
    aircraftData: AddAircraftFormData
): Promise<{ data: Aircraft | null, error: string | null }> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/aircraft`, {
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

    console.log("data", data);


    if (!data.ok) {
        return { data: null, error: "Failed to create aircraft: " + data.statusText + " " + data.status };
    }

    if (aircraftError) {
        return { data: null, error: aircraftError.message };
    }

    return { data: aircraft as Aircraft, error: null };
}