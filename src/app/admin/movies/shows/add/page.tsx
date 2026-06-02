"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AddShowPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    movieId: "",
    theaterId: "",
    screenId: "",
    startTime: "",
    endTime: "",
    basePrice: "",
    availableSeats: 0,
  });

  useEffect(() => {
    // Fetch movies and theaters
    Promise.all([
      fetch("/api/movie").then((r) => r.json()),
      fetch("/api/cinema/admin-theaters?limit=100").then((r) => r.json()),
    ])
      .then(([moviesData, theatersData]) => {
        setMovies(moviesData || []);
        setTheaters(theatersData.items || []);
      })
      .catch((err) => {
        toast.error("Failed to load initial data");
      });
  }, []);

  useEffect(() => {
    if (formData.theaterId) {
      fetch(`/api/cinema/${formData.theaterId}/screens`)
        .then((r) => r.json())
        .then((data) => {
          setScreens(data || []);
          setFormData((prev) => ({ ...prev, screenId: "" }));
        })
        .catch(() => toast.error("Failed to load screens"));
    } else {
      setScreens([]);
    }
  }, [formData.theaterId]);

  const handleScreenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const screenId = e.target.value;
    const selectedScreen = screens.find((s) => s.id === screenId);
    setFormData((prev) => ({
      ...prev,
      screenId,
      availableSeats: selectedScreen ? selectedScreen.totalSeats : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.movieId || !formData.screenId || !formData.startTime || !formData.endTime || !formData.basePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/movie/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: formData.movieId,
          screenId: formData.screenId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          basePrice: formData.basePrice,
          availableSeats: Number(formData.availableSeats),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create show");
      }

      toast.success("Show created successfully");
      router.push("/admin/movies/shows");
    } catch (error: any) {
      toast.error(error.message || "Failed to create show");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule New Show</h1>
          <p className="text-muted-foreground mt-1">Configure movie showtime and pricing.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Show Details</CardTitle>
          <CardDescription>Select the movie, location, and timing for the show.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="movie">Select Movie</Label>
                <select
                  id="movie"
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Select a movie --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theater">Select Theater</Label>
                <select
                  id="theater"
                  value={formData.theaterId}
                  onChange={(e) => setFormData({ ...formData, theaterId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Select a theater --</option>
                  {theaters.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screen">Select Screen / Hall</Label>
                <select
                  id="screen"
                  value={formData.screenId}
                  onChange={handleScreenChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={!formData.theaterId || screens.length === 0}
                >
                  <option value="">-- Select a screen --</option>
                  {screens.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.totalSeats} seats)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (৳)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableSeats">Available Seats</Label>
                <Input
                  id="availableSeats"
                  type="number"
                  min="0"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData({ ...formData, availableSeats: Number(e.target.value) })}
                  required
                  readOnly // Usually derived from screen config
                  className="bg-muted"
                  title="Auto-filled from screen capacity"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Show
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
