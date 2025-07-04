export interface Airport {
    id: string;
    name: string;
    iata_code: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
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
}

export interface Flight {
    id: string;
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_time: string; // ISO date string
    arrival_time: string; // ISO date string
    estimated_duration: string; // Format: "2h 30m"
    status: FlightStatus;
    price_usd: number;
}

export interface FlightWithDetails extends Flight {
    aircraft: Aircraft;
    departure_airport: Airport;
    arrival_airport: Airport;
}

export interface FlightFormData {
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_time: string;
    arrival_time: string;
    price_usd: number;
    status: FlightStatus;
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