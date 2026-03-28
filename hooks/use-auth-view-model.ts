import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/server/auth/login";
import { useAuthStore } from "@/lib/store/auth-store";
import { tryCatch } from "@/lib/utils";
import { signInSchema, SignInFormData } from "@/lib/validations/auth";

export function useAuthViewModel() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

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
        signInMutation.mutate(data);
    });

    const handleGoogleLogin = (credentialResponse: any) => {
        googleLoginMutation.mutate(credentialResponse.credential);
    };

    const handleGoogleError = () => {
        toast.error("Google login failed");
    };

    // Computed state
    const isLoading = signInMutation.isPending;
    const isGoogleLoading = googleLoginMutation.isPending;
    const isAnyLoading = isLoading || isGoogleLoading;

    return {
        // Form
        form,

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

