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
import { Search, Plus, Mic2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allConcerts = [
  { id: "CON-01", artist: "Taylor Swift", venue: "SoFi Stadium", date: "2024-08-01", tickets: 0, price: "$250.00", status: "Sold Out" },
  { id: "CON-02", artist: "Coldplay", venue: "Wembley Stadium", date: "2024-08-15", tickets: 1200, price: "$150.00", status: "Active" },
  { id: "CON-03", artist: "The Weeknd", venue: "Madison Square Garden", date: "2024-09-10", tickets: 450, price: "$180.00", status: "Active" },
  { id: "CON-04", artist: "Ed Sheeran", venue: "MetLife Stadium", date: "2024-07-20", tickets: 20, price: "$120.00", status: "Active" },
  { id: "CON-05", artist: "Billie Eilish", venue: "O2 Arena", date: "2024-10-05", tickets: 5000, price: "$100.00", status: "Upcoming" },
];

export default function ConcertsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcerts = allConcerts.filter(
    (c) =>
      c.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Concerts</h1>
          <p className="text-muted-foreground mt-1">
            Manage concert listings, venues, and ticket availability.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Concert
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Concert Database</CardTitle>
              <CardDescription>
                A complete list of concerts available for booking.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search artists or venues..."
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
                  <TableHead>Artist / Tour</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConcerts.length > 0 ? (
                  filteredConcerts.map((concert) => (
                    <TableRow key={concert.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Mic2 className="h-4 w-4 text-muted-foreground" />
                        {concert.artist}
                      </TableCell>
                      <TableCell>{concert.venue}</TableCell>
                      <TableCell className="text-muted-foreground">{concert.date}</TableCell>
                      <TableCell className="text-right font-medium">{concert.tickets}</TableCell>
                      <TableCell className="text-right">{concert.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            concert.status === "Active" ? "default" : concert.status === "Upcoming" ? "secondary" : "destructive"
                          }
                          className="bg-opacity-10 shadow-none"
                        >
                          {concert.status}
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
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Sales</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Concert</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No concerts found.
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
