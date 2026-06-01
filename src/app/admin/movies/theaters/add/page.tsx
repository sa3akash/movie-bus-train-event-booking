"use client";

import React, { useState, useEffect } from "react";
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
import { Building2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CineplexChain {
  id: string;
  name: string;
}

export default function AddTheaterPage() {
  const router = useRouter();
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [loadingChains, setLoadingChains] = useState(true);

  // Form states
  const [cineplexChainId, setCineplexChainId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [state, setState] = useState("Dhaka Division");
  const [country, setCountry] = useState("Bangladesh");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Booleans
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [foodAllowed, setFoodAllowed] = useState(true);

  // Facilities checklist
  const [facilities, setFacilities] = useState<string[]>([]);
  const availableFacilities = ["3D Projections", "Dolby Atmos", "Recliner Seats", "VIP Lounge", "Food Court", "Arcade Zone"];

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/cinema/chains")
      .then((r) => r.json())
      .then((data) => {
        setChains(data);
        setLoadingChains(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load Cineplex chains");
        setLoadingChains(false);
      });
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCity(val);
    setState(val + " Division");
  };

  const handleFacilityToggle = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Please fill in name and slug");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cineplexChainId: cineplexChainId || undefined,
          name,
          slug,
          description: description || undefined,
          address: address || undefined,
          city,
          state,
          country,
          pincode: pincode || undefined,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          logoUrl: logoUrl || undefined,
          contactNumber: contactNumber || undefined,
          parkingAvailable,
          wheelchairAccessible,
          foodAllowed,
          facilities,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create cinema branch");
      }

      toast.success("Cinema branch location created successfully!");
      router.push("/admin/movies/theaters");
    } catch (error: any) {
      toast.error(error.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/movies/theaters")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Add Cinema branch
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure details, location, facilities, and contact parameters for a new multiplex.
          </p>
        </div>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="h-5 w-5 text-indigo-500" />
            Branch Configuration Details
          </CardTitle>
          <CardDescription>
            Expose all properties mapping to the theaters database table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Parent Brand & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cineplex Brand / Chain</Label>
                <select
                  value={cineplexChainId}
                  onChange={(e) => setCineplexChainId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Independent (No Chain)</option>
                  {chains.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Branch / Theater Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Star Cineplex - Bashundhara City"
                  required
                />
              </div>
            </div>

            {/* Slug & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug Identifier <span className="text-red-500">*</span></Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. star-cineplex-bashundhara-city"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNumber">Branch Direct Contact Line</Label>
                <Input
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. hotline/manager contact"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about theater acoustics, ticket counter hours, etc."
                rows={3}
              />
            </div>

            {/* Address & City/State/Country */}
            <div className="grid gap-2">
              <Label htmlFor="address">Full Physical Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Level 5, Bashundhara City Shopping Mall, Panthapath..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <select
                  value={city}
                  onChange={handleCityChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State / Division</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Dhaka Division"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Bangladesh"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pincode">ZIP / Pincode</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="1215"
                />
              </div>
            </div>

            {/* Coordinates & Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="23.7508"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="90.3916"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Custom logo URL</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Phone, Email, Website */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Public Office Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+88017..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Public Office Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="branch@cineplex.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Public Office Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://branch.cineplex.com"
                />
              </div>
            </div>

            {/* Switch / Checks */}
            <div className="pt-2 border-t border-muted">
              <Label className="text-sm font-semibold text-muted-foreground block mb-3">Amenities & Settings</Label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={parkingAvailable}
                    onChange={(e) => setParkingAvailable(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Parking Area Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={wheelchairAccessible}
                    onChange={(e) => setWheelchairAccessible(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Wheelchair Access Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={foodAllowed}
                    onChange={(e) => setFoodAllowed(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Outside Food Allowed</span>
                </label>
              </div>
            </div>

            {/* Facilities / Amenities Checklist */}
            <div className="pt-2 border-t border-muted">
              <Label className="text-sm font-semibold text-muted-foreground block mb-3">Cinema Hall Features</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableFacilities.map((fac) => (
                  <label key={fac} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded-md border hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={facilities.includes(fac)}
                      onChange={() => handleFacilityToggle(fac)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>{fac}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submissions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-muted">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/movies/theaters")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? "Creating..." : "Save Location"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
