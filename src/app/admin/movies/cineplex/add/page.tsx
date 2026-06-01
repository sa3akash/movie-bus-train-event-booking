"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Film, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddCineplexPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate slug
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cinema/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || undefined,
          logoUrl: logoUrl || undefined,
          website: website || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create chain brand");
      }

      toast.success("Cineplex chain brand created successfully!");
      router.push("/admin/movies/cineplex");
    } catch (error: any) {
      toast.error(error.message || "Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/movies/cineplex")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Add Cineplex Brand
          </h1>
          <p className="text-muted-foreground mt-1">
            Register a new corporate Cineplex Chain brand.
          </p>
        </div>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-indigo-500" />
            Brand Profile
          </CardTitle>
          <CardDescription>
            Provide name, slug, description, and contact info for the brand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Brand Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Star Cineplex"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug / Identifier <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. star-cineplex"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description / Bio</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview about the Cineplex chain..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Logo Image URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website Address</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://star-cineplex.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Customer Support Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support@cineplex.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Hotline Number</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+8802..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-muted">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/movies/cineplex")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? "Creating..." : "Save Brand"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
