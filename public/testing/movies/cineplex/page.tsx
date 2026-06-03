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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Film,
  Building2,
  Tv,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  Armchair,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// --- Database Types ---

interface CineplexChain {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  totalCinemas: number;
  isActive: boolean;
}

interface CinemaTheater {
  id: string;
  cineplexChainId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  address: string | null;
  city: string;
  state?: string;
  phone: string | null;
  email: string | null;
  website?: string | null;
  logoUrl?: string | null;
  totalScreens: number;
  parkingAvailable?: boolean | null;
  wheelchairAccessible?: boolean | null;
  foodAllowed?: boolean | null;
  isActive: boolean;
}

interface CinemaScreen {
  id: string;
  theatreId: string;
  name: string;
  screenType: "STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER";
  totalSeats: number;
  isActive: boolean;
}

export default function CineplexPage() {
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [theaters, setTheaters] = useState<CinemaTheater[]>([]);
  const [screens, setScreens] = useState<CinemaScreen[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedChainId, setSelectedChainId] = useState<string>("all");
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>(" ");

  // Dialogue Open States (Add Forms)
  const [isChainDialogOpen, setIsChainDialogOpen] = useState(false);
  const [isTheaterDialogOpen, setIsTheaterDialogOpen] = useState(false);
  const [isScreenDialogOpen, setIsScreenDialogOpen] = useState(false);

  // Dialogue Open States (Edit Forms)
  const [isEditChainDialogOpen, setIsEditChainDialogOpen] = useState(false);
  const [isEditTheaterDialogOpen, setIsEditTheaterDialogOpen] = useState(false);
  const [isEditScreenDialogOpen, setIsEditScreenDialogOpen] = useState(false);

  // Current item being edited
  const [editingChain, setEditingChain] = useState<CineplexChain | null>(null);
  const [editingTheater, setEditingTheater] = useState<CinemaTheater | null>(null);
  const [editingScreen, setEditingScreen] = useState<CinemaScreen | null>(null);

  // Form States (Add Forms)
  const [newChainName, setNewChainName] = useState("");
  const [newChainDesc, setNewChainDesc] = useState("");
  const [newChainWebsite, setNewChainWebsite] = useState("");
  const [newChainPhone, setNewChainPhone] = useState("");
  const [newChainEmail, setNewChainEmail] = useState("");

  const [newTheaterName, setNewTheaterName] = useState("");
  const [newTheaterChainId, setNewTheaterChainId] = useState("");
  const [newTheaterAddress, setNewTheaterAddress] = useState("");
  const [newTheaterCity, setNewTheaterCity] = useState("Dhaka");
  const [newTheaterPhone, setNewTheaterPhone] = useState("");
  const [newTheaterEmail, setNewTheaterEmail] = useState("");

  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenTheaterId, setNewScreenTheaterId] = useState("");
  const [newScreenType, setNewScreenType] = useState<"STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER">("STANDARD");
  const [newScreenSeats, setNewScreenSeats] = useState(150);

  // Form States (Edit Forms)
  const [editChainName, setEditChainName] = useState("");
  const [editChainDesc, setEditChainDesc] = useState("");
  const [editChainWebsite, setEditChainWebsite] = useState("");
  const [editChainPhone, setEditChainPhone] = useState("");
  const [editChainEmail, setEditChainEmail] = useState("");
  const [editChainActive, setEditChainActive] = useState(true);

  const [editTheaterName, setEditTheaterName] = useState("");
  const [editTheaterChainId, setEditTheaterChainId] = useState("");
  const [editTheaterAddress, setEditTheaterAddress] = useState("");
  const [editTheaterCity, setEditTheaterCity] = useState("Dhaka");
  const [editTheaterPhone, setEditTheaterPhone] = useState("");
  const [editTheaterEmail, setEditTheaterEmail] = useState("");
  const [editTheaterActive, setEditTheaterActive] = useState(true);

  const [editScreenName, setEditScreenName] = useState("");
  const [editScreenType, setEditScreenType] = useState<"STANDARD" | "IMAX" | "DOLBY" | "4DX" | "VIP" | "OTHER">("STANDARD");
  const [editScreenSeats, setEditScreenSeats] = useState(150);
  const [editScreenActive, setEditScreenActive] = useState(true);

  // Fetch all data from database on mount
  const fetchData = async () => {
    try {
      const [chainsRes, theatersRes, screensRes] = await Promise.all([
        fetch("/api/cinema/chains").then((r) => r.json()),
        fetch("/api/cinema/admin-theaters").then((r) => r.json()),
        fetch("/api/cinema/screens").then((r) => r.json()),
      ]);
      setChains(chainsRes);
      setTheaters(theatersRes);
      setScreens(screensRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load cineplex data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for starting edits
  const startEditChain = (chain: CineplexChain) => {
    setEditingChain(chain);
    setEditChainName(chain.name);
    setEditChainDesc(chain.description || "");
    setEditChainWebsite(chain.website || "");
    setEditChainPhone(chain.contactPhone || "");
    setEditChainEmail(chain.contactEmail || "");
    setEditChainActive(chain.isActive);
    setIsEditChainDialogOpen(true);
  };

  const startEditTheater = (theater: CinemaTheater) => {
    setEditingTheater(theater);
    setEditTheaterName(theater.name);
    setEditTheaterChainId(theater.cineplexChainId || "");
    setEditTheaterAddress(theater.address || "");
    setEditTheaterCity(theater.city);
    setEditTheaterPhone(theater.phone || "");
    setEditTheaterEmail(theater.email || "");
    setEditTheaterActive(theater.isActive);
    setIsEditTheaterDialogOpen(true);
  };

  const startEditScreen = (screen: CinemaScreen) => {
    setEditingScreen(screen);
    setEditScreenName(screen.name);
    setEditScreenType(screen.screenType);
    setEditScreenSeats(screen.totalSeats);
    setEditScreenActive(screen.isActive);
    setIsEditScreenDialogOpen(true);
  };

  // Handlers for adding items
  const handleAddChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChainName.trim()) return;

    const slug = newChainName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const res = await fetch("/api/cinema/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChainName,
          slug,
          description: newChainDesc || undefined,
          logoUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=60",
          website: newChainWebsite || undefined,
          contactEmail: newChainEmail || undefined,
          contactPhone: newChainPhone || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create chain");
      }

      toast.success("Cineplex chain created successfully");
      setIsChainDialogOpen(false);
      // Reset Form
      setNewChainName("");
      setNewChainDesc("");
      setNewChainWebsite("");
      setNewChainPhone("");
      setNewChainEmail("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create chain");
    }
  };

  const handleAddTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTheaterName.trim() || !newTheaterChainId) return;

    const slug = newTheaterName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const res = await fetch("/api/cinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cineplexChainId: newTheaterChainId,
          name: newTheaterName,
          slug,
          address: newTheaterAddress || undefined,
          city: newTheaterCity,
          state: newTheaterCity + " Division",
          phone: newTheaterPhone || undefined,
          email: newTheaterEmail || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create branch");
      }

      toast.success("Cinema branch created successfully");
      setIsTheaterDialogOpen(false);
      // Reset Form
      setNewTheaterName("");
      setNewTheaterAddress("");
      setNewTheaterPhone("");
      setNewTheaterEmail("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create branch");
    }
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

  // Handlers for editing items
  const handleEditChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChain || !editChainName.trim()) return;

    const slug = editChainName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const res = await fetch(`/api/cinema/chains/${editingChain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editChainName,
          slug,
          description: editChainDesc || null,
          website: editChainWebsite || null,
          contactPhone: editChainPhone || null,
          contactEmail: editChainEmail || null,
          isActive: editChainActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update chain");
      }

      toast.success("Cineplex chain updated successfully");
      setIsEditChainDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update chain");
    }
  };

  const handleEditTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheater || !editTheaterName.trim()) return;

    const slug = editTheaterName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const res = await fetch(`/api/cinema/${editingTheater.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cineplexChainId: editTheaterChainId || null,
          name: editTheaterName,
          slug,
          address: editTheaterAddress || null,
          city: editTheaterCity,
          state: editTheaterCity + " Division",
          phone: editTheaterPhone || null,
          email: editTheaterEmail || null,
          isActive: editTheaterActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update branch");
      }

      toast.success("Cinema branch updated successfully");
      setIsEditTheaterDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update branch");
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

  // Handlers for deleting items
  const handleDeleteChain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Cineplex Chain? All associated branch locations will remain but become independent.")) return;

    try {
      const res = await fetch(`/api/cinema/chains/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete chain");
      }

      toast.success("Cineplex chain deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete chain");
    }
  };

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

  // Filter Functions
  const filteredTheaters = theaters.filter((theater) => {
    const matchesChain = selectedChainId === "all" || theater.cineplexChainId === selectedChainId;
    const matchesSearch =
      theater.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      theater.city.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchesChain && matchesSearch;
  });

  const filteredScreens = screens.filter((screen) => {
    const theater = theaters.find((t) => t.id === screen.theatreId);
    if (!theater) return false;

    const matchesChain = selectedChainId === "all" || theater.cineplexChainId === selectedChainId;
    const matchesTheater = selectedTheaterId === "all" || screen.theatreId === selectedTheaterId;
    const matchesSearch =
      screen.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      screen.screenType.toLowerCase().includes(searchTerm.toLowerCase().trim());

    return matchesChain && matchesTheater && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Cineplex Chain & Cinema Halls
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure Cineplex chains, physical theater locations, and active cinema screening halls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Add Chain Button */}
          <Dialog open={isChainDialogOpen} onOpenChange={setIsChainDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Plus className="mr-2 h-4 w-4" /> Add Chain
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddChain}>
                <DialogHeader>
                  <DialogTitle>Add Cineplex Chain</DialogTitle>
                  <DialogDescription>
                    Create a new corporate Cineplex Brand (e.g. Star Cineplex).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="chain-name">Chain Name</Label>
                    <Input
                      id="chain-name"
                      value={newChainName}
                      onChange={(e) => setNewChainName(e.target.value)}
                      placeholder="e.g. Star Cineplex"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chain-desc">Description</Label>
                    <Textarea
                      id="chain-desc"
                      value={newChainDesc}
                      onChange={(e) => setNewChainDesc(e.target.value)}
                      placeholder="Brief overview of the brand..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chain-website">Website URL</Label>
                    <Input
                      id="chain-website"
                      value={newChainWebsite}
                      onChange={(e) => setNewChainWebsite(e.target.value)}
                      placeholder="https://cineplex.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="chain-email">Email</Label>
                      <Input
                        id="chain-email"
                        type="email"
                        value={newChainEmail}
                        onChange={(e) => setNewChainEmail(e.target.value)}
                        placeholder="info@cineplex.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="chain-phone">Phone</Label>
                      <Input
                        id="chain-phone"
                        value={newChainPhone}
                        onChange={(e) => setNewChainPhone(e.target.value)}
                        placeholder="+880..."
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Chain</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Branch Button */}
          <Dialog open={isTheaterDialogOpen} onOpenChange={setIsTheaterDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
                <Building2 className="mr-2 h-4 w-4" /> Add Branch
              </Button>
            } />
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleAddTheater}>
                <DialogHeader>
                  <DialogTitle>Add Cinema Branch</DialogTitle>
                  <DialogDescription>
                    Add a new physical multiplex location to an existing Cineplex Chain.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Parent Chain</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={newTheaterChainId}
                      onChange={(e) => setNewTheaterChainId(e.target.value)}
                      required
                    >
                      <option value="">Select a Cineplex Chain</option>
                      {chains.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="theater-name">Branch / Theater Name</Label>
                    <Input
                      id="theater-name"
                      value={newTheaterName}
                      onChange={(e) => setNewTheaterName(e.target.value)}
                      placeholder="e.g. Star Cineplex - Bashundhara City"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="theater-address">Address</Label>
                    <Input
                      id="theater-address"
                      value={newTheaterAddress}
                      onChange={(e) => setNewTheaterAddress(e.target.value)}
                      placeholder="Street address, level, etc."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>City</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={newTheaterCity}
                        onChange={(e) => setNewTheaterCity(e.target.value)}
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="theater-phone">Phone</Label>
                      <Input
                        id="theater-phone"
                        value={newTheaterPhone}
                        onChange={(e) => setNewTheaterPhone(e.target.value)}
                        placeholder="Contact number"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="theater-email">Branch Email</Label>
                    <Input
                      id="theater-email"
                      type="email"
                      value={newTheaterEmail}
                      onChange={(e) => setNewTheaterEmail(e.target.value)}
                      placeholder="branch@cineplex.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save Branch</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading database configurations...</span>
        </div>
      ) : (
        /* Tabs Layout */
        <Tabs defaultValue="chains" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/60 p-1 rounded-lg">
            <TabsTrigger value="chains" className="rounded-md">Brands & Chains</TabsTrigger>
            <TabsTrigger value="branches" className="rounded-md">Locations</TabsTrigger>
            <TabsTrigger value="halls" className="rounded-md">Cinema Halls</TabsTrigger>
          </TabsList>

          {/* Tab 1: Chains */}
          <TabsContent value="chains" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chains.map((chain) => (
                <Card key={chain.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 overflow-hidden shadow-xs">
                        {chain.logoUrl ? (
                          <img src={chain.logoUrl} alt={chain.name} className="h-full w-full object-cover" />
                        ) : (
                          <Film className="h-6 w-6 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={chain.isActive ? "default" : "secondary"} className="bg-opacity-10 shadow-none">
                          {chain.isActive ? "Active Chain" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600" onClick={() => startEditChain(chain)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteChain(chain.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-3 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xl font-bold">
                      {chain.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 min-h-[40px] text-sm text-muted-foreground">
                      {chain.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 space-y-4">
                    <div className="pt-2 border-t border-muted/50 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="block text-xs font-semibold uppercase text-muted-foreground/60 tracking-wider">Total Multiplexes</span>
                        <span className="font-bold text-lg text-foreground mt-0.5 block">{chain.totalCinemas} Location(s)</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase text-muted-foreground/60 tracking-wider">Active Screens</span>
                        <span className="font-bold text-lg text-indigo-600 mt-0.5 block">
                          {theaters.filter(t => t.cineplexChainId === chain.id).reduce((sum, t) => sum + t.totalScreens, 0)} Screens
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2.5 text-xs text-muted-foreground">
                      {chain.website && (
                        <a href={chain.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{chain.website}</span>
                          <ExternalLink className="h-3 w-3 inline ml-auto" />
                        </a>
                      )}
                      {chain.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{chain.contactEmail}</span>
                        </div>
                      )}
                      {chain.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{chain.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: Branches */}
          <TabsContent value="branches" className="mt-4">
            <Card className="border-muted shadow-xs">
              <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Multiplex Locations</CardTitle>
                  <CardDescription>
                    List of cinema branches, address, phone numbers, and screen counts.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search locations..."
                      className="pl-8 bg-muted/30"
                      value={searchTerm === " " ? "" : searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={selectedChainId}
                    onChange={(e) => setSelectedChainId(e.target.value)}
                    className="flex h-9 w-fit rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">All Brands</option>
                    {chains.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Location Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Screens</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTheaters.length > 0 ? (
                        filteredTheaters.map((theater) => {
                          const chainName = chains.find(c => c.id === theater.cineplexChainId)?.name || "Independent";
                          return (
                            <TableRow key={theater.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-indigo-500" />
                                {theater.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal text-xs">{chainName}</Badge>
                              </TableCell>
                              <TableCell>{theater.city}</TableCell>
                              <TableCell className="max-w-[250px] truncate text-muted-foreground text-xs" title={theater.address || ""}>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/75" />
                                  {theater.address || "No address configured"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{theater.totalScreens} Screens</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                <div>{theater.phone || "No phone"}</div>
                                <div>{theater.email || "No email"}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={theater.isActive ? "default" : "secondary"} className="bg-opacity-10 shadow-none">
                                  {theater.isActive ? "Open" : "Closed"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => startEditTheater(theater)}>
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
                          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No branches found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Halls / Screens */}
          <TabsContent value="halls" className="mt-4">
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
                      value={searchTerm === " " ? "" : searchTerm}
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
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredScreens.length > 0 ? (
                    filteredScreens.map((screen) => {
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
                                {theater?.name} ({chainName})
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
                                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live Shows
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600" onClick={() => startEditScreen(screen)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteScreen(screen.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                <Link href={`/admin/movies/cineplex/seat-map?screenId=${screen.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Chain Dialog */}
      <Dialog open={isEditChainDialogOpen} onOpenChange={setIsEditChainDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditChain}>
            <DialogHeader>
              <DialogTitle>Edit Cineplex Chain</DialogTitle>
              <DialogDescription>
                Update the brand details for this Cineplex.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-chain-name">Chain Name</Label>
                <Input
                  id="edit-chain-name"
                  value={editChainName}
                  onChange={(e) => setEditChainName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-chain-desc">Description</Label>
                <Textarea
                  id="edit-chain-desc"
                  value={editChainDesc}
                  onChange={(e) => setEditChainDesc(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-chain-website">Website URL</Label>
                <Input
                  id="edit-chain-website"
                  value={editChainWebsite}
                  onChange={(e) => setEditChainWebsite(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-chain-email">Email</Label>
                  <Input
                    id="edit-chain-email"
                    type="email"
                    value={editChainEmail}
                    onChange={(e) => setEditChainEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-chain-phone">Phone</Label>
                  <Input
                    id="edit-chain-phone"
                    value={editChainPhone}
                    onChange={(e) => setEditChainPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-chain-active"
                  checked={editChainActive}
                  onChange={(e) => setEditChainActive(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <Label htmlFor="edit-chain-active">Active Chain Brand</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditChainDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Theater Dialog */}
      <Dialog open={isEditTheaterDialogOpen} onOpenChange={setIsEditTheaterDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleEditTheater}>
            <DialogHeader>
              <DialogTitle>Edit Cinema Branch</DialogTitle>
              <DialogDescription>
                Update the physical location and contact details for this multiplex.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Parent Chain</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  value={editTheaterChainId}
                  onChange={(e) => setEditTheaterChainId(e.target.value)}
                  required
                >
                  <option value="">Select a Cineplex Chain</option>
                  {chains.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-theater-name">Branch / Theater Name</Label>
                <Input
                  id="edit-theater-name"
                  value={editTheaterName}
                  onChange={(e) => setEditTheaterName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-theater-address">Address</Label>
                <Input
                  id="edit-theater-address"
                  value={editTheaterAddress}
                  onChange={(e) => setEditTheaterAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={editTheaterCity}
                    onChange={(e) => setEditTheaterCity(e.target.value)}
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-theater-phone">Phone</Label>
                  <Input
                    id="edit-theater-phone"
                    value={editTheaterPhone}
                    onChange={(e) => setEditTheaterPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-theater-email">Branch Email</Label>
                <Input
                  id="edit-theater-email"
                  type="email"
                  value={editTheaterEmail}
                  onChange={(e) => setEditTheaterEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-theater-active"
                  checked={editTheaterActive}
                  onChange={(e) => setEditTheaterActive(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <Label htmlFor="edit-theater-active">Active Branch Location (Open)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditTheaterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
