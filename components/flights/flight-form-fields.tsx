"use client";

import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AircraftSelect } from "@/components/forms/aircraft-select";
import { AirportSelect } from "@/components/forms/airport-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  Route,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useFeatureFlag from "@/hooks/feature-flags/use-feature-flags";
interface FlightFormFieldsProps {
  vm: any; // Accept any ViewModel that has the required properties
  initialAircraftData?: any; // Accept any aircraft data structure
  isEditMode?: boolean;
}

export function FlightFormFields({
  vm,
  initialAircraftData,
  isEditMode = false,
}: FlightFormFieldsProps) {
  const { isEnabled: isOneWaySeatsEnabled } = useFeatureFlag("OneWaySeats");
  return (
    <>
      {/* Flight Route Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Flight Route
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Controller
              name="aircraft_id"
              control={vm.control}
              rules={vm.validationRules.aircraft_id}
              render={({ field }) => (
                <AircraftSelect
                  label="Aircraft"
                  value={field.value}
                  onChange={field.onChange}
                  error={vm.errors.aircraft_id?.message}
                  required
                  showAllAircraft={isEditMode}
                  initialAircraftData={initialAircraftData}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="route_type"
              className="text-sm font-medium flex items-center gap-2"
            >
              Route Type
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Controller
              name="route_type"
              control={vm.control}
              rules={vm.validationRules.route_type}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value: "Charter" | "Seats") =>
                    field.onChange(value)
                  }
                >
                  <SelectTrigger id="route_type" className="mt-2">
                    <SelectValue placeholder="Select route type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Charter">Charter</SelectItem>
                    <SelectItem value="Seats">Seats</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {vm.errors.route_type && (
              <p className="text-sm text-red-600">
                {vm.errors.route_type.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">
              Flight Status
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={vm.watchedValues.status}
              onValueChange={(value: "Active" | "Inactive") =>
                vm.setValue("status", value)
              }
            >
              <SelectTrigger id="status" className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {vm.errors.status && (
              <p className="text-sm text-red-500">{vm.errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Airport Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Airports
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Controller
              name="departure_airport_id"
              control={vm.control}
              rules={vm.validationRules.departure_airport_id}
              render={({ field }) => (
                <AirportSelect
                  label="Departure Airport"
                  value={field.value}
                  onChange={field.onChange}
                  error={vm.errors.departure_airport_id?.message}
                  required
                  excludeAirportId={vm.watchedValues.arrival_airport_id}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Controller
              name="arrival_airport_id"
              control={vm.control}
              rules={vm.validationRules.arrival_airport_id}
              render={({ field }) => (
                <AirportSelect
                  label="Arrival Airport"
                  value={field.value}
                  onChange={field.onChange}
                  error={vm.errors.arrival_airport_id?.message}
                  required
                  excludeAirportId={vm.watchedValues.departure_airport_id}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {vm.routeType === "Seats" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="departure_date"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Departure Date
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departure_date"
                  type="date"
                  {...vm.register(
                    "departure_date",
                    vm.conditionalValidationRules.departure_date
                  )}
                  className={cn(
                    "mt-2",
                    vm.errors.departure_date ? "border-red-500" : ""
                  )}
                  min={new Date().toISOString().split("T")[0]}
                />
                {vm.errors.departure_date && (
                  <p className="text-sm text-red-500">
                    {vm.errors.departure_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="departure_time"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Departure Time
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departure_time"
                  type="time"
                  {...vm.register(
                    "departure_time",
                    vm.conditionalValidationRules.departure_time
                  )}
                  className={cn(
                    "mt-2",
                    vm.errors.departure_time ? "border-red-500" : ""
                  )}
                />
                {vm.errors.departure_time && (
                  <p className="text-sm text-red-500">
                    {vm.errors.departure_time.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {vm.routeType === "Charter" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Charter Flight:</strong> No scheduled departure time
                needed. The flight will be scheduled when a customer books it.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="estimated_duration"
              className="flex items-center gap-2"
            >
              <Timer className="h-4 w-4" />
              Estimated Duration (minutes)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimated_duration"
              placeholder="e.g., 120"
              {...vm.register(
                "estimated_duration",
                vm.validationRules.estimated_duration
              )}
              className={cn(
                "mt-2",
                vm.errors.estimated_duration ? "border-red-500" : ""
              )}
            />
            {vm.errors.estimated_duration && (
              <p className="text-sm text-red-500">
                {vm.errors.estimated_duration.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="one_way_price_usd"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              One Way Price (USD)
              <span className="text-red-500">*</span>
            </Label>
            <input
              type="hidden"
              {...vm.register(
                "one_way_price_usd",
                vm.validationRules.one_way_price_usd
              )}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="one_way_price_usd_display"
                placeholder="0.00"
                value={vm.formattedOneWayPrice}
                onChange={(e) =>
                  vm.handlePriceChange("one_way_price_usd", e.target.value)
                }
                onBlur={() => vm.handlePriceBlur("one_way_price_usd")}
                className={cn(
                  "pl-7 mt-2",
                  vm.errors.one_way_price_usd ? "border-red-500" : ""
                )}
              />
            </div>
            {vm.errors.one_way_price_usd && (
              <p className="text-sm text-red-500">
                {vm.errors.one_way_price_usd.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="round_trip_price_usd"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Round Trip Price (USD)
              <span className="text-red-500">*</span>
            </Label>
            <input
              type="hidden"
              {...vm.register(
                "round_trip_price_usd",
                vm.validationRules.round_trip_price_usd
              )}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="round_trip_price_usd_display"
                placeholder="0.00"
                value={vm.formattedRoundTripPrice}
                onChange={(e) =>
                  vm.handlePriceChange("round_trip_price_usd", e.target.value)
                }
                onBlur={() => vm.handlePriceBlur("round_trip_price_usd")}
                className={cn(
                  "pl-7 mt-2",
                  vm.errors.round_trip_price_usd ? "border-red-500" : ""
                )}
              />
            </div>
            {vm.errors.round_trip_price_usd && (
              <p className="text-sm text-red-500">
                {vm.errors.round_trip_price_usd.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flight Options */}
      {isOneWaySeatsEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Flight Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                <Switch
                  id="is_empty_leg"
                  checked={vm.watchedValues.is_empty_leg}
                  onCheckedChange={(checked) =>
                    vm.setValue("is_empty_leg", checked)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="is_empty_leg"
                    className="font-medium cursor-pointer"
                  >
                    Empty Leg Flight
                  </Label>
                  <p className="text-sm text-slate-600">
                    This is a return flight with no passengers (discounted
                    pricing)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
