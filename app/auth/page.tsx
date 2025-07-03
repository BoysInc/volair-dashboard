"use client";

import * as React from "react";
import { AuthForm } from "@/components/auth-form";
import { SignInFormData, SignUpFormData } from "@/lib/validations/auth";

export default function AuthPage() {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");

  const handleToggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  const handleSubmit = async (data: SignInFormData | SignUpFormData) => {
    // TODO: Implement actual authentication logic here
    console.log("Form submitted:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (mode === "signin") {
      console.log("Signing in with:", data);
      // Handle sign in logic
    } else {
      console.log("Signing up with:", data);
      // Handle sign up logic
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google sign-in logic here
    console.log("Google sign in clicked");

    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Google sign in completed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthForm
          mode={mode}
          onToggleMode={handleToggleMode}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  );
}
