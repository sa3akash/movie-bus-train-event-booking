"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2, Play, Image as ImageIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AdFormData, 
  initialFormState, 
  CreativeTab, 
  TargetingTab, 
  PlacementTab, 
  FinancialsTab 
} from "./_components/AdForm";

interface Ad {
  id: string;
  title: string;
  category: string;
  format: string;
  uri: string;
  duration: number;
  minAge: number | null;
  maxAge: number | null;
  targetCountries: string[] | null;
  targetGenders: string[] | null;
  targetCategories: string[] | null;
  targetDevices: string[] | null;
  budget: number | null;
  spent: number | null;
  isSkippable: boolean;
  skipOffset: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AdFormData>(initialFormState);
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
      
      const payload = {
        ...formData,
        skipOffset: Number(formData.skipOffset),
        duration: Number(formData.duration),
        minAge: formData.minAge === "" ? null : Number(formData.minAge),
        maxAge: formData.maxAge === "" ? null : Number(formData.maxAge),
        budget: formData.budget === "" ? null : Number(formData.budget),
        targetCountries: formData.targetCountries.length ? formData.targetCountries : null,
        targetCategories: formData.targetCategories.length ? formData.targetCategories : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Ad updated!" : "Ad created!");
        setIsDialogOpen(false);
        setFormData(initialFormState);
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
      format: ad.format,
      uri: ad.uri,
      duration: ad.duration,
      minAge: ad.minAge ?? "",
      maxAge: ad.maxAge ?? "",
      targetCountries: ad.targetCountries || [],
      targetGenders: ad.targetGenders || [],
      targetCategories: ad.targetCategories || [],
      targetDevices: ad.targetDevices || ["desktop", "mobile", "tablet"],
      budget: ad.budget ?? "",
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
          <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
          <p className="text-muted-foreground mt-2">Create targeted ad campaigns and track budget spend.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData(initialFormState);
              setEditingId(null);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4">
              <Tabs defaultValue="creative" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="creative">Creative</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  <TabsTrigger value="placement">Placement</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>

                <TabsContent value="creative"><CreativeTab formData={formData} setFormData={setFormData} /></TabsContent>
                <TabsContent value="targeting"><TargetingTab formData={formData} setFormData={setFormData} /></TabsContent>
                <TabsContent value="placement"><PlacementTab formData={formData} setFormData={setFormData} /></TabsContent>
                <TabsContent value="financials"><FinancialsTab formData={formData} setFormData={setFormData} /></TabsContent>
              </Tabs>

              <div className="pt-6">
                <Button type="submit" className="w-full">
                  {editingId ? "Save Campaign Changes" : "Publish Campaign"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Format & Placement</TableHead>
              <TableHead>Targeting</TableHead>
              <TableHead>Delivery & Spend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No active campaigns found. Create your first ad!
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => {
                const spendPercentage = ad.budget && ad.spent ? (ad.spent / ad.budget) * 100 : 0;
                
                return (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {ad.format === 'video' ? <Play className="w-4 h-4 text-blue-500" /> : <ImageIcon className="w-4 h-4 text-green-500" />}
                        {ad.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Duration: {ad.duration}s</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize mb-1">{ad.format}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{ad.category.replace("_", " ")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {ad.targetCountries?.length ? <div>🌍 {ad.targetCountries.join(", ")}</div> : <div>🌍 Global</div>}
                        {ad.minAge || ad.maxAge ? <div>👥 {ad.minAge || "13"}-{ad.maxAge || "65+"} yrs</div> : <div>👥 All Ages</div>}
                        {ad.targetDevices?.length ? <div className="capitalize">📱 {ad.targetDevices.join(", ")}</div> : <div>📱 All Devices</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          ${Number(ad.spent || 0).toFixed(2)} spent
                        </div>
                        {ad.budget && (
                          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                            />
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {ad.budget ? `of $${Number(ad.budget).toFixed(2)}` : 'Unlimited Budget'}
                        </div>
                      </div>
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
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
