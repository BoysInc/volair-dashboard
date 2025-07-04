"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number";
  className?: string;
  disabled?: boolean;
}

export const FormField = forwardRef<
  HTMLInputElement,
  FormFieldProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      label,
      error,
      placeholder,
      required = false,
      type = "text",
      className,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
