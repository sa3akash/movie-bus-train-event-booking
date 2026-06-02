"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { format } from "date-fns";

export default function EditShowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    basePrice: "",
    status: "",
    availableSeats: 0,
  });

  useEffect(() => {
    if (!id) {
      toast.error("No show ID provided");
      router.push("/admin/movies/shows");
      return;
    }

    fetch(`/api/movie/shows/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load show details");
        return r.json();
      })
      .then((data) => {
        setFormData({
          startTime: data.startTime ? format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm") : "",
          endTime: data.endTime ? format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm") : "",
          basePrice: data.basePrice || "",
          status: data.status || "SCHEDULED",
          availableSeats: data.availableSeats || 0,
        });
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setInitialLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startTime || !formData.endTime || !formData.basePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/movie/shows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          basePrice: formData.basePrice,
          status: formData.status,
          availableSeats: Number(formData.availableSeats),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update show");
      }

      toast.success("Show updated successfully");
      router.push("/admin/movies/shows");
    } catch (error: any) {
      toast.error(error.message || "Failed to update show");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
        <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading show details...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Show</h1>
          <p className="text-muted-foreground mt-1">Update schedule, pricing, or status.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Show Settings</CardTitle>
          <CardDescription>Note: Changing the movie or theater/screen is not permitted to preserve seat bookings. Delete and recreate if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NOT_PLAYING">Not Playing</option>
                </select>
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
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
