"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { OperatorData } from "@/lib/types/operator";
import { CustomInput } from "@/components/ui/custom-input";
import { CountrySelect } from "./country-select";
import { tryCatch } from "@/lib/utils";
import { toast } from "sonner";

interface OperatorOnboardingFormProps {
  onSubmit?: (data: OperatorData) => Promise<void>;
}

export function OperatorOnboardingForm({
  onSubmit,
}: OperatorOnboardingFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OperatorData>({
    defaultValues: {
      name: "",
      country: "",
      license_number: "",
    },
  });

  const onSubmitForm = async (data: OperatorData) => {
    if (onSubmit) {
      const { error } = await tryCatch(onSubmit(data));
      if (error) {
        console.error("Failed to submit operator data:", error);
        toast.error("Failed to submit operator data. Please try again.");
      } else {
        toast.success("Operator data submitted successfully!");
      }
    } else {
      // Default behavior: save to localStorage and redirect
      const { error } = await tryCatch(
        Promise.resolve().then(() => {
          localStorage.setItem("operatorData", JSON.stringify(data));
          router.push("/home");
        })
      );
      if (error) {
        console.error("Failed to save operator data:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <CustomInput
        label="Operator Name"
        placeholder="Enter your operator name"
        required
        error={errors.name?.message}
        registration={register("name", {
          required: "Operator name is required",
          validate: (value) =>
            value.trim() !== "" || "Operator name cannot be empty",
        })}
      />

      <Controller
        name="country"
        control={control}
        rules={{ required: "Country is required" }}
        render={({ field }) => (
          <CountrySelect
            label="Country"
            value={field.value}
            onChange={field.onChange}
            error={errors.country?.message}
            required
          />
        )}
      />

      <CustomInput
        label="License Number"
        placeholder="Enter your license number"
        required
        error={errors.license_number?.message}
        registration={register("license_number", {
          required: "License number is required",
          validate: (value) =>
            value.trim() !== "" || "License number cannot be empty",
        })}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Completing Setup...
          </>
        ) : (
          "Complete Setup"
        )}
      </Button>
    </form>
  );
}
