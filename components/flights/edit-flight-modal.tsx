"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useFlightModalStore } from "@/lib/store/flight-modal-store";
import { XCircle, Loader2, Settings } from "lucide-react";
import { format } from "date-fns";
import { useEditFlightViewModel } from "@/hooks/flight-form/use-edit-flight-view-model";
import { FlightFormFields } from "./flight-form-fields";

export function EditFlightModal() {
  const { isOpen, isEditMode, editingFlight, closeModal } =
    useFlightModalStore();

  const vm = useEditFlightViewModel({
    flight: editingFlight!,
    isOpen: isOpen && isEditMode,
    onClose: closeModal,
  });

  if (!editingFlight || !isEditMode) return null;

  return (
    <>
      <Dialog open={isOpen && isEditMode} onOpenChange={vm.handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Edit Flight Schedule
            </DialogTitle>
            <DialogDescription>
              Update flight details, schedule, and pricing information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={vm.handleSubmit} className="space-y-6">
            <FlightFormFields
              vm={vm}
              initialAircraftData={editingFlight.aircraft}
              isEditMode={true}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="destructive"
                onClick={vm.handleDelete}
                disabled={vm.isSubmitting || vm.isDeleting}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Delete Flight
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={vm.handleClose}
                  disabled={vm.isSubmitting || vm.isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={vm.isSubmitting || vm.isDeleting}
                >
                  {vm.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Flight
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Flight Confirmation Dialog */}
      <AlertDialog
        open={vm.showDeleteConfirm}
        onOpenChange={vm.setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Delete Flight?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="text-sm">
                Are you sure you want to delete this flight? This action cannot
                be undone and will permanently remove the flight from the
                system.
              </span>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-sm">
                  <strong>Flight Details:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>
                      Route: {editingFlight?.departure_airport?.name} →{" "}
                      {editingFlight?.arrival_airport?.name}
                    </li>
                    <li>
                      Date:{" "}
                      {editingFlight?.departure_date
                        ? format(new Date(editingFlight.departure_date), "PPP")
                        : "Not set"}
                    </li>
                    <li>Aircraft: {editingFlight?.aircraft?.model_name}</li>
                  </ul>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600">
                This will permanently delete the flight.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={vm.isDeleting}
              onClick={() => vm.setShowDeleteConfirm(false)}
            >
              Keep Flight
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={vm.handleConfirmDelete}
              disabled={vm.isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {vm.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Delete Flight
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
