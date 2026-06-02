"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import {
  Building2,
  Plus,
  Search,
  Trash2,
  Edit,
  MapPin,
  Car,
  Accessibility,
  Utensils,
  Globe,
  Mail,
  Phone,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  XCircle,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface CineplexChain {
  id: string;
  name: string;
}

interface CinemaTheater {
  id: string;
  cineplexChainId: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  facilities: string[] | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  contactNumber: string | null;
  totalScreens: number;
  parkingAvailable: boolean | null;
  wheelchairAccessible: boolean | null;
  foodAllowed: boolean | null;
  isActive: boolean;
}



export default function TheatersPage() {
  const router = useRouter();
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [theaters, setTheaters] = useState<CinemaTheater[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters
  const [selectedChainId, setSelectedChainId] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    brand: true,
    geographics: true,
    screens: true,
    amenities: true,
    contact: true,
    status: true,
    coordinates: false,
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Row Selection
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const availableFacilities = ["3D Projections", "Dolby Atmos", "Recliner Seats", "VIP Lounge", "Food Court", "Arcade Zone"];
  const cities = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : "";
      const chainParam = selectedChainId !== "all" ? `&cineplexChainId=${selectedChainId}` : "";
      const cityParam = selectedCity !== "all" ? `&city=${selectedCity}` : "";
      const statusParam = statusFilter !== "all" ? `&isActive=${statusFilter === "active" ? "true" : "false"}` : "";
      
      const [chainsRes, theatersRes] = await Promise.all([
        fetch("/api/cinema/chains?limit=1000").then((r) => r.json()),
        fetch(`/api/cinema/admin-theaters?page=${page}&limit=${limit}${searchParam}${chainParam}${cityParam}${statusParam}`).then((r) => r.json()),
      ]);
      
      setChains(chainsRes.items || []);
      setTheaters(theatersRes.items || []);
      setTotal(theatersRes.total || 0);
      setTotalPages(theatersRes.pages || 0);
      setSelectedRowIds([]); // Reset selection when page changes
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load theater data");
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedChainId, selectedCity, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm, selectedChainId, selectedCity, statusFilter]);



  const handleDeleteTheater = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Cinema Branch?")) return;

    try {
      const res = await fetch(`/api/cinema/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete branch");
      }

      toast.success("Cinema branch deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete branch");
    }
  };

  // Row Selection Helpers
  const handleSelectAll = () => {
    if (selectedRowIds.length === theaters.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(theaters.map((t) => t.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${selectedRowIds.length} selected branches?`)) return;

    let successCount = 0;
    for (const id of selectedRowIds) {
      try {
        const res = await fetch(`/api/cinema/${id}`, { method: "DELETE" });
        if (res.ok) successCount++;
      } catch (err) {
        console.error("Failed to delete branch:", id);
      }
    }
    toast.success(`Successfully deleted ${successCount} locations.`);
    fetchData();
  };

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
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
            Multiplex Locations (Branches)
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced database-driven multiplex location editor capable of pagination across millions of locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRowIds.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedRowIds.length})
            </Button>
          )}
          <Button onClick={() => router.push("/admin/movies/theaters/add")} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        </div>
      </div>

      {/* Advanced Filters Tab Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-2.5 rounded-xl border border-muted">
        {/* Status Tab buttons */}
        <div className="flex bg-muted/65 p-1 rounded-lg border">
          <Button
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-xs px-3 h-7 rounded-md"
          >
            All Locations
          </Button>
          <Button
            variant={statusFilter === "active" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("active")}
            className="text-xs px-3 h-7 rounded-md"
          >
            Open
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
            className="text-xs px-3 h-7 rounded-md"
          >
            Closed
          </Button>
        </div>

        {/* Filters dropdowns and Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px] lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search location/address..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(e.target.value)}
            className="flex h-9 w-fit rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Brands</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex h-9 w-fit rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Customize Columns dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="h-9"
            >
              <Settings2 className="mr-2 h-4 w-4" /> Customize Columns
            </Button>
            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover text-popover-foreground shadow-md p-2.5 z-20 space-y-1.5">
                <div className="text-xs font-semibold px-2 py-1 text-muted-foreground border-b pb-1.5 mb-1.5">Toggle Visibility</div>
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-muted cursor-pointer text-xs capitalize">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col as keyof typeof visibleColumns]}
                      onChange={() => toggleColumn(col as keyof typeof visibleColumns)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>{col.replace(/([A-Z])/g, " $1")}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && theaters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading database configurations...</span>
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
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={theaters.length > 0 && selectedRowIds.length === theaters.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {visibleColumns.name && <TableHead>Location Details</TableHead>}
                    {visibleColumns.brand && <TableHead>Brand</TableHead>}
                    {visibleColumns.geographics && <TableHead>Geographics</TableHead>}
                    {visibleColumns.coordinates && <TableHead>Coordinates</TableHead>}
                    {visibleColumns.screens && <TableHead className="text-center">Screens</TableHead>}
                    {visibleColumns.amenities && <TableHead>Amenities</TableHead>}
                    {visibleColumns.contact && <TableHead>Contact / Office Info</TableHead>}
                    {visibleColumns.status && <TableHead>Status</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {theaters.length > 0 ? (
                    theaters.map((theater) => {
                      const chainName = chains.find((c) => c.id === theater.cineplexChainId)?.name || "Independent";
                      const isSelected = selectedRowIds.includes(theater.id);
                      return (
                        <TableRow key={theater.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? "bg-indigo-50/20" : ""}`}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectRow(theater.id)}
                              aria-label={`Select row ${theater.name}`}
                            />
                          </TableCell>
                          {visibleColumns.name && (
                            <TableCell className="max-w-[220px]">
                              <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 shrink-0 text-indigo-500" />
                                {theater.name}
                              </div>
                              <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1" title={theater.address || ""}>
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75 mt-0.5" />
                                <span className="line-clamp-2">{theater.address || "No address configured"}</span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.brand && (
                            <TableCell>
                              <Badge variant="outline" className="font-semibold text-xs whitespace-nowrap">{chainName}</Badge>
                            </TableCell>
                          )}
                          {visibleColumns.geographics && (
                            <TableCell className="text-xs">
                              <div className="font-medium text-foreground">{theater.city}, {theater.state}</div>
                              <div className="text-muted-foreground mt-0.5">{theater.country} {theater.pincode && `(${theater.pincode})`}</div>
                            </TableCell>
                          )}
                          {visibleColumns.coordinates && (
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              <div>Lat: {theater.latitude || "N/A"}</div>
                              <div>Lng: {theater.longitude || "N/A"}</div>
                            </TableCell>
                          )}
                          {visibleColumns.screens && (
                            <TableCell className="text-center font-bold text-sm text-foreground">{theater.totalScreens} Screens</TableCell>
                          )}
                          {visibleColumns.amenities && (
                            <TableCell>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <span title="Parking Area" className={theater.parkingAvailable ? "text-indigo-600" : "text-muted-foreground/35"}>
                                    <Car className="h-4 w-4" />
                                  </span>
                                  <span title="Wheelchair access" className={theater.wheelchairAccessible ? "text-indigo-600" : "text-muted-foreground/35"}>
                                    <Accessibility className="h-4 w-4" />
                                  </span>
                                  <span title="Outside food allowed" className={theater.foodAllowed ? "text-indigo-600" : "text-muted-foreground/35"}>
                                    <Utensils className="h-4 w-4" />
                                  </span>
                                </div>
                                {theater.facilities && theater.facilities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                                    {theater.facilities.slice(0, 3).map((f) => (
                                      <Badge key={f} variant="secondary" className="text-[9px] px-1 py-0 shadow-none font-normal">{f}</Badge>
                                    ))}
                                    {theater.facilities.length > 3 && (
                                      <span className="text-[9px] text-muted-foreground">+{theater.facilities.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.contact && (
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {theater.phone && (
                                <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{theater.phone}</div>
                              )}
                              {theater.email && (
                                <div className="flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" />{theater.email}</div>
                              )}
                              {theater.website && (
                                <div className="flex items-center gap-1 mt-0.5 text-indigo-600 max-w-[150px] truncate"><Globe className="h-3 w-3" />{theater.website}</div>
                              )}
                            </TableCell>
                          )}
                          {visibleColumns.status && (
                            <TableCell>
                              <Badge variant="outline" className={`px-2 py-0.5 border shadow-none flex items-center gap-1.5 w-fit text-xs ${theater.isActive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50 border-slate-200"}`}>
                                {theater.isActive ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Open
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" /> Closed
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/admin/movies/theaters/edit?id=${theater.id}`)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteTheater(theater.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        No multiplex branches found.
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
