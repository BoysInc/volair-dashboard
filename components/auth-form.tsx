"use client";

import * as React from "react";
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
import { Loader2 } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthViewModel } from "@/hooks/use-auth-view-model";
import { CountrySelect } from "@/components/forms/country-select";

const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const {
    form,
    isSignUp,
    isLoading,
    isGoogleLoading,
    isAnyLoading,
    handleSubmit,
    handleGoogleLogin,
    handleGoogleError,
  } = useAuthViewModel(mode);

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <GoogleOAuthProvider clientId={googleClientID!}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Register Your Operator" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Enter your operator details to get started"
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGoogleLoading ? (
            <Button type="button" variant="outline" className="w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in with Google...
            </Button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
            />
          )}

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <CustomInput
                id="name"
                label="Operator Name"
                type="text"
                placeholder="ABC Aviation"
                registration={register("name" as any)}
                error={(errors as any).name?.message}
                disabled={isAnyLoading}
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
              disabled={isAnyLoading}
              required
            />

            {isSignUp && (
              <>
                <CustomInput
                  id="phone"
                  label="Phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  registration={register("phone" as any)}
                  error={(errors as any).phone?.message}
                  disabled={isAnyLoading}
                  required
                />

                <CountrySelect
                  label="Country"
                  value={form.watch("country" as any)}
                  onChange={(value) => form.setValue("country" as any, value)}
                  error={(errors as any).country?.message}
                  required
                />

                <CustomInput
                  id="license_number"
                  label="License Number"
                  type="text"
                  placeholder="Enter your operator license number"
                  registration={register("license_number" as any)}
                  error={(errors as any).license_number?.message}
                  disabled={isAnyLoading}
                  required
                />
              </>
            )}

            {!isSignUp && (
              <CustomInput
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                registration={register("password" as any)}
                error={(errors as any).password?.message}
                disabled={isAnyLoading}
                showPasswordToggle
                required
              />
            )}

            <Button type="submit" className="w-full" disabled={isAnyLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? isSignUp
                  ? "Registering Operator..."
                  : "Signing In..."
                : isSignUp
                ? "Register Operator"
                : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary underline-offset-4 hover:underline"
              disabled={isAnyLoading}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </GoogleOAuthProvider>
  );
}
