import { AircraftStatus } from "@/lib/types/aircraft";

/**
 * Get the appropriate badge variant for an aircraft status
 */
export const getStatusBadgeVariant = (status: AircraftStatus) => {
    switch (status) {
        case AircraftStatus.AVAILABLE:
            return "default";
        case AircraftStatus.IN_FLIGHT:
            return "secondary";
        case AircraftStatus.MAINTENANCE:
            return "destructive";
        case AircraftStatus.OUT_OF_SERVICE:
            return "outline";
        default:
            return "secondary";
    }
};

/**
 * Get the appropriate text color for an aircraft status
 */
export const getStatusColor = (status: AircraftStatus) => {
    switch (status) {
        case AircraftStatus.AVAILABLE:
            return "text-white";
        case AircraftStatus.IN_FLIGHT:
            return "text-black";
        case AircraftStatus.MAINTENANCE:
            return "text-white";
        case AircraftStatus.OUT_OF_SERVICE:
            return "text-black";
        default:
            return "text-gray-600";
    }
};

/**
 * Get available status transitions for an aircraft based on its current status
 */
export const getAvailableStatusTransitions = (currentStatus: AircraftStatus) => {
    switch (currentStatus) {
        case AircraftStatus.AVAILABLE:
            return [
                { status: AircraftStatus.IN_FLIGHT, label: "Mark as In Flight" },
                { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
                {
                    status: AircraftStatus.OUT_OF_SERVICE,
                    label: "Take Out of Service",
                },
            ];
        case AircraftStatus.IN_FLIGHT:
            return [
                { status: AircraftStatus.AVAILABLE, label: "Mark as Available" },
                { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
            ];
        case AircraftStatus.MAINTENANCE:
            return [
                { status: AircraftStatus.AVAILABLE, label: "Return to Service" },
                {
                    status: AircraftStatus.OUT_OF_SERVICE,
                    label: "Take Out of Service",
                },
            ];
        case AircraftStatus.OUT_OF_SERVICE:
            return [
                { status: AircraftStatus.AVAILABLE, label: "Return to Service" },
                { status: AircraftStatus.MAINTENANCE, label: "Send to Maintenance" },
            ];
        default:
            return [];
    }
};

/**
 * Get a human-readable status label
 */
export const getStatusLabel = (status: AircraftStatus): string => {
    switch (status) {
        case AircraftStatus.AVAILABLE:
            return "Available";
        case AircraftStatus.IN_FLIGHT:
            return "In Flight";
        case AircraftStatus.MAINTENANCE:
            return "Maintenance";
        case AircraftStatus.OUT_OF_SERVICE:
            return "Out of Service";
        default:
            return "Unknown";
    }
};

/**
 * Check if an aircraft status allows for booking/scheduling
 */
export const isBookableStatus = (status: AircraftStatus): boolean => {
    return status === AircraftStatus.AVAILABLE;
};

/**
 * Check if an aircraft status is considered active (not out of service)
 */
export const isActiveStatus = (status: AircraftStatus): boolean => {
    return status !== AircraftStatus.OUT_OF_SERVICE;
};

/**
 * Define the error enums for deleting aircraft
 */
export enum DeleteAircraftErrorEnum {
    AIRCRAFT_WITH_FLIGHTS = "Cannot delete aircraft with flights",
    UNKNOWN = "Unknown error",
}