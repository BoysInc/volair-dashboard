"use client";

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

const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AuthForm() {
  const {
    form,
    isLoading,
    isGoogleLoading,
    isAnyLoading,
    handleSubmit,
    handleGoogleLogin,
    handleGoogleError,
  } = useAuthViewModel();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <GoogleOAuthProvider clientId={googleClientID!}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
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

            <CustomInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              registration={register("password")}
              error={errors.password?.message}
              disabled={isAnyLoading}
              showPasswordToggle
              required
            />

            <Button type="submit" className="w-full" disabled={isAnyLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </GoogleOAuthProvider>
  );
}
