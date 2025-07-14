"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import AircraftTabView from "@/app/(home)/component/AircraftTabView";
import StatCards from "@/app/(home)/component/StatCards";

// Mock data based on the database schema
const mockStats = {
  totalAircraft: 12,
  activeFlights: 8,
  monthlyRevenue: 2450000,
  totalBookings: 156,
  fleetUtilization: 78,
  avgRating: 4.8,
};

const mockAircraft = [
  {
    id: "1",
    model_name: "Citation CJ3+",
    manufacturer: "Cessna",
    registration_number: "5N-ABC",
    seating_capacity: 8,
    status: 1, // Active
    wifi_available: true,
    image_url: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    model_name: "King Air 350",
    manufacturer: "Beechcraft",
    registration_number: "5N-DEF",
    seating_capacity: 11,
    status: 1,
    wifi_available: true,
    image_url: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    model_name: "Falcon 7X",
    manufacturer: "Dassault",
    registration_number: "5N-GHI",
    seating_capacity: 14,
    status: 2, // Maintenance
    wifi_available: true,
    image_url: "/placeholder.svg?height=200&width=300",
  },
];

const mockFlights = [
  {
    id: "1",
    aircraft: "Citation CJ3+ (5N-ABC)",
    departure: "Lagos (LOS)",
    arrival: "Abuja (ABV)",
    departure_time: "2024-06-29T08:00:00",
    arrival_time: "2024-06-29T09:30:00",
    status: 1, // Scheduled
    price_usd: 15000,
    bookings: 6,
  },
  {
    id: "2",
    aircraft: "King Air 350 (5N-DEF)",
    departure: "Abuja (ABV)",
    arrival: "Port Harcourt (PHC)",
    departure_time: "2024-06-29T14:00:00",
    arrival_time: "2024-06-29T15:45:00",
    status: 2, // In Flight
    price_usd: 12000,
    bookings: 8,
  },
];

const mockBookings = [
  {
    id: "1",
    customer: "John Adebayo",
    flight: "LOS → ABV",
    aircraft: "Citation CJ3+",
    passenger_count: 4,
    total_price: 60000,
    status: 1, // Confirmed
    booking_date: "2024-06-25",
  },
  {
    id: "2",
    customer: "Sarah Okafor",
    flight: "ABV → PHC",
    aircraft: "King Air 350",
    passenger_count: 2,
    total_price: 24000,
    status: 2, // Pending
    booking_date: "2024-06-26",
  },
];

function getStatusBadge(
  status: number,
  type: "aircraft" | "flight" | "booking"
) {
  const statusMap = {
    aircraft: {
      1: { label: "Active", variant: "default" as const },
      2: { label: "Maintenance", variant: "secondary" as const },
      3: { label: "Inactive", variant: "destructive" as const },
    },
    flight: {
      1: { label: "Scheduled", variant: "default" as const },
      2: { label: "In Flight", variant: "secondary" as const },
      3: { label: "Completed", variant: "outline" as const },
      4: { label: "Cancelled", variant: "destructive" as const },
    },
    booking: {
      1: { label: "Confirmed", variant: "default" as const },
      2: { label: "Pending", variant: "secondary" as const },
      3: { label: "Cancelled", variant: "destructive" as const },
    },
  };

  const statusInfo =
    statusMap[type][status as keyof (typeof statusMap)[typeof type]];
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function DashboardOverview() {
  const { token } = useAuth(true);

  return (
    <div className="space-y-6">
      <StatCards token={token || ""} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="aircraft" className="space-y-4">
        <TabsList>
          <TabsTrigger value="aircraft">Aircraft Fleet</TabsTrigger>
          <TabsTrigger value="flights">Flight Schedule</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="aircraft" className="space-y-4">
          <AircraftTabView token={token || ""} />
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Flight Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Manage your flight schedules and routes
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Flight
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">
                      {flight.aircraft}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {flight.departure} → {flight.arrival}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(flight.departure_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(flight.arrival_time).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </TableCell>
                    <TableCell>${flight.price_usd.toLocaleString()}</TableCell>
                    <TableCell>{flight.bookings} passengers</TableCell>
                    <TableCell>
                      {getStatusBadge(flight.status, "flight")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Flight</DropdownMenuItem>
                          <DropdownMenuItem>Cancel Flight</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Recent Bookings</h3>
            <p className="text-sm text-muted-foreground">
              View and manage customer bookings for your flights
            </p>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.customer}
                    </TableCell>
                    <TableCell>{booking.flight}</TableCell>
                    <TableCell>{booking.aircraft}</TableCell>
                    <TableCell>{booking.passenger_count}</TableCell>
                    <TableCell>
                      ₦{booking.total_price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status, "booking")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                          <DropdownMenuItem>Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
