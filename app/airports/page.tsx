"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Airport } from "@/lib/types/flight";
import {useQuery, useMutation, useQueryClient, keepPreviousData} from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TableSkeleton } from "@/components/ui/loading-state";
import { AirportsTable } from "@/components/airports/airports-table";
import { AirportForm } from "@/components/airports/airport-form";
import { UpdateAirportModal } from "@/components/airports/update-airport-modal";
import { toast } from "sonner";
import {getCoreRowModel, PaginationState, useReactTable} from "@tanstack/react-table";
import {createColumnHelper} from "@tanstack/table-core";

const columnHelper = createColumnHelper<Airport>()

export default function AirportsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { token } = useAuth(true);
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("");
  
  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(inputValue);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  const { data: airports, isLoading } = useQuery({
    queryKey: ["airports", filter,  pagination.pageIndex],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports`);
      url.searchParams.append('page', pagination.pageIndex.toString());
      
      if (filter !== "") {
        url.searchParams.append('filter[search]', filter);
      }
      
      const response = await fetch(
        url.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }

      return response.json();
    },
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
  const columns = [
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: () => <span>Airport Name</span>,
    }),
    columnHelper.accessor('iata_code', {
      cell: info => info.getValue(),
      header: () => <span>IATA code</span>,
    }),
    columnHelper.accessor('city', {
      cell: info => info.getValue(),
      header: () => <span>City</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        const airport = row.original;
        return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setEditingAirport(airport)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => deleteAirportMutation.mutate(airport.id)}
                    className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        );
      },
      header: () => <span className="sr-only">Actions</span>,
    }),
  ]
  const table = useReactTable({
    data: airports?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    }
  })

  const deleteAirportMutation = useMutation({
    mutationFn: async (airportId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/airports/${airportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete airport");
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return null; // No content to return
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airports"] });
      toast.success("Airport deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting airport:", error);
      toast.error("Failed to delete airport. Please try again.");
    },
  });

  const handleDeleteAirport = (airportId: string) => {
    deleteAirportMutation.mutate(airportId);
  };

  return (
    <DashboardLayout
      title="Airports"
      description="Manage airports and destinations"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Airports</h1>
          <p className="text-muted-foreground">
            Manage airports and destinations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Airport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Airport</DialogTitle>
            </DialogHeader>
            <AirportForm onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Airports Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Airport Database</CardTitle>
          <div className="relative w-64 flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search airports..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || !airports ? (
            <TableSkeleton rows={5} />
          ) : (
            <AirportsTable
                table={table}
              onDelete={handleDeleteAirport}
                pagination={pagination}
                setPagination={setPagination}
                meta={airports?.meta}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Airport Modal */}
      {editingAirport && (
        <UpdateAirportModal
          airport={editingAirport}
          open={!!editingAirport}
          onOpenChange={(open) => !open && setEditingAirport(null)}
        />
      )}
    </DashboardLayout>
  );
}
