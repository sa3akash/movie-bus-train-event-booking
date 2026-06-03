"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BusFront, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allBuses = [
  { id: "BUS-01", route: "New York -> Boston", type: "Express Luxury", departure: "10:00 AM, Jun 15", tickets: 12, price: "$45.00", status: "Active" },
  { id: "BUS-02", route: "Los Angeles -> San Francisco", type: "Standard", departure: "08:30 AM, Jun 16", tickets: 45, price: "$35.00", status: "Active" },
  { id: "BUS-03", route: "Chicago -> Detroit", type: "Sleeper", departure: "11:00 PM, Jun 16", tickets: 0, price: "$65.00", status: "Sold Out" },
  { id: "BUS-04", route: "Miami -> Orlando", type: "Express Luxury", departure: "09:00 AM, Jun 17", tickets: 20, price: "$40.00", status: "Active" },
  { id: "BUS-05", route: "Seattle -> Portland", type: "Standard", departure: "02:00 PM, Jun 18", tickets: 55, price: "$25.00", status: "Upcoming" },
];

export default function BusesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBuses = allBuses.filter(
    (b) =>
      b.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buses</h1>
          <p className="text-muted-foreground mt-1">
            Manage bus routes, schedules, and ticket availability.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Bus Route
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bus Schedules</CardTitle>
              <CardDescription>
                A complete list of bus journeys available for booking.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search routes..."
                className="pl-8 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus Type</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuses.length > 0 ? (
                  filteredBuses.map((bus) => (
                    <TableRow key={bus.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <BusFront className="h-4 w-4 text-muted-foreground" />
                        {bus.route}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{bus.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{bus.departure}</TableCell>
                      <TableCell className="text-right font-medium">{bus.tickets}</TableCell>
                      <TableCell className="text-right">{bus.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bus.status === "Active" ? "default" : bus.status === "Upcoming" ? "secondary" : "destructive"
                          }
                          className="bg-opacity-10 shadow-none"
                        >
                          {bus.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit Route</DropdownMenuItem>
                            <DropdownMenuItem>View Passengers</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Route</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No buses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
