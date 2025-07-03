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
import { FormInput } from "@/components/ui/form-input";
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button";
import { Separator } from "@/components/ui/separator";
import {
  signInSchema,
  signUpSchema,
  SignInFormData,
  SignUpFormData,
} from "@/lib/validations/auth";

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
  onSubmit: (data: SignInFormData | SignUpFormData) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

export function AuthForm({
  mode,
  onToggleMode,
  onSubmit,
  onGoogleSignIn,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const isSignUp = mode === "signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const handleFormSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await onSubmit(data);
      } else {
        const { email, password } = data;
        await onSubmit({ email, password });
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleModeToggle = () => {
    reset();
    onToggleMode();
  };

  return (
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
        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
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
            <FormInput
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              registration={register("name")}
              error={errors.name?.message}
              disabled={isLoading}
            />
          )}

          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            registration={register("email")}
            error={errors.email?.message}
            disabled={isLoading}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            registration={register("password")}
            error={errors.password?.message}
            disabled={isLoading}
          />

          {isSignUp && (
            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
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
  );
}
