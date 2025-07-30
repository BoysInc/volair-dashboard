"use client";

import * as React from "react";
import { AuthForm } from "@/components/auth-form";
import { SignInFormData, SignUpFormData } from "@/lib/validations/auth";
import { login, signup } from "@/lib/server/auth/login";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");

  const router = useRouter();

  const handleToggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  const handleSubmit = async (data: SignInFormData | SignUpFormData) => {
    // TODO: Implement actual authentication logic here
    // console.log("Form submitted:", data);

    if (mode === "signin") {
      // console.log("Signing in with:", data);
      // Handle sign in logic
      const { data: loginData, error: loginError } = await login({
        email: data.email,
        password: data.password,
      });

      // console.log("Login data:", loginData);

      if (loginError) {
        console.error("Login error:", loginError);
        return;
      }
    } else if (
      mode === "signup" &&
      "name" in data &&
      "confirmPassword" in data
    ) {
      // console.log("Signing up with:", data);
      // Handle sign up logic
      const { data: signupData, error: signupError } = await signup({
        email: data.email,
        password: data.password,
        name: data.name,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
      });

      if (signupError) {
        console.error("Signup error:", signupError);
        return;
      }

      // console.log("Signup data:", signupData);
      router.push("/onboarding");
    } else {
      console.error("Invalid form data");
      return;
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google sign-in logic here
    // console.log("Google sign in clicked");

    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // console.log("Google sign in completed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthForm
          mode={mode}
          onToggleMode={handleToggleMode}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  );
}
