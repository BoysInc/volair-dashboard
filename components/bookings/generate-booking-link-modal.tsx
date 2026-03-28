"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { getOperatorFlights } from "@/lib/server/flights/flights";
import {
  CreateBookingRequest,
  CreateBookingResponse,
} from "@/lib/types/booking";
import { tryCatch } from "@/lib/utils";
import { CreateFlightModal } from "@/components/flights/create-flight-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TripType = "one_way" | "round_trip";
type FlightMode = "existing" | "create";
const BOOKING_DEEP_LINK_BASE =
  process.env.NEXT_PUBLIC_MOBILE_BOOKING_DEEP_LINK_BASE ?? "volair://booking";

const createBookingPayloadSchema = z.object({
  type: z.enum(["CharterRoundTrip", "CharterOneWay"]),
  from: z.string().min(1, "Please select a valid flight."),
  to: z.string().min(1, "Please select a valid flight."),
  aircraft_id: z.string().min(1, "Please select a valid flight."),
  flight_id: z.string().min(1, "Please select a flight first."),
  estimated_duration: z.number().int().positive(),
  departure_passenger_count: z.number().int().min(1),
  return_passenger_count: z.number().int().min(1).nullable(),
  departure_date: z.string().min(1, "Please select a departure date."),
  return_date: z.string().min(1, "Please select a return date."),
  user_timezone: z.string().min(1),
});

