"use client";

import {useState, useEffect, useRef, useCallback} from "react";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import Script from "next/script";
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAuth} from "@/hooks/use-auth";

interface AirportFormProps {
    onCancel: () => void;
}

interface AirportFormData {
    name: string;
    iata_code: string;
    city: string;
    country: string;
    address: string;
    type: string;
    latitude: number;
    longitude: number;
}

interface AirportPrediction {
    description: string;
    place_id: string;
}

export function AirportForm({onCancel}: AirportFormProps) {
    const { token } = useAuth(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictions, setPredictions] = useState<AirportPrediction[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const form = useForm<AirportFormData>({
        defaultValues: {
            name: "",
            iata_code: "",
            city: "",
            country: "",
            address: "",
            type: 'Airport',
            latitude: 0,
            longitude: 0,
        },
    });
    
    // Function to fetch predictions from Google Places API
    const fetchPredictions = useCallback((input: string) => {
        if (!input || !window.google?.maps?.places) return;
        
        setIsLoading(true);
        
        // Create a new AutocompleteService instance
        const service = new window.google.maps.places.AutocompleteService();
        
        // Request predictions
        service.getPlacePredictions(
            {
                input,
                types: ['airport'],
                componentRestrictions: { country: [] }, // No country restriction
            },
            (predictions: any, status: any) => {
                setIsLoading(false);
                
                if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
                    setPredictions([]);
                    return;
                }
                
                // Map predictions to our interface
                const mappedPredictions = predictions.map((prediction: any) => ({
                    description: prediction.description,
                    place_id: prediction.place_id,
                }));
                
                setPredictions(mappedPredictions);
            }
        );
    }, []);
    
    // Function to handle selection of a prediction
    const handleSelectPrediction = useCallback((placeId: string) => {
        if (!window.google?.maps?.places) return;
        
        // Create a PlacesService instance
        const placesService = new window.google.maps.places.PlacesService(
            document.createElement('div') // Dummy element for the service
        );
        
        // Get place details
        placesService.getDetails(
            {
                placeId: placeId,
                fields: ['name', 'geometry', 'address_components', 'formatted_address'],
            },
            (place: any, status: any) => {
                if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
                    return;
                }
                
                if (place && place.geometry && place.geometry.location) {
                    // Extract data from the selected place
                    const lat = place.geometry.location.lat().toFixed(7);
                    const lng = place.geometry.location.lng().toFixed(7);
                    
                    // Get city and country from address components
                    let city = '';
                    let country = '';
                    
                    if (place.address_components) {
                        for (const component of place.address_components) {
                            if (component.types.includes('locality')) {
                                city = component.long_name;
                            } else if (component.types.includes('country')) {
                                country = component.long_name;
                            }
                        }
                    }
                    
                    // Update form values
                    form.setValue('name', place.name || '');
                    form.setValue('city', city);
                    form.setValue('country', country);
                    form.setValue('address', place.formatted_address || '');
                    form.setValue('latitude', parseFloat(lat));
                    form.setValue('longitude', parseFloat(lng));
                    
                    // Clear predictions and update search input
                    setPredictions([]);
                    setSearchInput(place.name || '');
                }
            }
        );
    }, [form, setSearchInput, setPredictions]);


    // Initialize Google Maps script loading
    useEffect(() => {
        // We don't need to initialize the autocomplete widget anymore
        // as we're handling predictions manually with our custom dropdown
        // Just set a flag when the script is loaded
        if (scriptLoaded || window.google?.maps?.places) {
            // If the user has already entered something in the search box,
            // fetch predictions immediately
            if (searchInput) {
                fetchPredictions(searchInput);
            }
        }
        
        // Return cleanup function
        return () => {
            // Clear any predictions when component unmounts
            setPredictions([]);
        };
    }, [scriptLoaded, searchInput, fetchPredictions]);

    const handleSubmit = (data: AirportFormData) => {
        setIsSubmitting(true);
        mutation.mutate(data);
    };

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (data: AirportFormData) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                // Parse the error response to get validation errors
                const errorData = await response.json();
                if (errorData.errors) {
                    throw { errors: errorData.errors };
                }
                throw new Error(response.statusText);
            }
            return response.json()
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['airports']})
            setIsSubmitting(false);
            onCancel()
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
            }
        }
    })

    return (
        <>
      {/* Load Google Maps API Script */}
          <Script
              src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
              onLoad={() => setScriptLoaded(true)}
          />

          <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Airport Search with Google Maps */}
                  <div className="mb-6 relative">
                      <FormItem className="col-span-2">
                          <FormLabel>Search Airport</FormLabel>
                          <FormControl className={"mt-2"}>
                              <Input
                                  ref={autocompleteInputRef}
                                  placeholder="Search for an airport..."
                                  className="w-full"
                                  value={searchInput}
                                  onChange={(e) => {
                                      const value = e.target.value;
                                      setSearchInput(value);
                                      fetchPredictions(value);
                                  }}
                                  onFocus={() => setIsFocused(true)}
                                  onBlur={() => {
                                      // Delay hiding predictions to allow for click events
                                      setTimeout(() => setIsFocused(false), 200);
                                  }}
                              />
                          </FormControl>
                          <FormDescription>
                              Search for an airport to automatically fill the form fields
                          </FormDescription>
                      </FormItem>
                      
                      {/* Predictions Dropdown */}
                      {isFocused && predictions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
                              <ul className="py-1">
                                  {predictions.map((prediction) => (
                                      <li
                                          key={prediction.place_id}
                                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                          onClick={() => handleSelectPrediction(prediction.place_id)}
                                      >
                                          {prediction.description}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                      
                      {/* Loading indicator */}
                      {isLoading && (
                          <div className="absolute right-3 top-10">
                              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                          </div>
                      )}
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

                      {/* IATA Code */}
                      <FormField
                          control={form.control}
                          name="iata_code"
                          rules={{
                              pattern: {
                                  value: /^[A-Z]{3}$/,
                                  message: "IATA code must be 3 uppercase letters"
                              }
                          }}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>IATA Code</FormLabel>
                                  <FormControl className={"mt-2"}>
                                      <Input
                                          placeholder="e.g. LOS"
                                          {...field}
                                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                          maxLength={3}
                                      />
                                  </FormControl>
                                  <FormDescription>
                                      3-letter airport code (optional)
                                  </FormDescription>
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

                      {/* Country */}
                      <FormField
                          control={form.control}
                          name="country"
                          rules={{required: "Country is required"}}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl className={"mt-2"}>
                                      <Input placeholder="Enter country" {...field} />
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

                      {/* Airport Type */}
                      <FormField
                          control={form.control}
                          name="type"
                          rules={{required: "Airport type is required"}}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Airport Type</FormLabel>
                                  <FormControl className={"mt-2"}>
                                      <select
                                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                          value={field.value}
                                          onChange={(e) => field.onChange(e.target.value)}
                                      >
                                          <option value={'Airport'}>Airport</option>
                                          <option value={'Airstrip'}>Airstrip</option>
                                      </select>
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                      />

                      {/* Latitude */}
                      <FormField
                          control={form.control}
                          name="latitude"
                          rules={{
                              required: "Latitude is required",
                              min: {value: -90, message: "Latitude must be between -90 and 90"},
                              max: {value: 90, message: "Latitude must be between -90 and 90"}
                          }}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Latitude</FormLabel>
                                  <FormControl className={"mt-2"}>
                                      <Input
                                          type="text"
                                          placeholder="e.g. 6.5774"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                          disabled
                                      />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                      />

                      {/* Longitude */}
                      <FormField
                          control={form.control}
                          name="longitude"
                          rules={{
                              required: "Longitude is required",
                              min: {value: -180, message: "Longitude must be between -180 and 180"},
                              max: {value: 180, message: "Longitude must be between -180 and 180"}
                          }}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Longitude</FormLabel>
                                  <FormControl className={"mt-2"}>
                                      <Input
                                          type="text"
                                          placeholder="e.g. 3.3210"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                          disabled
                                      />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                      />
                  </div>

                  <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                          Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Add Airport"}
                      </Button>
                  </div>
              </form>
          </Form>
        </>
    );
}
