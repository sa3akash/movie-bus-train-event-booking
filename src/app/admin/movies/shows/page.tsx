"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
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
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Clock,
  Calendar,
  MonitorPlay,
  Film,
  Building,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Show {
  id: string;
  movieId: string;
  movieTitle: string;
  screenId: string;
  screenName: string;
  theaterName: string;
  startTime: string;
  endTime: string;
  basePrice: string;
  status: string;
  availableSeats: number;
}

export default function ShowsPage() {
  const router = useRouter();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : "";
      const res = await fetch(`/api/movie/admin-shows?page=${page}&limit=${limit}${searchParam}`);
      if (!res.ok) {
        throw new Error("Failed to fetch shows");
      }
      const data = await res.json();
      
      setShows(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load shows data");
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm]);

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this show? This will also remove the seat mapping.")) return;

    try {
      const res = await fetch(`/api/movie/shows/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete show");
      }

      toast.success("Show deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete show");
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "ONGOING":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "COMPLETED":
        return "text-slate-700 bg-slate-100 border-slate-300";
      case "CANCELLED":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Shows List
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage movie showtimes across all theaters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/admin/movies/shows/add")} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Show
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-2.5 rounded-xl border border-muted">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px] lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movie..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && shows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading shows...</span>
        </div>
      ) : (
        <Card className="border-muted shadow-xs">
          <CardContent className="p-0">
            <div className="rounded-t-lg border-b overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              )}
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Theater & Screen</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shows.length > 0 ? (
                    shows.map((show) => {
                      return (
                        <TableRow key={show.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell>
                            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              <Film className="h-4 w-4 shrink-0 text-indigo-500" />
                              {show.movieTitle}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                              {show.theaterName}
                            </div>
                            <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                              <MonitorPlay className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75 mt-0.5" />
                              <span>{show.screenName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-medium">{format(new Date(show.startTime), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{format(new Date(show.startTime), "hh:mm a")} - {format(new Date(show.endTime), "hh:mm a")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-sm">{show.availableSeats}</span> <span className="text-xs text-muted-foreground">available</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-sm">৳{show.basePrice}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`px-2 py-0.5 border shadow-none text-[10px] uppercase font-semibold tracking-wider ${getStatusColor(show.status)}`}>
                              {show.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/admin/movies/shows/edit?id=${show.id}`)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteShow(show.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No shows found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-muted bg-muted/10">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
                  <span className="font-semibold">{Math.min(total, page * limit)}</span> of{" "}
                  <span className="font-semibold">{total}</span> entries
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rows-per-page" className="text-xs text-muted-foreground">Rows per page</Label>
                    <select
                      id="rows-per-page"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {renderPageNumbers()}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
