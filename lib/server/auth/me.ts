"use server";
import { tryCatch } from "@/lib/utils";
import { Operator, User } from "@/lib/types/auth";

export const getMe = async (token: string): Promise<{ user: User | null, operator: Operator | null, error: string | null }> => {

    if (!token) {
        return { user: null, operator: null, error: "No authentication token provided" };
    }

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
    )

    if (error) {
        return { user: null, operator: null, error: error.message };
    }

    const { data: userData, error: userError } = await tryCatch(data.json())

    if (userError) {
        return { user: null, operator: null, error: userError.message };
    }

    return { user: userData.data.user as User, operator: userData.data.operator as Operator, error: null };
}