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
import { Search, Plus, Film, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allMovies = [
  { id: "MOV-01", title: "Avengers: Endgame", director: "Anthony Russo", genre: "Action", date: "2024-06-15", tickets: 120, price: "$15.00", status: "Active" },
  { id: "MOV-02", title: "Inception 10th Anniv.", director: "Christopher Nolan", genre: "Sci-Fi", date: "2024-06-20", tickets: 45, price: "$12.00", status: "Active" },
  { id: "MOV-03", title: "The Godfather", director: "Francis Ford Coppola", genre: "Crime", date: "2024-06-22", tickets: 0, price: "$10.00", status: "Sold Out" },
  { id: "MOV-04", title: "Interstellar", director: "Christopher Nolan", genre: "Sci-Fi", date: "2024-07-01", tickets: 300, price: "$14.00", status: "Upcoming" },
  { id: "MOV-05", title: "Parasite", director: "Bong Joon-ho", genre: "Thriller", date: "2024-06-10", tickets: 12, price: "$11.00", status: "Active" },
];

export default function MoviesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovies = allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.director.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground mt-1">
            Manage movie listings, showtimes, and ticket availability.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Movie
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movie Database</CardTitle>
              <CardDescription>
                A complete list of movies available for booking.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Showtime</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <TableRow key={movie.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Film className="h-4 w-4 text-muted-foreground" />
                        {movie.title}
                      </TableCell>
                      <TableCell>{movie.director}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{movie.genre}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{movie.date}</TableCell>
                      <TableCell className="text-right font-medium">{movie.tickets}</TableCell>
                      <TableCell className="text-right">{movie.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movie.status === "Active" ? "default" : movie.status === "Upcoming" ? "secondary" : "destructive"
                          }
                          className="bg-opacity-10 shadow-none"
                        >
                          {movie.status}
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
                            <DropdownMenuItem className="text-red-600">Delete Movie</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No movies found.
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
