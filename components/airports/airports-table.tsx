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
import { Airport } from "@/lib/types/flight";
import {flexRender, PaginationState} from "@tanstack/react-table";
import {Table as ReactTable} from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AirportsTableProps {
  onDelete: (airportId: string) => void;
  table: ReactTable<Airport>
  pagination: PaginationState,
  setPagination: (pagination: PaginationState) => void,
  meta: any,
}

export function AirportsTable({
  onDelete,
    table,
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
          {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                      )}
                    </TableHead>
                ))}
              </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
              </TableRow>
          ))}
        </TableBody>
      </Table>

      {/*{airports.length === 0 && (*/}
      {/*  <div className="text-center py-8">*/}
      {/*    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />*/}
      {/*    <h3 className="mt-2 text-sm font-semibold text-gray-900">*/}
      {/*      No airports found*/}
      {/*    </h3>*/}
      {/*    <p className="mt-1 text-sm text-muted-foreground">*/}
      {/*      Get started by adding your first airport.*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*)}*/}
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