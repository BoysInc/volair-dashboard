export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: Date;
    password: string;
    phone: string;
    role: number;
}

export interface Operator {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    license_number: string;
    verified: boolean;
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
    status: number;
}

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

export interface Flight {
    id: string;
    aircraft_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    departure_time: Date;
    arrival_time: Date;
    estimated_duration: string;
    status: number;
    price_usd: number;
}

export interface Booking {
    id: string;
    user_id: string;
    flight_id: string;
    passenger_count: number;
    total_price: number;
    status: number;
}

export interface Payment {
    id: string;
    booking_id: string;
    amount: number;
    currency: string;
    payment_method: number;
    payment_status: number;
    transaction_reference: string;
    payment_date: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    read: boolean;
    sent_at: Date;
}

export interface Review {
    id: string;
    user_id: string;
    aircraft_id: string;
    rating: number;
    comment: string;
}

// Extended types for UI components with joined data
export interface BookingWithDetails extends Booking {
    user: User;
    flight: Flight & {
        aircraft: Aircraft & {
            operator: Operator;
        };
        departure_airport: Airport;
        arrival_airport: Airport;
    };
    payment?: Payment;
}

export interface FlightWithDetails extends Flight {
    aircraft: Aircraft & {
        operator: Operator;
    };
    departure_airport: Airport;
    arrival_airport: Airport;
} 