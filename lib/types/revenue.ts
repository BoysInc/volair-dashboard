import { Payment, Booking } from './database';

// Revenue statistics for overview cards
export interface RevenueStats {
    total_revenue: number;
    monthly_revenue: number;
    weekly_revenue: number;
    daily_revenue: number;
    revenue_growth_percentage: number;
    total_payments: number;
    pending_payments: number;
    completed_payments: number;
    failed_payments: number;
    average_booking_value: number;
    total_bookings: number;
}

// Revenue data over time for charts
export interface RevenueOverTime {
    date: string; // ISO date string
    revenue: number;
    bookings_count: number;
    payments_count: number;
}

// Payment status breakdown
export interface PaymentStatusBreakdown {
    status: number;
    status_name: string;
    count: number;
    total_amount: number;
    percentage: number;
}

// Revenue by aircraft
export interface RevenueByAircraft {
    aircraft_id: string;
    aircraft_model: string;
    registration_number: string;
    total_revenue: number;
    bookings_count: number;
    utilization_percentage: number;
}

// Monthly revenue comparison
export interface MonthlyRevenueComparison {
    month: string;
    current_year_revenue: number;
    previous_year_revenue: number;
    growth_percentage: number;
}

// Payment method breakdown
export interface PaymentMethodBreakdown {
    payment_method: number;
    method_name: string;
    count: number;
    total_amount: number;
    percentage: number;
}

// Extended payment interface with related data
export interface PaymentWithDetails extends Payment {
    booking: Booking & {
        flight?: {
            aircraft?: {
                model_name: string;
                registration_number: string;
            };
        };
    };
}

// Revenue dashboard data structure
export interface RevenueDashboardData {
    stats: RevenueStats;
    revenue_over_time: RevenueOverTime[];
    payment_status_breakdown: PaymentStatusBreakdown[];
    revenue_by_aircraft: RevenueByAircraft[];
    monthly_comparison: MonthlyRevenueComparison[];
    payment_method_breakdown: PaymentMethodBreakdown[];
    recent_payments: PaymentWithDetails[];
}

// Payment status enums (matching database values)
export enum PaymentStatus {
    PENDING = 0,
    COMPLETED = 1,
    FAILED = 2,
    REFUNDED = 3,
}

// Payment method enums (matching database values)
export enum PaymentMethod {
    CREDIT_CARD = 0,
    DEBIT_CARD = 1,
    BANK_TRANSFER = 2,
    WALLET = 3,
    CRYPTO = 4,
}

// Chart data types for different visualizations
export interface ChartDataPoint {
    name: string;
    value: number;
    fill?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    revenue: number;
    bookings?: number;
    payments?: number;
} 