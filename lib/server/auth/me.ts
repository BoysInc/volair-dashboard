"use server";
import { tryCatch } from "@/lib/utils";
import { User } from "@/lib/types/auth";

export const getMe = async (token: string): Promise<{ data: User | null, error: string | null }> => {

    if (!token) {
        return { data: null, error: "No authentication token provided" };
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
        console.log("error", error)
        return { data: null, error: error.message };
    }

    const { data: userData, error: userError } = await tryCatch(data.json())

    if (userError) {
        console.log("userError", userError)
        return { data: null, error: userError.message };
    }

    return { data: userData.data.user as User, error: null };
}