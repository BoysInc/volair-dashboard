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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, MapPin } from "lucide-react";
import { Airport } from "@/lib/types/flight";

interface AirportsTableProps {
  airports: Airport[];
  onEdit: (airport: Airport) => void;
  onDelete: (airportId: string) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  meta: any;
}

export function AirportsTable({
  airports,
  onEdit,
  onDelete,
  pagination,
  setPagination,
  meta,
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
            <TableHead>City</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {airports?.map((airport) => (
            <TableRow key={airport.id}>
              <TableCell>
                <div className="font-semibold">{airport.name}</div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm font-semibold">
                  {airport.iata_code}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">{airport.city}</div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(airport)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteAirportId(airport.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPagination({...pagination, pageIndex: pagination.pageIndex - 1})}
                className={pagination.pageIndex === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                tabIndex={pagination.pageIndex === 1 ? -1 : 0}
                aria-disabled={pagination.pageIndex === 1}
              />
            </PaginationItem>
            
            {/* Current page indicator */}
            <PaginationItem>
              <PaginationLink isActive>
                {pagination.pageIndex}
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPagination({...pagination, pageIndex: pagination.pageIndex + 1})}
                className={pagination.pageIndex === meta?.page?.total ? "pointer-events-none opacity-50" : "cursor-pointer"}
                tabIndex={pagination.pageIndex === meta?.page?.total ? -1 : 0}
                aria-disabled={pagination.pageIndex === meta?.page?.total}
              />
            </PaginationItem>
            
            <PaginationItem>
              <span className="flex items-center h-10 px-4 text-sm">
                Page {pagination.pageIndex} of {meta?.page?.total || 1}
              </span>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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