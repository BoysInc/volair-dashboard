"use client";

import { OperatorOnboardingForm } from "@/components/forms/operator-onboarding-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            We need a few more details to set up your operator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OperatorOnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
