"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Tag,
  Hash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Genre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addSlugManual, setAddSlugManual] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editGenre, setEditGenre] = useState<Genre | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/movie/genres");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGenres(data || []);
    } catch {
      toast.error("Failed to load genres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const filtered = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNameChange = (val: string) => {
    setAddName(val);
    if (!addSlugManual) setAddSlug(slugify(val));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addSlug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/movie/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), slug: addSlug.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create genre");
      }
      toast.success("Genre created successfully");
      setAddOpen(false);
      setAddName("");
      setAddSlug("");
      setAddSlugManual(false);
      fetchGenres();
    } catch (e: any) {
      toast.error(e.message || "Failed to create genre");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (genre: Genre) => {
    setEditGenre(genre);
    setEditName(genre.name);
    setEditSlug(genre.slug);
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGenre || !editName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/movie/genres/${editGenre.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update genre");
      }
      toast.success("Genre updated");
      setEditOpen(false);
      fetchGenres();
    } catch (e: any) {
      toast.error(e.message || "Failed to update genre");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (genre: Genre) => {
    if (!confirm(`Delete genre "${genre.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/movie/genres/${genre.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }
      toast.success("Genre deleted");
      fetchGenres();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete genre");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Genres
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage movie genre categories.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Genre
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search genres..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Tag className="h-4 w-4" />
        <span>
          <strong className="text-foreground">{genres.length}</strong> genres
          {searchTerm && ` · ${filtered.length} matching`}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-muted-foreground text-sm animate-pulse">
            Loading genres...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border-2 border-dashed rounded-xl text-muted-foreground">
          <Tag className="h-10 w-10 text-muted-foreground/30" />
          <p>
            {searchTerm
              ? `No genres match "${searchTerm}"`
              : "No genres yet. Create your first one."}
          </p>
          {!searchTerm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Genre
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((genre) => (
            <Card
              key={genre.id}
              className="group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {genre.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Hash className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {genre.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600"
                    onClick={() => openEdit(genre)}
                    title="Edit genre"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(genre)}
                    title="Delete genre"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>Add Genre</DialogTitle>
              <DialogDescription>
                Create a new movie genre category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">
                  Genre Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-name"
                  placeholder="e.g. Science Fiction"
                  value={addName}
                  onChange={(e) => handleAddNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-slug">Slug</Label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="add-slug"
                    placeholder="science-fiction"
                    className="pl-8 font-mono text-sm"
                    value={addSlug}
                    onChange={(e) => {
                      setAddSlugManual(true);
                      setAddSlug(e.target.value);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-generated from name. Lowercase letters, numbers, hyphens only.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  setAddName("");
                  setAddSlug("");
                  setAddSlugManual(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Genre
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Genre</DialogTitle>
              <DialogDescription>Update this genre's name or slug.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Genre Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-slug"
                    className="pl-8 font-mono text-sm"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
