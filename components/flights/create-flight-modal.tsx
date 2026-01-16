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
import { Loader2, Plus } from "lucide-react";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { useCreateFlightViewModel } from "@/hooks/flight-form/use-create-flight-view-model";
import { FlightFormFields } from "./flight-form-fields";

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
  const { isOpen, isCreateMode, openCreateModal, closeModal } =
    useFlightModalStore();

  const vm = useCreateFlightViewModel({
    isOpen: isOpen && isCreateMode,
    onClose: closeModal,
  });

  return (
    <Dialog
      open={isOpen && isCreateMode}
      onOpenChange={(open) => (open ? openCreateModal() : vm.handleClose())}
    >
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant={triggerVariant} className="gap-2">
            <Plus className="h-4 w-4" />
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Schedule New Flight
          </DialogTitle>
          <DialogDescription>
            Create a new flight schedule by selecting aircraft, route, and
            timing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={vm.handleSubmit} className="space-y-6">
          <FlightFormFields vm={vm} isEditMode={false} />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={vm.handleClose}
              disabled={vm.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={vm.isSubmitting}>
              {vm.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Schedule Flight
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
