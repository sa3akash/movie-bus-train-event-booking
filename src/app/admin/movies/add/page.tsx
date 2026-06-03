"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Film,
  Star,
  Clock,
  DollarSign,
  Globe,
  Image,
  Video,
  CalendarDays,
  Tv,
  CheckCircle2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { VideoUpload } from "@/components/admin/VideoUpload";

const STATUS_OPTIONS = [
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "NOW_SHOWING", label: "Now Showing" },
  { value: "RELEASED", label: "Released" },
  { value: "NOT_PLAYING", label: "Not Playing" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AddMoviePage() {
  return (
    <React.Suspense
      fallback={<div className="p-8 text-center">Loading...</div>}
    >
      <AddMovieForm />
    </React.Suspense>
  );
}

function AddMovieForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    language: "",
    releaseDate: "",
    duration: "",
    rating: "",
    price: "",
    posterId: "",
    posterUrl: "",
    trailerUrl: "",
    isNowShowing: false,
    isComingSoon: false,
    status: "COMING_SOON",
  });

  const [slugManual, setSlugManual] = useState(false);

  // If edit mode, fetch existing movie
  useEffect(() => {
    if (!editId) return;
    setFetchingEdit(true);
    fetch(`/api/movie/admin-list?limit=1000`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.items || []).find((m: any) => m.id === editId);
        if (found) {
          setForm({
            title: found.title || "",
            slug: found.slug || "",
            description: "",
            language: found.language || "",
            releaseDate: found.releaseDate
              ? new Date(found.releaseDate).toISOString().slice(0, 10)
              : "",
            duration: String(found.duration || ""),
            rating: found.rating || "",
            price: found.price || "",
            posterId: found.posterId || "",
            posterUrl: found.posterUrl || "",
            trailerUrl: "",
            isNowShowing: found.isNowShowing ?? false,
            isComingSoon: found.isComingSoon ?? false,
            status: found.status || "COMING_SOON",
          });
          setSlugManual(true);
        }
      })
      .catch(() => toast.error("Failed to load movie data"))
      .finally(() => setFetchingEdit(false));
  }, [editId]);

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManual ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.slug ||
      !form.releaseDate ||
      !form.duration ||
      !form.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description || undefined,
        language: form.language || undefined,
        releaseDate: new Date(form.releaseDate).toISOString(),
        duration: Number(form.duration),
        rating: form.rating || "0",
        price: form.price,
        posterId: form.posterId || undefined,
        trailerUrl: form.trailerUrl || undefined,
        isNowShowing: form.isNowShowing,
        isComingSoon: form.isComingSoon,
        status: form.status,
      };

      const url = isEditMode ? `/api/movie/${editId}` : "/api/movie";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save movie");
      }

      toast.success(
        isEditMode
          ? "Movie updated successfully"
          : "Movie created successfully",
      );
      router.push("/admin/movies");
    } catch (e: any) {
      toast.error(e.message || "Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEdit) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Movie" : "Add New Movie"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? "Update the movie details below."
              : "Fill in the details to add a new movie to the system."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Film className="h-4 w-4 text-indigo-500" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Title, slug, description and language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Avengers: Endgame"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="avengers-endgame"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setForm((p) => ({ ...p, slug: e.target.value }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="e.g. English, Bengali"
                  value={form.language}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, language: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief synopsis of the movie..."
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              Schedule & Pricing
            </CardTitle>
            <CardDescription>
              Release date, duration, rating and ticket price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">
                  Release Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, releaseDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="120"
                    className="pl-8"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, duration: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">IMDb / Rating</Label>
                <div className="relative">
                  <Star className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-400" />
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="8.5"
                    className="pl-8"
                    value={form.rating}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rating: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">
                  Ticket Price (৳) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="500"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tv className="h-4 w-4 text-indigo-500" />
              Status & Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    form.isNowShowing
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-muted-foreground/30 group-hover:border-muted-foreground"
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, isNowShowing: !p.isNowShowing }))
                  }
                >
                  {form.isNowShowing && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">Mark as Now Showing</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    form.isComingSoon
                      ? "bg-blue-500 border-blue-500"
                      : "border-muted-foreground/30 group-hover:border-muted-foreground"
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, isComingSoon: !p.isComingSoon }))
                  }
                >
                  {form.isComingSoon && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">Mark as Coming Soon</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Image className="h-4 w-4 text-indigo-500" />
              Media URLs
            </CardTitle>
            <CardDescription>
              Poster image and trailer video URLs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poster">Poster Image</Label>
                <ImageUpload
                  value={
                    form.posterUrl
                      ? { url: form.posterUrl, id: form.posterId }
                      : null
                  }
                  onChange={(img) =>
                    setForm((p) => ({
                      ...p,
                      posterId: img?.id || "",
                      posterUrl: img?.url || "",
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailer">Trailer Video</Label>
                <VideoUpload
                  value={form.trailerUrl}
                  onChange={(url) =>
                    setForm((p) => ({ ...p, trailerUrl: url || "" }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end gap-4 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white min-w-[130px]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Update Movie" : "Create Movie"}
          </Button>
        </div>
      </form>
    </div>
  );
}
