export interface OperatorData {
    name: string;
    country: string;
    license_number: string;
}

export interface OperatorProfile extends OperatorData {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
} 