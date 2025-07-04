// Booking Status Enum
export enum BookingStatus {
    PENDING = 1,
    CONFIRMED = 2,
    CANCELLED = 3,
    COMPLETED = 4,
    NO_SHOW = 5,
}

export const BOOKING_STATUS_LABELS = {
    [BookingStatus.PENDING]: "Pending",
    [BookingStatus.CONFIRMED]: "Confirmed",
    [BookingStatus.CANCELLED]: "Cancelled",
    [BookingStatus.COMPLETED]: "Completed",
    [BookingStatus.NO_SHOW]: "No Show",
} as const;

export const BOOKING_STATUS_COLORS = {
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
    [BookingStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
    [BookingStatus.COMPLETED]: "bg-blue-100 text-blue-800 border-blue-200",
    [BookingStatus.NO_SHOW]: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

// Payment Status Enum
export enum PaymentStatus {
    PENDING = 1,
    COMPLETED = 2,
    FAILED = 3,
    REFUNDED = 4,
}

export const PAYMENT_STATUS_LABELS = {
    [PaymentStatus.PENDING]: "Pending",
    [PaymentStatus.COMPLETED]: "Completed",
    [PaymentStatus.FAILED]: "Failed",
    [PaymentStatus.REFUNDED]: "Refunded",
} as const;

export const PAYMENT_STATUS_COLORS = {
    [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
    [PaymentStatus.FAILED]: "bg-red-100 text-red-800 border-red-200",
    [PaymentStatus.REFUNDED]: "bg-orange-100 text-orange-800 border-orange-200",
} as const;

// Payment Method Enum
export enum PaymentMethod {
    CREDIT_CARD = 1,
    BANK_TRANSFER = 2,
    PAYSTACK = 3,
    FLUTTERWAVE = 4,
    MOBILE_MONEY = 5,
}

export const PAYMENT_METHOD_LABELS = {
    [PaymentMethod.CREDIT_CARD]: "Credit Card",
    [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
    [PaymentMethod.PAYSTACK]: "Paystack",
    [PaymentMethod.FLUTTERWAVE]: "Flutterwave",
    [PaymentMethod.MOBILE_MONEY]: "Mobile Money",
} as const;

// Flight Status Enum
export enum FlightStatus {
    SCHEDULED = 1,
    BOARDING = 2,
    DEPARTED = 3,
    ARRIVED = 4,
    DELAYED = 5,
    CANCELLED = 6,
}

export const FLIGHT_STATUS_LABELS = {
    [FlightStatus.SCHEDULED]: "Scheduled",
    [FlightStatus.BOARDING]: "Boarding",
    [FlightStatus.DEPARTED]: "Departed",
    [FlightStatus.ARRIVED]: "Arrived",
    [FlightStatus.DELAYED]: "Delayed",
    [FlightStatus.CANCELLED]: "Cancelled",
} as const;

export const FLIGHT_STATUS_COLORS = {
    [FlightStatus.SCHEDULED]: "bg-blue-100 text-blue-800 border-blue-200",
    [FlightStatus.BOARDING]: "bg-purple-100 text-purple-800 border-purple-200",
    [FlightStatus.DEPARTED]: "bg-indigo-100 text-indigo-800 border-indigo-200",
    [FlightStatus.ARRIVED]: "bg-green-100 text-green-800 border-green-200",
    [FlightStatus.DELAYED]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [FlightStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
} as const;

// Aircraft Status Enum
export enum AircraftStatus {
    ACTIVE = 1,
    MAINTENANCE = 2,
    INACTIVE = 3,
}

export const AIRCRAFT_STATUS_LABELS = {
    [AircraftStatus.ACTIVE]: "Active",
    [AircraftStatus.MAINTENANCE]: "Maintenance",
    [AircraftStatus.INACTIVE]: "Inactive",
} as const; 