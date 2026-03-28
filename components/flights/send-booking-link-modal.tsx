"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Copy, Link as LinkIcon, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperatorFlight } from "@/lib/types/flight";
import { useAuth } from "@/hooks/use-auth";
import { tryCatch } from "@/lib/utils";

interface SendBookingLinkModalProps {
  flight: OperatorFlight;
  triggerClassName?: string;
  renderTrigger?: (openModal: () => void) => ReactNode;
  triggerText?: string;
}

const BOOKING_DEEP_LINK_BASE =
  process.env.NEXT_PUBLIC_MOBILE_BOOKING_DEEP_LINK_BASE ?? "volair://booking";

export function SendBookingLinkModal({
  flight,
  triggerClassName,
  renderTrigger,
  triggerText = "Send Booking Link",
}: SendBookingLinkModalProps) {
  const { operator, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [bookingLink, setBookingLink] = useState("");

  const fallbackBookingLink = useMemo(() => {
    const url = new URL(BOOKING_DEEP_LINK_BASE);
    url.searchParams.set("flightId", flight.id);
    url.searchParams.set("source", "operator_dashboard");
    return url.toString();
  }, [flight.id]);

  useEffect(() => {
    const generateBookingLink = async () => {
      if (!open) {
        return;
      }

      if (!operator?.id || !token) {
        setBookingLink(fallbackBookingLink);
        return;
      }

      setIsGeneratingLink(true);

      const { data, error } = await tryCatch(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/operators/${operator.id}/flights/${flight.id}/booking-link`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      if (error) {
        console.error("Failed to generate magic booking link:", error);
        setBookingLink(fallbackBookingLink);
        setIsGeneratingLink(false);
        return;
      }

      const { data: responseBody, error: parsingError } = await tryCatch(
        data.json()
      );

      if (parsingError || !data.ok) {
        setBookingLink(fallbackBookingLink);
        setIsGeneratingLink(false);
        return;
      }

      const generatedLink =
        responseBody?.data?.link ??
        responseBody?.data?.url ??
        responseBody?.link ??
        responseBody?.url;

      setBookingLink(generatedLink || fallbackBookingLink);
      setIsGeneratingLink(false);
    };

    generateBookingLink();
  }, [fallbackBookingLink, flight.id, open, operator?.id, token]);

  const handleCopy = async () => {
    const linkToCopy = bookingLink || fallbackBookingLink;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(linkToCopy);
      toast.success("Booking link copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy booking link:", error);
      toast.error("Unable to copy booking link. Please copy it manually.");
    } finally {
      setIsCopying(false);
    }
  };

  const routeLabel = `${flight.departure_airport?.iata_code ?? "N/A"} → ${flight.arrival_airport?.iata_code ?? "N/A"}`;
  const departureLabel = flight.departure_date
    ? format(new Date(flight.departure_date), "EEE, MMM d • h:mm a")
    : "Departure time unavailable";

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={triggerClassName}
          onClick={() => setOpen(true)}
        >
          <Send className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Booking Link</DialogTitle>
            <DialogDescription>
              Share this internal mobile app link with your customer so they can
              book this specific flight.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{routeLabel}</p>
              <p className="text-muted-foreground">{departureLabel}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`booking-link-${flight.id}`}>
                Customer Booking Link
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`booking-link-${flight.id}`}
                  readOnly
                  value={bookingLink || fallbackBookingLink}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={isCopying}
                >
                  {isCopying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy booking link</span>
                </Button>
              </div>
              {isGeneratingLink && (
                <p className="text-xs text-muted-foreground">
                  Generating magic link...
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCopy}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
