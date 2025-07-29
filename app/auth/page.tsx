"use client";

import * as React from "react";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");

  const handleToggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthForm
          mode={mode}
          onToggleMode={handleToggleMode}
        />
      </div>
    </div>
  );
}
