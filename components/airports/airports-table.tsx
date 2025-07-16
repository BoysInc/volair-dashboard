"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Globe,
} from "lucide-react";
import { Airport } from "@/lib/types/flight";

interface AirportsTableProps {
  airports: Airport[];
  onEdit: (airport: Airport) => void;
  onDelete: (airportId: string) => void;
}

// Function to determine airport type badge color
const getAirportTypeColor = (name: string): string => {
  return name.includes("International") ? "secondary" : "default";
};

export function AirportsTable({
  airports,
  onEdit,
  onDelete,
}: AirportsTableProps) {
  const [deleteAirportId, setDeleteAirportId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteAirportId) {
      onDelete(deleteAirportId);
      setDeleteAirportId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Airport Name</TableHead>
            <TableHead>IATA Code</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {airports.map((airport) => (
            <TableRow key={airport.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{airport.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-mono font-semibold">{airport.iata_code}</div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">{airport.city}</div>
                  <div className="text-sm text-muted-foreground">{airport.country}</div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {airports.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No airports found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first airport.
          </p>
        </div>
      )}

      <AlertDialog
        open={!!deleteAirportId}
        onOpenChange={() => setDeleteAirportId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              airport from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}