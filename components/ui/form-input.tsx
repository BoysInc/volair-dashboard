"use client";

import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, label, error, registration, ...props }, ref) => {
    return (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Input
          type={type}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...registration}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export { FormInput };
