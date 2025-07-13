import { z } from "zod"

export const addAircraftSchema = z.object({
    model_name: z
        .string()
        .min(1, "Model name is required")
        .min(2, "Model name must be at least 2 characters"),
    manufacturer: z
        .string()
        .min(1, "Manufacturer is required"),
    registration_number: z
        .string()
        .min(1, "Registration number is required")
        .min(3, "Registration number must be at least 3 characters")
        .max(15, "Registration number must be at most 15 characters"),
    seating_capacity: z
        .number()
        .min(1, "Seating capacity must be at least 1")
        .max(50, "Seating capacity must be at most 50"),
    range_km: z
        .number()
        .min(1, "Range must be at least 1 km")
        .max(20000, "Range must be at most 20,000 km"),
    speed_kph: z
        .number()
        .min(1, "Speed must be at least 1 kph")
        .max(2000, "Speed must be at most 2,000 kph"),
    wifi_available: z.string().transform((val) => val ? "true" : "false"),
    media_ids: z.array(z.string()).optional().default([]),
    status: z.enum(["Available", "In Flight", "Maintenance", "Out of Service"]).default("Available"),
})

export type AddAircraftFormData = z.infer<typeof addAircraftSchema> 