"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Airport } from "@/lib/types/flight";
import Script from "next/script";
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface UpdateAirportModalProps {
    airport: Airport;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface AirportFormData {
    name: string;
    city: string;
    address: string;
}

export function UpdateAirportModal({ airport, open, onOpenChange }: UpdateAirportModalProps) {
    const { token } = useAuth(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    // @ts-ignore
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AirportFormData>({
        defaultValues: {
            name: airport?.name || "",
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
            });
        }
    }, [airport, form.reset]);

    // Initialize Google Places Autocomplete when the script is loaded
    useEffect(() => {
        // Check if Google Maps is available either through scriptLoaded state or directly in window
        if ((scriptLoaded || window.google?.maps?.places) && autocompleteInputRef.current) {
            // @ts-ignore
            const options: google.maps.places.AutocompleteOptions = {
                types: ['airport'],
                fields: ['name', 'geometry', 'address_components', 'formatted_address'],
                // Prioritize airport locations in search results
                strictBounds: false,
                // Add keyword bias for airport-related terms
                keyword: 'airport terminal'
            };

            // Clean up any existing autocomplete instance
            if (autocompleteRef.current) {
                // @ts-ignore
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }

            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                autocompleteInputRef.current,
                options
            );

            // Add listener for place selection
            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();

                if (place) {
                    // Get city from address components
                    let city = '';

                    if (place.address_components) {
                        for (const component of place.address_components) {
                            if (component.types.includes('locality')) {
                                city = component.long_name;
                                break;
                            }
                        }
                    }

                    // Update form values
                    form.setValue('name', place.name || '');
                    form.setValue('city', city);
                    form.setValue('address', place.formatted_address || '');
                }
            });

            // Return cleanup function
            return () => {
                if (autocompleteRef.current) {
                    // @ts-ignore
                    google.maps.event.clearInstanceListeners(autocompleteRef.current);
                    autocompleteRef.current = null;
                }
            };
        }
    }, [scriptLoaded, form]);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (data: AirportFormData) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports/${airport.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            });

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
            await queryClient.invalidateQueries({queryKey: ['airports']});
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
                            type: 'server',
                            message: messages[0] as string
                        });
                    }
                });
            } else {
                toast.error("Failed to update airport. Please try again.");
            }
        }
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

                {/* Load Google Maps API Script */}
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    onLoad={() => setScriptLoaded(true)}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Airport Search with Google Maps */}
                        <div className="mb-6">
                            <FormItem className="col-span-2">
                                <FormLabel>Search Airport</FormLabel>
                                <FormControl className={"mt-2"}>
                                    <Input
                                        ref={autocompleteInputRef}
                                        placeholder="Search for an airport..."
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Search for an airport to automatically fill the form fields
                                </FormDescription>
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Airport Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{required: "Airport name is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Airport Name</FormLabel>
                                        <FormControl className={"mt-2"}>
                                            <Input placeholder="Enter airport name" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* City */}
                            <FormField
                                control={form.control}
                                name="city"
                                rules={{required: "City is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl className={"mt-2"}>
                                            <Input placeholder="Enter city" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Address */}
                            <FormField
                                control={form.control}
                                name="address"
                                rules={{required: "Address is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl className={"mt-2"}>
                                            <Input placeholder="Enter full address" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Airport
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}