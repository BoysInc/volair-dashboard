"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomInput } from "@/components/ui/custom-input";
import { Separator } from "@/components/ui/separator";
import {
  signInSchema,
  signUpSchema,
  SignUpFormData,
} from "@/lib/validations/auth";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { login, signup } from "@/lib/server/auth/login";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import { tryCatch } from "@/lib/utils";

const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
  onGoogleSignIn: () => Promise<void>;
}

export function AuthForm({
  mode,
  onToggleMode,
}: AuthFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const { setAuth, setLoading, isLoading } = useAuthStore();

  const isSignUp = mode === "signup";

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const handleFormSubmit = async (data: SignUpFormData) => {
    setLoading(true);

    if (isSignUp) {
      const {
        error: signupError,
        validationErrors,
      } = await signup(data);

      if (signupError) {
        // console.log("Signup error:", signupError);
        toast.error(signupError);

        // Handle validation errors
        if (validationErrors) {
          // Display a generic message for validation errors
          toast.error("Please check your input and try again");
        }

        setLoading(false);
        return;
      }

      // console.log("Signup data:", signupData);
      toast.success("Account created successfully!");
      setLoading(false);
      router.push("/onboarding");
    } else {
      const {
        data: loginData,
        error: loginError,
        validationErrors,
      } = await login(data);

      if (loginError) {
        toast.error(loginError);

        // Handle validation errors
        if (validationErrors) {
          toast.error("Please check your input and try again");
        }

        setLoading(false);
        return;
      }

      if (loginData) {
        // Store auth data in Zustand store
        setAuth(loginData.data);
        toast.success(loginData.message || "Logged in successfully!");
        // console.log("Login data:", loginData);
        router.push("/");
      }

      setLoading(false);
    }
  };

  const handleModeToggle = () => {
    reset();
    onToggleMode();
  };

  const handleLogin = async (credentialResponse: any) => {
    const { data: res, error: fetchError } = await tryCatch(
      fetch("https://nelwhix.online/api/v1/auth/google/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
    );

    if (fetchError) {
      toast.error("Failed to connect to Google authentication");
      return;
    }

    const { data: responseData, error: jsonError } = await tryCatch(res.json());

    if (jsonError) {
      toast.error("Invalid response from Google authentication");
      return;
    }

    // console.log("Google login response:", responseData);

    if (responseData.token) {
      // TODO: Integrate with Zustand store instead of localStorage
      localStorage.setItem("auth_token", responseData.token);
      // console.log("Google User:", responseData);
      toast.success("Successfully logged in with Google!");
    } else {
      toast.error("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientID!}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleLogin
            onSuccess={handleLogin}
            onError={() => toast.error("Google login failed")}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {isSignUp && (
              <CustomInput
                id="name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                registration={register("name")}
                error={errors.name?.message}
                disabled={isLoading}
                required
              />
            )}

            <CustomInput
              id="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              registration={register("email")}
              error={errors.email?.message}
              disabled={isLoading}
              required
            />

            {isSignUp && (
              <CustomInput
                id="phone"
                label="Phone"
                type="tel"
                placeholder="Enter your phone number"
                registration={register("phone")}
                error={errors.phone?.message}
                disabled={isLoading}
                required
              />
            )}

            <CustomInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              registration={register("password")}
              error={errors.password?.message}
              disabled={isLoading}
              showPasswordToggle
              required
            />

            {isSignUp && (
              <CustomInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
                showPasswordToggle
                required
              />
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={handleModeToggle}
              className="text-primary underline-offset-4 hover:underline"
              disabled={isLoading || isGoogleLoading}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </GoogleOAuthProvider>
  );
}
