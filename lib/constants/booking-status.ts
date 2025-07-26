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
    [BookingStatus.PENDING]: "bg-amber-50 text-amber-700 border-amber-200",
    [BookingStatus.CONFIRMED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [BookingStatus.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
    [BookingStatus.COMPLETED]: "bg-teal-50 text-teal-700 border-teal-200",
    [BookingStatus.NO_SHOW]: "bg-slate-50 text-slate-600 border-slate-200",
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
    [PaymentStatus.PENDING]: "bg-amber-50 text-amber-700 border-amber-200",
    [PaymentStatus.COMPLETED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [PaymentStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
    [PaymentStatus.REFUNDED]: "bg-orange-50 text-orange-700 border-orange-200",
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
    [FlightStatus.SCHEDULED]: "bg-blue-50 text-blue-700 border-blue-200",
    [FlightStatus.BOARDING]: "bg-purple-50 text-purple-700 border-purple-200",
    [FlightStatus.DEPARTED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
    [FlightStatus.ARRIVED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [FlightStatus.DELAYED]: "bg-amber-50 text-amber-700 border-amber-200",
    [FlightStatus.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
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