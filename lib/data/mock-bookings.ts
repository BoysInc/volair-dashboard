import { BookingWithDetails } from "@/lib/types/database";
import { BookingStatus, PaymentStatus, PaymentMethod, FlightStatus, AircraftStatus } from "@/lib/constants/booking-status";

export const mockBookings: BookingWithDetails[] = [
    {
        id: "booking-001",
        user_id: "user-001",
        flight_id: "flight-001",
        passenger_count: 4,
        total_price: 25000,
        status: BookingStatus.CONFIRMED,
        user: {
            id: "user-001",
            first_name: "Adebayo",
            last_name: "Ogundimu",
            email: "adebayo.ogundimu@example.com",
            email_verified_at: new Date("2024-01-15T10:30:00Z"),
            password: "hashed_password",
            phone: "+234 801 234 5678",
            role: 1,
        },
        flight: {
            id: "flight-001",
            aircraft_id: "aircraft-001",
            departure_airport_id: "airport-001",
            arrival_airport_id: "airport-002",
            departure_time: new Date("2024-02-15T08:00:00Z"),
            arrival_time: new Date("2024-02-15T10:30:00Z"),
            estimated_duration: "2h 30m",
            status: FlightStatus.SCHEDULED,
            price_usd: 6250,
            aircraft: {
                id: "aircraft-001",
                operator_id: "operator-001",
                model_name: "Citation CJ3+",
                manufacturer: "Cessna",
                registration_number: "5N-ABC",
                seating_capacity: 8,
                range_km: 3700,
                speed_kph: 720,
                wifi_available: true,
                image_url: "/aircraft/citation-cj3.jpg",
                status: AircraftStatus.ACTIVE,
                operator: {
                    id: "operator-001",
                    name: "Nigerian Executive Jets",
                    email: "ops@nigerianexecutivejets.com",
                    phone: "+234 1 234 5678",
                    country: "Nigeria",
                    license_number: "NGA-OPS-001",
                    verified: true,
                },
            },
            departure_airport: {
                id: "airport-001",
                name: "Murtala Muhammed International Airport",
                iata_code: "LOS",
                city: "Lagos",
                country: "Nigeria",
                latitude: 6.5774,
                longitude: 3.3212,
                timezone: "Africa/Lagos",
            },
            arrival_airport: {
                id: "airport-002",
                name: "Nnamdi Azikiwe International Airport",
                iata_code: "ABV",
                city: "Abuja",
                country: "Nigeria",
                latitude: 9.0067,
                longitude: 7.2632,
                timezone: "Africa/Lagos",
            },
        },
        payment: {
            id: "payment-001",
            booking_id: "booking-001",
            amount: 25000,
            currency: "USD",
            payment_method: PaymentMethod.PAYSTACK,
            payment_status: PaymentStatus.COMPLETED,
            transaction_reference: "PAYSTACK_TXN_001234567890",
            payment_date: new Date("2024-01-16T14:22:00Z"),
        },
    },
    {
        id: "booking-002",
        user_id: "user-002",
        flight_id: "flight-002",
        passenger_count: 2,
        total_price: 18000,
        status: BookingStatus.PENDING,
        user: {
            id: "user-002",
            first_name: "Fatima",
            last_name: "Abdullahi",
            email: "fatima.abdullahi@example.com",
            email_verified_at: new Date("2024-01-10T09:15:00Z"),
            password: "hashed_password",
            phone: "+234 802 345 6789",
            role: 1,
        },
        flight: {
            id: "flight-002",
            aircraft_id: "aircraft-002",
            departure_airport_id: "airport-002",
            arrival_airport_id: "airport-003",
            departure_time: new Date("2024-02-20T14:00:00Z"),
            arrival_time: new Date("2024-02-20T15:45:00Z"),
            estimated_duration: "1h 45m",
            status: FlightStatus.SCHEDULED,
            price_usd: 9000,
            aircraft: {
                id: "aircraft-002",
                operator_id: "operator-002",
                model_name: "King Air 350",
                manufacturer: "Beechcraft",
                registration_number: "5N-DEF",
                seating_capacity: 11,
                range_km: 2800,
                speed_kph: 580,
                wifi_available: false,
                image_url: "/aircraft/king-air-350.jpg",
                status: AircraftStatus.ACTIVE,
                operator: {
                    id: "operator-002",
                    name: "West African Aviation",
                    email: "info@westafricanaviation.com",
                    phone: "+234 9 876 5432",
                    country: "Nigeria",
                    license_number: "NGA-OPS-002",
                    verified: true,
                },
            },
            departure_airport: {
                id: "airport-002",
                name: "Nnamdi Azikiwe International Airport",
                iata_code: "ABV",
                city: "Abuja",
                country: "Nigeria",
                latitude: 9.0067,
                longitude: 7.2632,
                timezone: "Africa/Lagos",
            },
            arrival_airport: {
                id: "airport-003",
                name: "Mallam Aminu Kano International Airport",
                iata_code: "KAN",
                city: "Kano",
                country: "Nigeria",
                latitude: 12.0476,
                longitude: 8.5242,
                timezone: "Africa/Lagos",
            },
        },
        payment: {
            id: "payment-002",
            booking_id: "booking-002",
            amount: 18000,
            currency: "USD",
            payment_method: PaymentMethod.BANK_TRANSFER,
            payment_status: PaymentStatus.PENDING,
            transaction_reference: "BANK_TXN_987654321",
            payment_date: new Date("2024-01-18T11:30:00Z"),
        },
    },
    {
        id: "booking-003",
        user_id: "user-003",
        flight_id: "flight-003",
        passenger_count: 6,
        total_price: 35000,
        status: BookingStatus.COMPLETED,
        user: {
            id: "user-003",
            first_name: "Chioma",
            last_name: "Okafor",
            email: "chioma.okafor@example.com",
            email_verified_at: new Date("2023-12-20T16:45:00Z"),
            password: "hashed_password",
            phone: "+234 803 456 7890",
            role: 1,
        },
        flight: {
            id: "flight-003",
            aircraft_id: "aircraft-003",
            departure_airport_id: "airport-001",
            arrival_airport_id: "airport-004",
            departure_time: new Date("2024-01-25T06:30:00Z"),
            arrival_time: new Date("2024-01-25T08:15:00Z"),
            estimated_duration: "1h 45m",
            status: FlightStatus.ARRIVED,
            price_usd: 5833,
            aircraft: {
                id: "aircraft-003",
                operator_id: "operator-003",
                model_name: "Falcon 2000",
                manufacturer: "Dassault",
                registration_number: "5N-GHI",
                seating_capacity: 10,
                range_km: 5500,
                speed_kph: 850,
                wifi_available: true,
                image_url: "/aircraft/falcon-2000.jpg",
                status: AircraftStatus.ACTIVE,
                operator: {
                    id: "operator-003",
                    name: "Sahara Jets",
                    email: "operations@saharajets.com",
                    phone: "+234 1 987 6543",
                    country: "Nigeria",
                    license_number: "NGA-OPS-003",
                    verified: true,
                },
            },
            departure_airport: {
                id: "airport-001",
                name: "Murtala Muhammed International Airport",
                iata_code: "LOS",
                city: "Lagos",
                country: "Nigeria",
                latitude: 6.5774,
                longitude: 3.3212,
                timezone: "Africa/Lagos",
            },
            arrival_airport: {
                id: "airport-004",
                name: "Port Harcourt International Airport",
                iata_code: "PHC",
                city: "Port Harcourt",
                country: "Nigeria",
                latitude: 5.0158,
                longitude: 6.9496,
                timezone: "Africa/Lagos",
            },
        },
        payment: {
            id: "payment-003",
            booking_id: "booking-003",
            amount: 35000,
            currency: "USD",
            payment_method: PaymentMethod.CREDIT_CARD,
            payment_status: PaymentStatus.COMPLETED,
            transaction_reference: "CARD_TXN_456789123",
            payment_date: new Date("2024-01-20T13:15:00Z"),
        },
    },
    {
        id: "booking-004",
        user_id: "user-004",
        flight_id: "flight-004",
        passenger_count: 3,
        total_price: 22000,
        status: BookingStatus.CANCELLED,
        user: {
            id: "user-004",
            first_name: "Kwame",
            last_name: "Asante",
            email: "kwame.asante@example.com",
            email_verified_at: new Date("2024-01-05T12:00:00Z"),
            password: "hashed_password",
            phone: "+233 24 123 4567",
            role: 1,
        },
        flight: {
            id: "flight-004",
            aircraft_id: "aircraft-004",
            departure_airport_id: "airport-005",
            arrival_airport_id: "airport-001",
            departure_time: new Date("2024-02-28T10:00:00Z"),
            arrival_time: new Date("2024-02-28T12:30:00Z"),
            estimated_duration: "2h 30m",
            status: FlightStatus.CANCELLED,
            price_usd: 7333,
            aircraft: {
                id: "aircraft-004",
                operator_id: "operator-004",
                model_name: "Hawker 800XP",
                manufacturer: "Hawker Beechcraft",
                registration_number: "9G-JKL",
                seating_capacity: 8,
                range_km: 4600,
                speed_kph: 780,
                wifi_available: true,
                image_url: "/aircraft/hawker-800xp.jpg",
                status: AircraftStatus.ACTIVE,
                operator: {
                    id: "operator-004",
                    name: "Gold Coast Aviation",
                    email: "info@goldcoastaviation.com",
                    phone: "+233 30 234 5678",
                    country: "Ghana",
                    license_number: "GHA-OPS-001",
                    verified: true,
                },
            },
            departure_airport: {
                id: "airport-005",
                name: "Kotoka International Airport",
                iata_code: "ACC",
                city: "Accra",
                country: "Ghana",
                latitude: 5.6052,
                longitude: -0.1668,
                timezone: "Africa/Accra",
            },
            arrival_airport: {
                id: "airport-001",
                name: "Murtala Muhammed International Airport",
                iata_code: "LOS",
                city: "Lagos",
                country: "Nigeria",
                latitude: 6.5774,
                longitude: 3.3212,
                timezone: "Africa/Lagos",
            },
        },
        payment: {
            id: "payment-004",
            booking_id: "booking-004",
            amount: 22000,
            currency: "USD",
            payment_method: PaymentMethod.FLUTTERWAVE,
            payment_status: PaymentStatus.REFUNDED,
            transaction_reference: "FLW_TXN_789123456",
            payment_date: new Date("2024-01-22T09:45:00Z"),
        },
    },
    {
        id: "booking-005",
        user_id: "user-005",
        flight_id: "flight-005",
        passenger_count: 1,
        total_price: 12000,
        status: BookingStatus.NO_SHOW,
        user: {
            id: "user-005",
            first_name: "Amina",
            last_name: "Hassan",
            email: "amina.hassan@example.com",
            email_verified_at: new Date("2024-01-12T08:20:00Z"),
            password: "hashed_password",
            phone: "+234 804 567 8901",
            role: 1,
        },
        flight: {
            id: "flight-005",
            aircraft_id: "aircraft-005",
            departure_airport_id: "airport-003",
            arrival_airport_id: "airport-001",
            departure_time: new Date("2024-02-01T16:00:00Z"),
            arrival_time: new Date("2024-02-01T18:00:00Z"),
            estimated_duration: "2h 00m",
            status: FlightStatus.DEPARTED,
            price_usd: 12000,
            aircraft: {
                id: "aircraft-005",
                operator_id: "operator-005",
                model_name: "Phenom 300",
                manufacturer: "Embraer",
                registration_number: "5N-MNO",
                seating_capacity: 9,
                range_km: 3650,
                speed_kph: 750,
                wifi_available: true,
                image_url: "/aircraft/phenom-300.jpg",
                status: AircraftStatus.ACTIVE,
                operator: {
                    id: "operator-005",
                    name: "Northern Sky Aviation",
                    email: "ops@northernsky.com",
                    phone: "+234 64 321 9876",
                    country: "Nigeria",
                    license_number: "NGA-OPS-005",
                    verified: true,
                },
            },
            departure_airport: {
                id: "airport-003",
                name: "Mallam Aminu Kano International Airport",
                iata_code: "KAN",
                city: "Kano",
                country: "Nigeria",
                latitude: 12.0476,
                longitude: 8.5242,
                timezone: "Africa/Lagos",
            },
            arrival_airport: {
                id: "airport-001",
                name: "Murtala Muhammed International Airport",
                iata_code: "LOS",
                city: "Lagos",
                country: "Nigeria",
                latitude: 6.5774,
                longitude: 3.3212,
                timezone: "Africa/Lagos",
            },
        },
        payment: {
            id: "payment-005",
            booking_id: "booking-005",
            amount: 12000,
            currency: "USD",
            payment_method: PaymentMethod.MOBILE_MONEY,
            payment_status: PaymentStatus.COMPLETED,
            transaction_reference: "MOMO_TXN_321654987",
            payment_date: new Date("2024-01-28T15:30:00Z"),
        },
    },
]; 