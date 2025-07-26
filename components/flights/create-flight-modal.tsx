"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FlightForm } from "./flight-form";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";

interface CreateFlightModalProps {
  triggerText?: string;
  triggerVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showTrigger?: boolean;
}

export function CreateFlightModal({
  triggerText = "Schedule Flight",
  triggerVariant = "default",
  showTrigger = true,
}: CreateFlightModalProps) {
  const { isCreateMode, openCreateModal, closeModal } = useFlightModalStore();

  return (
    <Dialog
      open={isCreateMode}
      onOpenChange={(open) => (open ? openCreateModal() : closeModal())}
    >
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant={triggerVariant} className="gap-2">
            <Plus className="h-4 w-4" />
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule New Flight</DialogTitle>
          <DialogDescription>
            Create a new flight schedule by selecting aircraft, route, and
            timing.
          </DialogDescription>
        </DialogHeader>
        <FlightForm onCancel={closeModal} />
      </DialogContent>
    </Dialog>
  );
}
