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
import { Search, Plus, TrainFront, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allTrains = [
  { id: "TRN-01", route: "Washington DC -> New York", type: "Acela Express", departure: "07:00 AM, Jun 15", tickets: 45, price: "$120.00", status: "Active" },
  { id: "TRN-02", route: "New York -> Boston", type: "Northeast Regional", departure: "09:30 AM, Jun 15", tickets: 120, price: "$85.00", status: "Active" },
  { id: "TRN-03", route: "Chicago -> St. Louis", type: "Lincoln Service", departure: "01:00 PM, Jun 16", tickets: 0, price: "$45.00", status: "Sold Out" },
  { id: "TRN-04", route: "Los Angeles -> San Diego", type: "Pacific Surfliner", departure: "10:00 AM, Jun 17", tickets: 200, price: "$35.00", status: "Active" },
  { id: "TRN-05", route: "Seattle -> Vancouver", type: "Cascades", departure: "08:00 AM, Jun 18", tickets: 80, price: "$55.00", status: "Upcoming" },
];

export default function TrainsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrains = allTrains.filter(
    (t) =>
      t.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trains</h1>
          <p className="text-muted-foreground mt-1">
            Manage train routes, schedules, and ticket availability.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Train Route
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Train Schedules</CardTitle>
              <CardDescription>
                A complete list of train journeys available for booking.
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
                  <TableHead>Train Type</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrains.length > 0 ? (
                  filteredTrains.map((train) => (
                    <TableRow key={train.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <TrainFront className="h-4 w-4 text-muted-foreground" />
                        {train.route}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{train.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{train.departure}</TableCell>
                      <TableCell className="text-right font-medium">{train.tickets}</TableCell>
                      <TableCell className="text-right">{train.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            train.status === "Active" ? "default" : train.status === "Upcoming" ? "secondary" : "destructive"
                          }
                          className="bg-opacity-10 shadow-none"
                        >
                          {train.status}
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
                      No trains found.
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
