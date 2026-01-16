export interface Airport {
    id: string;
    name: string;
    iata_code: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    address: string;
}

export interface Aircraft {
    id: string;
    operator_id: string;
    model_name: string;
    manufacturer: string;
    registration_number: string;
    seating_capacity: number;
    range_km: number;
    speed_kph: number;
    wifi_available: boolean;
    image_url: string;
    status: AircraftStatus;
    price_per_hour_usd?: number; // Added for price calculation
}

export interface Flight {
    id: string;
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_date: string; // ISO date string
    arrival_time: string; // ISO date string
    estimated_duration: string; // Format: "2h 30m"
    status: string;
    price_usd: number;
    is_empty_leg: boolean;
}

export interface FlightWithDetails extends Flight {
    aircraft: Aircraft;
    departure_airport: Airport;
    arrival_airport: Airport;
}

export interface EditFlightFormData {
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    estimated_duration: string;
    one_way_price_usd: number;
    round_trip_price_usd: number;
    status: "Active" | "Inactive";
    is_empty_leg: boolean;
}

export interface FlightFormData {
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    estimated_duration: string;
    price_usd: number;
    status: string;
    is_empty_leg: boolean;
    route_type: "Charter" | "Seats";
    aircraft: Aircraft;
    one_way_price_usd: number;
    round_trip_price_usd: number;
}

export enum FlightStatus {
    SCHEDULED = 0,
    BOARDING = 1,
    DEPARTED = 2,
    IN_FLIGHT = 3,
    ARRIVED = 4,
    DELAYED = 5,
    CANCELLED = 6,
}

export enum AircraftStatus {
    AVAILABLE = 0,
    IN_FLIGHT = 1,
    MAINTENANCE = 2,
    OUT_OF_SERVICE = 3,
}

export const FLIGHT_STATUS_LABELS: Record<FlightStatus, string> = {
    [FlightStatus.SCHEDULED]: "Scheduled",
    [FlightStatus.BOARDING]: "Boarding",
    [FlightStatus.DEPARTED]: "Departed",
    [FlightStatus.IN_FLIGHT]: "In Flight",
    [FlightStatus.ARRIVED]: "Arrived",
    [FlightStatus.DELAYED]: "Delayed",
    [FlightStatus.CANCELLED]: "Cancelled",
};

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
    [AircraftStatus.AVAILABLE]: "Available",
    [AircraftStatus.IN_FLIGHT]: "In Flight",
    [AircraftStatus.MAINTENANCE]: "Maintenance",
    [AircraftStatus.OUT_OF_SERVICE]: "Out of Service",
};

// API Response Types for Get Operator Flights

export interface FlightMedia {
    id: string;
    url: string;
    type: "Image";
    order: number;
}

export interface FlightAircraft extends Aircraft {
    id: string;
    model_name: string;
    manufacturer: string;
    registration_number: string;
    seating_capacity: number;
    range_km: number;
    speed_kph: number;
    price_per_hour_usd: number;
    wifi_available: boolean;
    image_url: string;
    status: AircraftStatus;
    media: FlightMedia[];
}

export interface FlightAirport {
    id: string;
    name: string;
    iata_code: string;
    city: string;
    address: string;
    type: "Airport";
    latitude: number | string; // API can return as string
    longitude: number | string; // API can return as string
}

export interface OperatorFlight {
    id: string;
    aircraft: FlightAircraft;
    departure_airport: FlightAirport;
    arrival_airport: FlightAirport;
    estimated_duration: string;
    status: string;
    price_usd: string;
    departure_date: string;
    route_type?: "Charter" | "Seats";
    is_empty_leg?: boolean;
    one_way_price_usd: number;
    round_trip_price_usd: number;
}

export type GetOperatorFlightsResponse = OperatorFlight[];

export interface FlightWidgets {
    active_flights: number;
    completed_flights: number;
    today_flights: number;
}