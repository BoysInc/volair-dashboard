"use client";

import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}
