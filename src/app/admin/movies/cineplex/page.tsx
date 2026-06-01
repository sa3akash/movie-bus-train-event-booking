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
import { Textarea } from "@/components/ui/textarea";
import {
  Film,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

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
  totalScreens: number;
}

export default function CineplexPage() {
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [theaters, setTheaters] = useState<CinemaTheater[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialogue Open States
  const [isChainDialogOpen, setIsChainDialogOpen] = useState(false);
  const [isEditChainDialogOpen, setIsEditChainDialogOpen] = useState(false);

  // Current item being edited
  const [editingChain, setEditingChain] = useState<CineplexChain | null>(null);

  // Form States (Add)
  const [newChainName, setNewChainName] = useState("");
  const [newChainDesc, setNewChainDesc] = useState("");
  const [newChainWebsite, setNewChainWebsite] = useState("");
  const [newChainPhone, setNewChainPhone] = useState("");
  const [newChainEmail, setNewChainEmail] = useState("");

  // Form States (Edit)
  const [editChainName, setEditChainName] = useState("");
  const [editChainDesc, setEditChainDesc] = useState("");
  const [editChainWebsite, setEditChainWebsite] = useState("");
  const [editChainPhone, setEditChainPhone] = useState("");
  const [editChainEmail, setEditChainEmail] = useState("");
  const [editChainActive, setEditChainActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : "";
      const [chainsRes, theatersRes] = await Promise.all([
        fetch(`/api/cinema/chains?page=${page}&limit=${limit}${searchParam}`).then((r) => r.json()),
        fetch("/api/cinema/admin-theaters?limit=1000").then((r) => {
          if (r.ok) return r.json();
          return { items: [] };
        }),
      ]);
      
      setChains(chainsRes.items || []);
      setTotal(chainsRes.total || 0);
      setTotalPages(chainsRes.pages || 0);
      
      // If total screen count metrics require theaters data
      setTheaters(theatersRes.items || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load cineplex data");
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm]);

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

      toast.success("Cineplex chain brand created successfully");
      setIsChainDialogOpen(false);
      // Reset Form
      setNewChainName("");
      setNewChainDesc("");
      setNewChainWebsite("");
      setNewChainPhone("");
      setNewChainEmail("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create brand");
    }
  };

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

  const handleDeleteChain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Cineplex Chain? Associated branch locations will remain but become independent.")) return;

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
            Cineplex Chains (Brands)
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure Cineplex corporate brands (e.g. Star Cineplex, Blockbuster Cinemas). Supports paginated databases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search brands..."
              className="pl-8 bg-muted/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isChainDialogOpen} onOpenChange={setIsChainDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm">
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
        <div className="space-y-6">
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
            {chains.length === 0 && (
              <div className="col-span-full h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-xl text-muted-foreground">
                <Film className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span>No Cineplex chains found.</span>
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
        </div>
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
    </div>
  );
}
