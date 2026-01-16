import { z } from "zod"

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
})

export const signUpSchema = z.object({
    name: z
        .string()
        .min(1, "Operator name is required")
        .min(2, "Name must be at least 2 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    phone: z
        .string()
        .min(1, "Phone is required")
        .min(10, "Phone must be at least 10 characters"),
    country: z
        .string()
        .min(1, "Country is required"),
    license_number: z
        .string()
        .min(1, "License number is required"),
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema> 