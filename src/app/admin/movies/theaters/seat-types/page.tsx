"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Armchair,
  Crown,
  Layers,
  Plus,
  Users,
  BadgePercent,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { SeatType } from "./_components/utils";
import { TheaterSelector } from "./_components/TheaterSelector";
import { SeatTypeCard } from "./_components/SeatTypeCard";
import { SeatTypeFormDialog } from "./_components/SeatTypeFormDialog";

export default function SeatTypesPage() {
  const [theaters, setTheaters] = useState<any[]>([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("");
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog
  const [editingType, setEditingType] = useState<SeatType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTheaters() {
      try {
        const res = await fetch("/api/cinema/admin-theaters").then(r => r.json());
        const tList = res.items || [];
        setTheaters(tList);
        if (tList.length > 0) {
          setSelectedTheaterId(tList[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error("Failed to load theaters");
        setLoading(false);
      }
    }
    fetchTheaters();
  }, []);

  const fetchTypes = useCallback(async () => {
    if (!selectedTheaterId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seats/types?theaterId=${selectedTheaterId}`).then(r => r.json());
      setSeatTypes(Array.isArray(res) ? res : res.items || []);
    } catch {
      toast.error("Failed to load seat types");
    } finally {
      setLoading(false);
    }
  }, [selectedTheaterId]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (data: Partial<SeatType>) => {
    if (!selectedTheaterId) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/seats/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, theaterId: selectedTheaterId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create seat type");
      }
      toast.success(`Seat type "${data.name}" created`);
      setIsAddOpen(false);
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
    setIsEditOpen(true);
  };

  const handleEdit = async (data: Partial<SeatType>) => {
    if (!editingType) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/seats/types/${editingType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update seat type");
      }
      toast.success(`Seat type "${data.name}" updated`);
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
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Seat Types
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Define seating categories (Standard, VIP…) with capacity, price, and visual style for each theater.
          </p>
        </div>

        {selectedTheaterId && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" /> New Seat Type
          </Button>
        )}
      </div>

      <TheaterSelector
        theaters={theaters}
        selectedTheaterId={selectedTheaterId}
        onSelectTheater={setSelectedTheaterId}
      />

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-400 blur-xs animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading...</span>
        </div>
      ) : !selectedTheaterId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No Theater Selected</p>
            <p className="text-sm text-muted-foreground">Select a theater to view or configure seat types.</p>
          </CardContent>
        </Card>
      ) : seatTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-muted flex items-center justify-center">
              <Armchair className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No seat types configured for this theater</p>
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
            {seatTypes.map((st, i) => (
              <SeatTypeCard
                key={st.id}
                st={st}
                index={i}
                onEdit={startEdit}
                onDelete={confirmDelete}
              />
            ))}

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

      {/* Forms */}
      <SeatTypeFormDialog
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        onSubmit={handleAdd}
        loading={addLoading}
        mode="add"
      />

      {editingType && (
        <SeatTypeFormDialog
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          initialData={editingType}
          onSubmit={handleEdit}
          loading={editLoading}
          mode="edit"
        />
      )}

      {/* Delete Confirm Dialog */}
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
