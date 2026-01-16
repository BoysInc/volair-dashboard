"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Airport } from "@/lib/types/flight";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invalidateAndRefetchQueries } from "@/lib/utils";

interface UpdateAirportModalProps {
  airport: Airport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AirportFormData {
  name: string;
  iata_code: string;
  city: string;
  address: string;
}

export function UpdateAirportModal({
  airport,
  open,
  onOpenChange,
}: UpdateAirportModalProps) {
  const { token } = useAuth(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AirportFormData>({
    defaultValues: {
      name: airport?.name || "",
      iata_code: airport?.iata_code || "",
      city: airport?.city || "",
      address: airport?.address || "",
    },
  });

  useEffect(() => {
    if (airport) {
      form.reset({
        name: airport.name || "",
        city: airport.city || "",
        address: airport.address || "",
        iata_code: airport.iata_code || "",
      });
    }
  }, [airport, form.reset]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: AirportFormData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports/${airport.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        // Parse the error response to get validation errors
        const errorData = await response.json();
        if (errorData.errors) {
          throw { errors: errorData.errors };
        }
        throw new Error(response.statusText);
      }
      return response.json();
    },
    onSuccess: async () => {
      invalidateAndRefetchQueries(queryClient, ["airports"]);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success("Airport updated successfully!");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      // Handle validation errors
      if (error.errors) {
        // Set errors on form fields
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            form.setError(field as keyof AirportFormData, {
              type: "server",
              message: messages[0] as string,
            });
          }
        });
      } else {
        toast.error("Failed to update airport. Please try again.");
      }
    },
  });

  const handleSubmit = (data: AirportFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Airport</DialogTitle>
          <DialogDescription>
            Update airport details and location information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Airport Name */}
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Airport name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airport Name</FormLabel>
                    <FormControl className={"mt-2"}>
                      <Input placeholder="Enter airport name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iata_code"
                rules={{
                  pattern: {
                    value: /^[A-Z]{3}$/,
                    message: "IATA code must be 3 uppercase letters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IATA Code</FormLabel>
                    <FormControl className={"mt-2"}>
                      <Input
                        placeholder="e.g. LOS"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        maxLength={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                rules={{ required: "City is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl className={"mt-2"}>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl className={"mt-2"}>
                      <Input placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Airport
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
