import { formatNumberWithCommas } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Format a price value with commas for display
 */
export const formatFlightPrice = (value: number): string => {
    return formatNumberWithCommas(value);
};


/**
 * Format date and time for MySQL datetime format (YYYY-MM-DD HH:mm:ss)
 */
export const formatFlightDateTime = (date: string, time: string): string => {
    const dateTimeString = `${date}T${time || "12:00"}:00`;
    const dateObj = new Date(dateTimeString);
    return format(dateObj, "yyyy-MM-dd HH:mm");
};

/**
 * Common validation rules for flight forms
 */
export const flightValidationRules = {
    aircraft_id: { required: "Aircraft is required" },
    route_type: { required: "Route type is required" },
    departure_airport_id: { required: "Departure airport is required" },
    arrival_airport_id: { required: "Arrival airport is required" },
    estimated_duration: { required: "Estimated duration is required" },
    one_way_price_usd: {
        required: "One way price is required",
        min: { value: 0, message: "Price must be positive" },
    },
    round_trip_price_usd: {
        required: "Round trip price is required",
        min: { value: 0, message: "Price must be positive" },
    },
    status: { required: "Status is required" },
} as const;

/**
 * Get conditional validation rules based on route type
 */
export const getConditionalValidationRules = (routeType: "Charter" | "Seats") => {
    if (routeType === "Seats") {
        return {
            departure_date: {
                required: "Departure date is required for scheduled flights",
            },
            departure_time: {
                required: "Departure time is required",
            },
        };
    }
    return {};
};

