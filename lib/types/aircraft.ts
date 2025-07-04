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

export interface AircraftFormData {
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

export enum AircraftStatus {
    AVAILABLE = 0,
    IN_FLIGHT = 1,
    MAINTENANCE = 2,
    OUT_OF_SERVICE = 3,
}

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
    [AircraftStatus.AVAILABLE]: "Available",
    [AircraftStatus.IN_FLIGHT]: "In Flight",
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