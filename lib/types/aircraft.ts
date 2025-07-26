
export interface Media {
    id: string;
    url: string;
    type: string;
    order: number;
}

export interface AircraftWidget {
    total_aircraft: number;
    available_aircraft: number;
    aircraft_under_maintenance: number;
    available_capacity: number;
    aircraft_with_wifi: number;
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
    price_per_hour_usd: number;
    wifi_available: boolean;
    status: AircraftStatus;
    media: Media[];
}

export interface AircraftFormData {
    model_name: string;
    manufacturer: string;
    registration_number: string;
    seating_capacity: number;
    range_km: number;
    speed_kph: number;
    price_per_hour_usd: number;
    wifi_available: boolean;
    status: AircraftStatus;
}

export enum AircraftStatus {
    AVAILABLE = "Available",
    IN_FLIGHT = "InFlight",
    MAINTENANCE = "Maintenance",
    OUT_OF_SERVICE = "Out of Service",
}

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
    [AircraftStatus.AVAILABLE]: "Available",
    [AircraftStatus.IN_FLIGHT]: "InFlight",
    [AircraftStatus.MAINTENANCE]: "Maintenance",
    [AircraftStatus.OUT_OF_SERVICE]: "Out of Service",
};

// Common aircraft manufacturers for dropdown options
export const AIRCRAFT_MANUFACTURERS = [
    "Airbus",
    "Boeing",
    "Bombardier",
    "Beechcraft",
    "Cessna",
    "Dassault",
    "Embraer",
    "Gulfstream",
    "Hawker",
    "Learjet",
    "Piper",
    "Other"
];

// Popular private jet models by manufacturer
export const AIRCRAFT_MODELS_BY_MANUFACTURER: Record<string, string[]> = {
    "Bombardier": ["Learjet 75", "Global 7500", "Challenger 350", "Global 6000"],
    "Cessna": ["Citation X", "Citation CJ4", "Citation Sovereign", "Citation Mustang"],
    "Dassault": ["Falcon 900EX", "Falcon 7X", "Falcon 2000", "Falcon 50"],
    "Gulfstream": ["G650", "G550", "G450", "G280"],
    "Beechcraft": ["King Air 350", "King Air 250", "Premier 1A"],
    "Embraer": ["Legacy 600", "Phenom 300", "Lineage 1000"],
    "Other": ["Custom Model"]
};

export interface DeleteAircraftError {
    message: string;
    errors: {
        flights: string[];
    }
}