"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Ad {
  id: string;
  title: string;
  category: string;
  uri: string;
  isSkippable: boolean;
  skipOffset: number;
  isActive: boolean;
  createdAt: string;
}

const initialForm = {
  title: "",
  category: "PRE_ROLL",
  uri: "",
  isSkippable: true,
  skipOffset: 5,
  isActive: true,
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/ads/admin");
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
      }
    } catch (e) {
      toast.error("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/ads/admin/${editingId}` : "/api/ads/admin";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skipOffset: Number(formData.skipOffset)
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Ad updated!" : "Ad created!");
        setIsDialogOpen(false);
        setFormData(initialForm);
        setEditingId(null);
        fetchAds();
      } else {
        toast.error(data.error || "Failed to save ad");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const res = await fetch(`/api/ads/admin/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Ad deleted");
        fetchAds();
      }
    } catch (e) {
      toast.error("Failed to delete ad");
    }
  };

  const handleEdit = (ad: Ad) => {
    setFormData({
      title: ad.title,
      category: ad.category,
      uri: ad.uri,
      isSkippable: ad.isSkippable,
      skipOffset: ad.skipOffset,
      isActive: ad.isActive,
    });
    setEditingId(ad.id);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      await fetch(`/api/ads/admin/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });
      fetchAds();
    } catch (e) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Management</h1>
          <p className="text-muted-foreground mt-2">Manage custom video interstitials globally.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData(initialForm);
              setEditingId(null);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Ad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Summer Sale Promo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="PRE_ROLL">Pre-Roll (Starts immediately)</option>
                  <option value="MID_ROLL">Mid-Roll (Starts randomly in middle)</option>
                  <option value="POST_ROLL">Post-Roll (Starts at the end)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Video URI (MP4 URL)</label>
                <Input
                  required
                  value={formData.uri}
                  onChange={e => setFormData({...formData, uri: e.target.value})}
                  placeholder="https://example.com/ad.mp4"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Skip Offset (seconds)</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={formData.skipOffset}
                    onChange={e => setFormData({...formData, skipOffset: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isSkippable}
                    onCheckedChange={c => setFormData({...formData, isSkippable: c})}
                  />
                  <label className="text-sm font-medium">Is Skippable</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={c => setFormData({...formData, isActive: c})}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Save Changes" : "Create Ad"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Video Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No ads found.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.category.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={ad.uri}>
                    <a href={ad.uri} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {ad.uri}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => handleToggleActive(ad)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
