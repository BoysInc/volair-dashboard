"use server"
import { tryCatch } from "@/lib/utils";
import { SignInFormData, SignUpFormData } from "@/lib/validations/auth";
import { LoginResponse } from "@/lib/types/auth";

export type AuthError = {
    message: string;
    errors: Record<string, string[]>;
}

export type AuthResult<T = any> = {
    data?: T;
    error?: string;
    validationErrors?: Record<string, string[]>;
}

export const login = async ({ email, password }: SignInFormData): Promise<AuthResult<LoginResponse>> => {

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
    )

    if (error !== null) {
        return { error: error.message };
    }

    if (!data.ok) {
        // Try to get error details from response using tryCatch
        const { data: errorData, error: parseError } = await tryCatch(data.json());

        if (!parseError && errorData?.errors) {
            return {
                error: errorData.message || "Login failed",
                validationErrors: errorData.errors
            };
        }

        return { error: `Failed to login: ${data.status} ${data.statusText}` };
    }

    const { data: userData, error: userError } = await tryCatch(data.json())

    if (userError) {
        // console.log(userError)
        return { error: userError.message };
    }

    return { data: userData as LoginResponse };

}


export const signup = async ({ email, name, phone, country, license_number }: SignUpFormData): Promise<AuthResult> => {

    const resBody = JSON.stringify({
        name,
        email,
        phone,
        country,
        license_number,
        members: [
            {
                email,
                role: "Admin"
            }
        ]
    })

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/operators`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: resBody,
        })
    )

    if (error !== null) {
        return { error: error.message };
    }

    if (!data.ok) {
        // Try to get error details from response using tryCatch
        const { data: errorData, error: parseError } = await tryCatch(data.json());

        if (!parseError && errorData?.errors) {
            return {
                error: errorData.message || "Signup failed",
                validationErrors: errorData.errors
            };
        }

        return { error: `Failed to signup: ${data.status} ${data.statusText}` };
    }

    const { data: operatorData, error: operatorError } = await tryCatch(data.json())

    if (operatorError) {
        return { error: operatorError.message };
    }

    return { data: operatorData };
};