export function GenerateBookingLinkModal() {
  const { operator, token } = useAuth(true);
  const [open, setOpen] = useState(false);
  const [flightMode, setFlightMode] = useState<FlightMode>("existing");
  const [selectedFlightId, setSelectedFlightId] = useState("");
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const {
    data: flights = [],
    isLoading: isLoadingFlights,
    refetch,
  } = useQuery({
    queryKey: ["flights", "booking-link-modal"],
    queryFn: async () => {
      if (!operator?.id || !token) {
        return [];
      }

      const { data, error } = await getOperatorFlights(operator.id, token);
      if (error) {
        throw new Error(error);
      }

      return data || [];
    },
    enabled: open && !!operator?.id && !!token,
  });

  useEffect(() => {
    if (!selectedFlightId && flights.length > 0) {
      setSelectedFlightId(flights[0].id);
    }
  }, [flights, selectedFlightId]);

  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) || null,
    [flights, selectedFlightId],
  );

  const formatDateForCreateBooking = (value: string): string =>
    value.replace("T", " ");

  const buildFallbackBookingLink = (bookingId: string): string => {
    const url = new URL(BOOKING_DEEP_LINK_BASE);
    url.pathname = url.pathname
      ? `${url.pathname.replace(/\/$/, "")}/checkout`
      : "/checkout";
    url.searchParams.set("bookingId", bookingId);
    url.searchParams.set("source", "operator_dashboard");
    return url.toString();
  };

  const handleGenerateLink = async () => {
    if (!operator?.id || !token) {
      toast.error("You need to be logged in as an operator.");
      return;
    }

    const bookingType =
      tripType === "round_trip" ? "CharterRoundTrip" : "CharterOneWay";

    const payloadValidation = createBookingPayloadSchema.safeParse({
      type: bookingType,
      from: selectedFlight?.departure_airport?.id ?? "",
      to: selectedFlight?.arrival_airport?.id ?? "",
      aircraft_id: selectedFlight?.aircraft?.id ?? "",
      flight_id: selectedFlightId,
      estimated_duration: selectedFlight?.estimated_duration ?? 0,
      departure_date: formatDateForCreateBooking(departureDate),
      return_date: formatDateForCreateBooking(
        tripType === "round_trip" ? returnDate : departureDate,
      ),
      departure_passenger_count: passengerCount,
      return_passenger_count: tripType === "round_trip" ? passengerCount : null,
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });

    if (!payloadValidation.success) {
      toast.error(
        payloadValidation.error.issues[0]?.message || "Invalid input.",
      );
      return;
    }

    const payload: CreateBookingRequest = payloadValidation.data;

    setIsGenerating(true);
    setGeneratedLink("");

    const { data, error } = await tryCatch(
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }),
    );

    if (error) {
      toast.error("Failed to create booking.");
      setIsGenerating(false);
      return;
    }

    const { data: responseBody, error: parsingError } = await tryCatch(
      data.json() as Promise<CreateBookingResponse>,
    );

    if (parsingError || !data.ok) {
      toast.error("Unable to create booking.");
      setIsGenerating(false);
      return;
    }

    if (!responseBody?.data?.id) {
      toast.error(
        "Booking created, but response did not include data.id from create booking API.",
      );
      setIsGenerating(false);
      return;
    }

    const bookingId = responseBody.data.id;

    const bookingLink = bookingId ? buildFallbackBookingLink(bookingId) : null;

    if (!bookingLink) {
      toast.error(
        "Booking created, but response did not include data.id from create booking API.",
      );
      setIsGenerating(false);
      return;
    }

    setGeneratedLink(bookingLink);
    setIsGenerating(false);
    toast.success("Booking link generated successfully.");
  };

  const handleCopy = async () => {
    if (!generatedLink) {
      return;
    }

    const { error } = await tryCatch(
      navigator.clipboard.writeText(generatedLink),
    );
    if (error) {
      toast.error("Unable to copy link.");
      return;
    }

    toast.success("Booking link copied to clipboard.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full md:w-auto">
          <Send className="mr-2 h-4 w-4" />
          Generate a booking link
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Booking Link</DialogTitle>
          <DialogDescription>
            Create a booking, then generate a magic link to share with your
            client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Flight Selection</Label>
            <RadioGroup
              value={flightMode}
              onValueChange={(value) => setFlightMode(value as FlightMode)}
              className="flex flex-col gap-2 md:flex-row md:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="existing-flight" value="existing" />
                <Label htmlFor="existing-flight">Choose existing flight</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="create-flight" value="create" />
                <Label htmlFor="create-flight">Create a new flight</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="flight-select">Flight</Label>
              {flightMode === "create" && (
                <div className="flex items-center gap-2">
                  <CreateFlightModal
                    triggerText="Create Flight"
                    triggerVariant="outline"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh flights
                  </Button>
                </div>
              )}
            </div>

            <Select
              value={selectedFlightId}
              onValueChange={setSelectedFlightId}
              disabled={isLoadingFlights || flights.length === 0}
            >
              <SelectTrigger id="flight-select">
                <SelectValue
                  placeholder={
                    isLoadingFlights
                      ? "Loading flights..."
                      : "Select a flight route and jet"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {flights.map((flight) => (
                  <SelectItem key={flight.id} value={flight.id}>
                    {flight.departure_airport?.iata_code} →{" "}
                    {flight.arrival_airport?.iata_code} •{" "}
                    {flight.aircraft?.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFlight ? (
              <p className="text-xs text-muted-foreground">
                {selectedFlight.departure_airport?.name} to{" "}
                {selectedFlight.arrival_airport?.name} using{" "}
                {selectedFlight.aircraft?.manufacturer}{" "}
                {selectedFlight.aircraft?.model_name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trip-type">Trip Type</Label>
              <Select
                value={tripType}
                onValueChange={(value) => setTripType(value as TripType)}
              >
                <SelectTrigger id="trip-type">
                  <SelectValue placeholder="Select trip type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_way">One-way</SelectItem>
                  <SelectItem value="round_trip">Round-trip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passenger-count">Number of Passengers</Label>
              <Input
                id="passenger-count"
                type="number"
                min={1}
                value={passengerCount}
                onChange={(event) =>
                  setPassengerCount(
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="departure-date">Departure Date</Label>
              <Input
                id="departure-date"
                type="datetime-local"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
              />
            </div>

            {tripType === "round_trip" ? (
              <div className="space-y-2">
                <Label htmlFor="return-date">Return Date</Label>
                <Input
                  id="return-date"
                  type="datetime-local"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Return Date</Label>
                <Input disabled value="Not required for one-way trips" />
              </div>
            )}
          </div>

          {generatedLink ? (
            <div className="rounded-md border bg-muted/20 p-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Generated checkout deep link
              </p>
              <p className="break-all font-mono text-xs">{generatedLink}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {generatedLink ? (
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleGenerateLink}
            disabled={isGenerating}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Generating..." : "Generate Magic Link"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
