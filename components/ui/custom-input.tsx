"use client";

import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "datetime-local"
  | "time"
  | "textarea";

export interface CustomInputProps {
  // Basic props
  label?: string;
  placeholder?: string;
  type?: InputType;
  required?: boolean;
  disabled?: boolean;

  // React Hook Form integration
  registration?: UseFormRegisterReturn;
  error?: string;

  // Styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  // Input specific props
  min?: number | string;
  max?: number | string;
  step?: number | string;
  rows?: number; // For textarea

  // HTML attributes
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;

  // Event handlers
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;

  // Additional features
  showPasswordToggle?: boolean;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const CustomInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CustomInputProps
>(
  (
    {
      label,
      placeholder,
      type = "text",
      required = false,
      disabled = false,
      registration,
      error,
      className,
      labelClassName,
      inputClassName,
      min,
      max,
      step,
      rows = 3,
      id,
      name,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      showPasswordToggle = false,
      helperText,
      prefix,
      suffix,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Generate unique ID if not provided
    const fieldId =
      id ||
      `input-${label?.toLowerCase().replace(/\s+/g, "-")}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    // Determine actual input type
    const inputType = type === "password" && showPassword ? "text" : type;

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Extract ref from registration to handle it separately
    const { ref: registrationRef, ...registrationProps } = registration || {};

    // Common input props
    const inputProps = {
      id: fieldId,
      placeholder,
      disabled,
      className: cn(
        error && "border-destructive focus-visible:ring-destructive",
        inputClassName
      ),
      min,
      max,
      step,
      value,
      defaultValue,
      onFocus,
      // Spread the registration object (without ref) to get all react-hook-form props
      ...registrationProps,
      // Override with custom handlers if provided
      ...(onChange && { onChange }),
      ...(onBlur && { onBlur }),
      ...(name && { name }),
      ...props,
    };

    // Combine refs properly
    const combineRefs = (
      ...refs: (React.Ref<HTMLInputElement | HTMLTextAreaElement> | undefined)[]
    ) => {
      return (element: HTMLInputElement | HTMLTextAreaElement | null) => {
        refs.forEach((ref) => {
          if (typeof ref === "function") {
            ref(element);
          } else if (ref && typeof ref === "object") {
            (
              ref as React.MutableRefObject<
                HTMLInputElement | HTMLTextAreaElement | null
              >
            ).current = element;
          }
        });
      };
    };

    // Render the appropriate input component
    const renderInput = () => {
      if (type === "textarea") {
        return (
          <Textarea
            {...inputProps}
            rows={rows}
            ref={combineRefs(
              ref as React.Ref<HTMLTextAreaElement>,
              registrationRef
            )}
          />
        );
      }

      // For inputs with prefix/suffix or password toggle
      if (prefix || suffix || (type === "password" && showPasswordToggle)) {
        return (
          <div className="relative">
            {prefix && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {prefix}
              </div>
            )}

            <Input
              {...inputProps}
              type={inputType}
              className={cn(
                prefix && "pl-10",
                (suffix || (type === "password" && showPasswordToggle)) &&
                  "pr-10",
                inputProps.className
              )}
              ref={combineRefs(
                ref as React.Ref<HTMLInputElement>,
                registrationRef
              )}
            />

            {suffix && !showPasswordToggle && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {suffix}
              </div>
            )}

            {type === "password" && showPasswordToggle && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={togglePasswordVisibility}
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        );
      }

      // Regular input
      return (
        <Input
          {...inputProps}
          type={inputType}
          ref={combineRefs(ref as React.Ref<HTMLInputElement>, registrationRef)}
        />
      );
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(
              "text-sm font-medium",
              error && "text-destructive",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        {renderInput()}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
