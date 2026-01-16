// Types matching the API response for operator bookings

export interface BookingUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface BookingAirport {
  id: string;
  name: string;
  iata_code: string;
  city: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
}

export interface BookingMedia {
  id: string;
  url: string;
  type: string;
  order: number;
}

export interface BookingAircraft {
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
  status: string;
  flight_id: string;
  media: BookingMedia[];
}

export interface OperatorBooking {
  id: string;
  from: BookingAirport;
  to: BookingAirport;
  aircraft: BookingAircraft;
  departure_passenger_count: number;
  return_passenger_count: number;
  price_usd: number;
  operator_price_usd: number;
  status: string;
  departure_date: string;
  return_date: string | null;
  created_at: string;
  type: string;
  flight_duration: string;
  user: BookingUser;
}

export interface GetOperatorBookingsResponse {
  data: OperatorBooking[];
}

// Widget data for booking statistics
export interface BookingWidgets {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  revenue: number;
}

