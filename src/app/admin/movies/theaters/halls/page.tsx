"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tv,
  Plus,
  Search,
  Trash2,
  Edit,
  Armchair,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CineplexChain {
  id: string;
  name: string;
}

interface CinemaTheater {
  id: string;
  cineplexChainId: string | null;
  name: string;
}

interface CinemaScreen {
  id: string;
  theatreId: string;
  name: string;
  screenType: "STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER";
  totalSeats: number;
  isActive: boolean;
}

export default function HallsPage() {
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [theaters, setTheaters] = useState<CinemaTheater[]>([]);
  const [screens, setScreens] = useState<CinemaScreen[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChainId, setSelectedChainId] = useState<string>("all");
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialogue Open States
  const [isScreenDialogOpen, setIsScreenDialogOpen] = useState(false);
  const [isEditScreenDialogOpen, setIsEditScreenDialogOpen] = useState(false);

  // Current item being edited
  const [editingScreen, setEditingScreen] = useState<CinemaScreen | null>(null);

  // Form States (Add)
  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenTheaterId, setNewScreenTheaterId] = useState("");
  const [newScreenType, setNewScreenType] = useState<"STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER">("STANDARD");
  const [newScreenSeats, setNewScreenSeats] = useState(150);

  // Form States (Edit)
  const [editScreenName, setEditScreenName] = useState("");
  const [editScreenType, setEditScreenType] = useState<"STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER">("STANDARD");
  const [editScreenSeats, setEditScreenSeats] = useState(150);
  const [editScreenActive, setEditScreenActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : "";
      const chainParam = selectedChainId !== "all" ? `&cineplexChainId=${selectedChainId}` : "";
      const theaterParam = selectedTheaterId !== "all" ? `&theatreId=${selectedTheaterId}` : "";

      const [chainsRes, theatersRes, screensRes] = await Promise.all([
        fetch("/api/cinema/chains?limit=1000").then((r) => r.json()),
        fetch("/api/cinema/admin-theaters?limit=1000").then((r) => r.json()),
        fetch(`/api/cinema/screens?page=${page}&limit=${limit}${searchParam}${chainParam}${theaterParam}`).then((r) => r.json()),
      ]);

      setChains(chainsRes.items || []);
      setTheaters(theatersRes.items || []);
      setScreens(screensRes.items || []);
      setTotal(screensRes.total || 0);
      setTotalPages(screensRes.pages || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load screen data");
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 on search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedChainId, selectedTheaterId]);

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm, selectedChainId, selectedTheaterId]);

  const startEditScreen = (screen: CinemaScreen) => {
    setEditingScreen(screen);
    setEditScreenName(screen.name);
    setEditScreenType(screen.screenType);
    setEditScreenSeats(screen.totalSeats);
    setEditScreenActive(screen.isActive);
    setIsEditScreenDialogOpen(true);
  };

  const handleAddScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim() || !newScreenTheaterId) return;

    try {
      const res = await fetch("/api/cinema/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theatreId: newScreenTheaterId,
          name: newScreenName,
          screenType: newScreenType,
          totalSeats: newScreenSeats,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create cinema hall");
      }

      toast.success("Cinema hall created successfully");
      setIsScreenDialogOpen(false);
      // Reset Form
      setNewScreenName("");
      setNewScreenSeats(150);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create cinema hall");
    }
  };

  const handleEditScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreen || !editScreenName.trim()) return;

    try {
      const res = await fetch(`/api/cinema/screens/${editingScreen.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editScreenName,
          screenType: editScreenType,
          totalSeats: editScreenSeats,
          isActive: editScreenActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update cinema hall");
      }

      toast.success("Cinema hall updated successfully");
      setIsEditScreenDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update cinema hall");
    }
  };

  const handleDeleteScreen = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Cinema Hall?")) return;

    try {
      const res = await fetch(`/api/cinema/screens/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete cinema hall");
      }

      toast.success("Cinema hall deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete cinema hall");
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Cinema Halls & Screens
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure specific screens, technologies, and seating capacities inside physical locations. Supports database pagination.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Add Screen Button */}
          <Dialog open={isScreenDialogOpen} onOpenChange={setIsScreenDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm">
                <Tv className="mr-2 h-4 w-4" /> Add Cinema Hall
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddScreen}>
                <DialogHeader>
                  <DialogTitle>Add Cinema Hall / Screen</DialogTitle>
                  <DialogDescription>
                    Configure a screening hall (e.g. Hall 1 - IMAX) inside a physical branch.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Parent Branch / Theater</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={newScreenTheaterId}
                      onChange={(e) => setNewScreenTheaterId(e.target.value)}
                      required
                    >
                      <option value="">Select a Branch Location</option>
                      {theaters.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="screen-name">Hall / Screen Name</Label>
                    <Input
                      id="screen-name"
                      value={newScreenName}
                      onChange={(e) => setNewScreenName(e.target.value)}
                      placeholder="e.g. Hall 1 - IMAX"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Screen Technology</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={newScreenType}
                        onChange={(e) => setNewScreenType(e.target.value as any)}
                      >
                        <option value="STANDARD">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="DOLBY">Dolby Atmos</option>
                        <option value="4DX">4DX</option>
                        <option value="VIP">VIP Gold Class</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="screen-seats">Total Seats</Label>
                      <Input
                        id="screen-seats"
                        type="number"
                        min={10}
                        max={1000}
                        value={newScreenSeats}
                        onChange={(e) => setNewScreenSeats(parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex sm:justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-500" /> Seating layout configurable after save
                  </span>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Hall</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && screens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading database configurations...</span>
        </div>
      ) : (
        <Card className="border-muted shadow-xs">
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Screen & Seating Details</CardTitle>
              <CardDescription>
                Review seating layouts and technologies for active screen halls.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search screens..."
                  className="pl-8 bg-muted/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedChainId}
                onChange={(e) => {
                  setSelectedChainId(e.target.value);
                  setSelectedTheaterId("all");
                }}
                className="flex h-9 w-fit rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Brands</option>
                {chains.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={selectedTheaterId}
                onChange={(e) => setSelectedTheaterId(e.target.value)}
                className="flex h-9 w-fit rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Locations</option>
                {theaters
                  .filter(t => selectedChainId === "all" || t.cineplexChainId === selectedChainId)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                }
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative">
              {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              )}
              {screens.length > 0 ? (
                screens.map((screen) => {
                  const theater = theaters.find(t => t.id === screen.theatreId);
                  const chainName = chains.find(c => c.id === theater?.cineplexChainId)?.name || "Independent";
                  
                  return (
                    <Card key={screen.id} className="border border-muted/80 shadow-xs relative hover:shadow-md transition-all">
                      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                            <Tv className="h-4.5 w-4.5 text-indigo-500" />
                            {screen.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            {theater?.name || "Unknown Branch"} ({chainName})
                          </CardDescription>
                        </div>
                        <Badge variant={
                          screen.screenType === "IMAX" ? "default" :
                          screen.screenType === "4DX" ? "destructive" :
                          screen.screenType === "VIP" ? "secondary" : "outline"
                        } className="text-[10px] tracking-wider uppercase font-semibold">
                          {screen.screenType}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm py-2 px-3 bg-muted/40 rounded-lg">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Armchair className="h-3.5 w-3.5 text-indigo-500/80" /> Total Capacity
                          </span>
                          <span className="font-bold text-foreground">{screen.totalSeats} Seats</span>
                        </div>

                        <div className="flex justify-between items-center gap-2 pt-2 border-t border-muted/50">
                          <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {screen.isActive ? "Active" : "Inactive"}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600" onClick={() => startEditScreen(screen)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteScreen(screen.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Link href={`/admin/movies/theaters/seat-map?screenId=${screen.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline">
                              Edit Layout <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-xl text-muted-foreground">
                  <Tv className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span>No screens matching the filters.</span>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-muted">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
                  <span className="font-semibold">{Math.min(total, page * limit)}</span> of{" "}
                  <span className="font-semibold">{total}</span> entries
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value={3}>3 per page</option>
                    <option value={6}>6 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    {renderPageNumbers()}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Screen Dialog */}
      <Dialog open={isEditScreenDialogOpen} onOpenChange={setIsEditScreenDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditScreen}>
            <DialogHeader>
              <DialogTitle>Edit Cinema Hall / Screen</DialogTitle>
              <DialogDescription>
                Update the screening hall details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-screen-name">Hall / Screen Name</Label>
                <Input
                  id="edit-screen-name"
                  value={editScreenName}
                  onChange={(e) => setEditScreenName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Screen Technology</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={editScreenType}
                    onChange={(e) => setEditScreenType(e.target.value as any)}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="IMAX">IMAX</option>
                    <option value="DOLBY">Dolby Atmos</option>
                    <option value="4DX">4DX</option>
                    <option value="VIP">VIP Gold Class</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-screen-seats">Total Seats</Label>
                  <Input
                    id="edit-screen-seats"
                    type="number"
                    min={10}
                    max={1000}
                    value={editScreenSeats}
                    onChange={(e) => setEditScreenSeats(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-screen-active"
                  checked={editScreenActive}
                  onChange={(e) => setEditScreenActive(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <Label htmlFor="edit-screen-active">Active Hall (Visible for Bookings)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditScreenDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
