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
  Armchair,
  Crown,
  Star,
  Accessibility,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Users,
  BadgePercent,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SeatType {
  id: string;
  name: string;
  capacity: number;
  priceMultiplier: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual presets per seat-type name (keyword-matched)
// ─────────────────────────────────────────────────────────────────────────────

const PRESET_STYLES: {
  keyword: string;
  gradient: string;
  icon: React.ComponentType<any>;
  badge: string;
  ring: string;
}[] = [
  {
    keyword: "standard",
    gradient: "from-slate-700 to-slate-800",
    icon: Armchair,
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    ring: "ring-slate-400",
  },
  {
    keyword: "premium",
    gradient: "from-indigo-600 to-violet-700",
    icon: Star,
    badge: "bg-indigo-50 text-indigo-700 border-indigo-300",
    ring: "ring-indigo-400",
  },
  {
    keyword: "vip",
    gradient: "from-amber-500 to-orange-600",
    icon: Crown,
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    ring: "ring-amber-400",
  },
  {
    keyword: "recliner",
    gradient: "from-violet-600 to-purple-700",
    icon: Sparkles,
    badge: "bg-violet-50 text-violet-700 border-violet-300",
    ring: "ring-violet-400",
  },
  {
    keyword: "wheelchair",
    gradient: "from-emerald-600 to-teal-700",
    icon: Accessibility,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
    ring: "ring-emerald-400",
  },
  {
    keyword: "couple",
    gradient: "from-rose-500 to-pink-600",
    icon: Users,
    badge: "bg-rose-50 text-rose-700 border-rose-300",
    ring: "ring-rose-400",
  },
];

const FALLBACK_GRADIENTS = [
  "from-cyan-600 to-blue-700",
  "from-fuchsia-600 to-pink-700",
  "from-lime-600 to-green-700",
  "from-orange-600 to-red-700",
];

function getPreset(name: string, index: number) {
  const lower = name.toLowerCase();
  const match = PRESET_STYLES.find(p => lower.includes(p.keyword));
  if (match) return match;
  return {
    keyword: lower,
    gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
    icon: Layers,
    badge: "bg-blue-50 text-blue-700 border-blue-300",
    ring: "ring-blue-400",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Multiplier label
// ─────────────────────────────────────────────────────────────────────────────

function MultiplierBadge({ value }: { value: string }) {
  const n = parseFloat(value);
  const color =
    n <= 1 ? "bg-slate-100 text-slate-600 border-slate-200" :
    n <= 1.5 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
    n <= 2 ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}>
      <TrendingUp className="h-2.5 w-2.5" />
      ×{Number(value).toFixed(2)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SeatTypesPage() {
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCapacity, setAddCapacity] = useState(1);
  const [addMultiplier, setAddMultiplier] = useState("1.00");
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog
  const [editingType, setEditingType] = useState<SeatType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState(1);
  const [editMultiplier, setEditMultiplier] = useState("1.00");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seats/types").then(r => r.json());
      setSeatTypes(Array.isArray(res) ? res : res.items || []);
    } catch {
      toast.error("Failed to load seat types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/seats/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          capacity: addCapacity,
          priceMultiplier: addMultiplier,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create seat type");
      }
      toast.success(`Seat type "${addName}" created`);
      setIsAddOpen(false);
      setAddName(""); setAddCapacity(1); setAddMultiplier("1.00");
      fetchTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to create seat type");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (st: SeatType) => {
    setEditingType(st);
    setEditName(st.name);
    setEditCapacity(st.capacity);
    setEditMultiplier(st.priceMultiplier);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/seats/types/${editingType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          capacity: editCapacity,
          priceMultiplier: editMultiplier,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update seat type");
      }
      toast.success(`Seat type "${editName}" updated`);
      setIsEditOpen(false);
      fetchTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to update seat type");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/seats/types/${deletingId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete seat type");
      }
      toast.success("Seat type deleted");
      setIsDeleteOpen(false);
      setDeletingId(null);
      fetchTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete seat type");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Seat Types
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Define categories (Standard, Premium, VIP…) with capacity and pricing multipliers applied across all screens.
          </p>
        </div>

        {/* Add dialog trigger */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0">
              <Plus className="mr-2 h-4 w-4" /> New Seat Type
            </Button>
          } />
          <DialogContent className="sm:max-w-[380px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Armchair className="h-4 w-4 text-indigo-500" /> Add Seat Type
                </DialogTitle>
                <DialogDescription>
                  Define a new seating category with a price multiplier applied to the base ticket price.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-5">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">
                    Category Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="add-name"
                    value={addName}
                    maxLength={10}
                    onChange={e => setAddName(e.target.value)}
                    placeholder="e.g. Standard, Premium, VIP…"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">Max 10 characters</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="add-capacity">
                      Capacity <span className="text-muted-foreground text-xs">(seats per unit)</span>
                    </Label>
                    <Input
                      id="add-capacity"
                      type="number"
                      min={1}
                      max={4}
                      value={addCapacity}
                      onChange={e => setAddCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-multiplier">
                      Price Multiplier
                    </Label>
                    <Input
                      id="add-multiplier"
                      type="number"
                      step="0.01"
                      min="0.50"
                      max="9.99"
                      value={addMultiplier}
                      onChange={e => setAddMultiplier(e.target.value)}
                    />
                  </div>
                </div>
                {/* Live preview */}
                <div className="rounded-lg border border-muted bg-muted/20 p-3 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getPreset(addName || "standard", 0).gradient} flex items-center justify-center shrink-0`}>
                    {React.createElement(getPreset(addName || "standard", 0).icon, { className: "h-5 w-5 text-white" })}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{addName || "Name preview"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {addCapacity} per unit
                      </span>
                      <MultiplierBadge value={addMultiplier || "1.00"} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {addLoading ? "Creating…" : "Create Type"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading seat types…</span>
        </div>
      ) : seatTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-muted flex items-center justify-center">
              <Armchair className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No seat types configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create categories like Standard, Premium, and VIP to use in your seat map designer.
              </p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white mt-2"
            >
              <Plus className="mr-2 h-4 w-4" /> Create First Seat Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-muted shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Layers className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{seatTypes.length}</p>
                  <p className="text-[11px] text-muted-foreground">Total Types</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <BadgePercent className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ×{(seatTypes.reduce((sum, t) => sum + parseFloat(t.priceMultiplier), 0) / seatTypes.length).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Avg Multiplier</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Crown className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ×{Math.max(...seatTypes.map(t => parseFloat(t.priceMultiplier))).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Highest Tier</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.max(...seatTypes.map(t => t.capacity))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Max Capacity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seatTypes.map((st, i) => {
              const preset = getPreset(st.name, i);
              const Icon = preset.icon;
              const multiplier = parseFloat(st.priceMultiplier);

              return (
                <Card key={st.id} className={`border border-muted/80 shadow-xs hover:shadow-md transition-all group ring-0 hover:ring-2 ${preset.ring} hover:ring-offset-1`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      {/* Icon gradient box */}
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-indigo-600"
                          onClick={() => startEdit(st)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          onClick={() => confirmDelete(st.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold mt-3">{st.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Seat category · {st.capacity > 1 ? `${st.capacity}-person unit` : "Single seat"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Multiplier visual */}
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Price Multiplier
                      </span>
                      <MultiplierBadge value={st.priceMultiplier} />
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Capacity
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {st.capacity} {st.capacity === 1 ? "person" : "persons"}
                      </span>
                    </div>

                    {/* Price example */}
                    <div className="rounded-lg border border-dashed border-muted p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Example at ৳300 base</p>
                      <p className="text-sm font-bold text-foreground">
                        ৳{(300 * multiplier).toFixed(0)}{" "}
                        {multiplier > 1 && <span className="text-[10px] text-emerald-600 font-medium">+{((multiplier - 1) * 100).toFixed(0)}%</span>}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add new card shortcut */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-muted hover:border-indigo-400 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-indigo-600 transition-all group"
            >
              <div className="h-10 w-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">Add Seat Type</span>
            </button>
          </div>
        </>
      )}

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-indigo-500" /> Edit Seat Type
              </DialogTitle>
              <DialogDescription>
                Update the name, capacity, or price multiplier for this seat category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-5">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="edit-name"
                  value={editName}
                  maxLength={10}
                  onChange={e => setEditName(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Max 10 characters</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number" min={1} max={4}
                    value={editCapacity}
                    onChange={e => setEditCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-multiplier">Price Multiplier</Label>
                  <Input
                    id="edit-multiplier"
                    type="number" step="0.01" min="0.50" max="9.99"
                    value={editMultiplier}
                    onChange={e => setEditMultiplier(e.target.value)}
                  />
                </div>
              </div>
              {/* Live preview */}
              <div className="rounded-lg border border-muted bg-muted/20 p-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getPreset(editName || "standard", 0).gradient} flex items-center justify-center shrink-0`}>
                  {React.createElement(getPreset(editName || "standard", 0).icon, { className: "h-5 w-5 text-white" })}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{editName || "Name preview"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {editCapacity} per unit
                    </span>
                    <MultiplierBadge value={editMultiplier || "1.00"} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editLoading ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" /> Delete Seat Type
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the seat type. Any seats already assigned this type in the database will lose their category. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              {deleteLoading ? "Deleting…" : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
