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


export const signup = async ({ email, password, name, phone, confirmPassword }: SignUpFormData): Promise<AuthResult> => {

    const resBody = JSON.stringify({ email, password, "first_name": name.split(" ")[0], "last_name": name.split(" ")[1], phone, "password_confirmation": confirmPassword })

    // console.log(resBody)

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: resBody,
        })
    )

    if (error !== null) {
        // console.log(error)
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

    const { data: userData, error: userError } = await tryCatch(data.json())

    if (userError) {
        // console.log(userError)
        return { error: userError.message };
    }

    // console.log(userData)

    return { data: userData };
};