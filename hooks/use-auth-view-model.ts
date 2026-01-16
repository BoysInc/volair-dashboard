import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, signup } from "@/lib/server/auth/login";
import { useAuthStore } from "@/lib/store/auth-store";
import { tryCatch } from "@/lib/utils";
import {
    signInSchema,
    signUpSchema,
    SignUpFormData,
    SignInFormData,
} from "@/lib/validations/auth";

type AuthMode = "signin" | "signup";

export function useAuthViewModel(mode: AuthMode) {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const isSignUp = mode === "signup";

    // Form management - use union type to handle both schemas
    const form = useForm<SignUpFormData | SignInFormData>({
        resolver: zodResolver(isSignUp ? signUpSchema : signInSchema) as any,
    });

    // Reset form when mode changes
    React.useEffect(() => {
        form.reset();
    }, [mode, form]);

    // Sign In Mutation
    const signInMutation = useMutation({
        mutationFn: async (data: SignInFormData) => {
            const result = await login(data);

            if (result.error) {
                throw new Error(result.error);
            }

            if (!result.data) {
                throw new Error("Login failed");
            }

            return result.data;
        },
        onSuccess: (data) => {
            setAuth({ ...data.data, operator: null });
            toast.success(data.message || "Logged in successfully!");
            router.push("/home");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Login failed");
        },
    });

    // Sign Up Mutation
    const signUpMutation = useMutation({
        mutationFn: async (data: SignUpFormData) => {
            const result = await signup(data);

            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        },
        onSuccess: () => {
            toast.success("Account created successfully!");
            router.push("/home");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Signup failed");
        },
    });

    // Google Login Mutation
    const googleLoginMutation = useMutation({
        mutationFn: async (credential: string) => {
            const { data: res, error: fetchError } = await tryCatch(
                fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/google/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({ credential }),
                    }
                )
            );

            if (fetchError || !res) {
                throw new Error("Failed to connect to Google authentication");
            }

            const { data: responseData, error: jsonError } = await tryCatch(
                res.json()
            );

            if (jsonError || !responseData) {
                throw new Error("Invalid response from Google authentication");
            }

            return responseData;
        },
        onSuccess: (data) => {
            setAuth({
                token: data.data.token,
                user: data.data.user,
                operator: null,
            });
            toast.success("Logged in successfully!");
            router.push("/home");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Google login failed");
        },
    });

    // Handlers
    const handleSubmit = form.handleSubmit((data) => {
        if (isSignUp) {
            signUpMutation.mutate(data as SignUpFormData);
        } else {
            signInMutation.mutate(data as SignInFormData);
        }
    });

    const handleGoogleLogin = (credentialResponse: any) => {
        googleLoginMutation.mutate(credentialResponse.credential);
    };

    const handleGoogleError = () => {
        toast.error("Google login failed");
    };

    // Computed state
    const isLoading = isSignUp
        ? signUpMutation.isPending
        : signInMutation.isPending;
    const isGoogleLoading = googleLoginMutation.isPending;
    const isAnyLoading = isLoading || isGoogleLoading;

    return {
        // Form
        form,
        isSignUp,

        // Loading states
        isLoading,
        isGoogleLoading,
        isAnyLoading,

        // Handlers
        handleSubmit,
        handleGoogleLogin,
        handleGoogleError,
    };
}

