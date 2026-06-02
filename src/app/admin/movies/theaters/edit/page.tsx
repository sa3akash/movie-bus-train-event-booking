"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Car,
  Accessibility,
  Utensils,
  Phone,
  Mail,
  Globe,
  Check,
  CheckCircle2,
  Compass,
  FileText,
  Activity,
  Image as ImageIcon,
  Loader2,
  Search,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import "maplibre-gl/dist/maplibre-gl.css";

interface CineplexChain {
  id: string;
  name: string;
}

interface CinemaTheater {
  id: string;
  cineplexChainId: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  facilities: string[] | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  contactNumber: string | null;
  totalScreens: number;
  parkingAvailable: boolean | null;
  wheelchairAccessible: boolean | null;
  foodAllowed: boolean | null;
  isActive: boolean;
}

interface TheaterFormInput {
  cineplexChainId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  contactNumber: string;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  foodAllowed: boolean;
  facilities: string[];
}

const cityCenters: Record<string, [number, number]> = {
  Dhaka: [90.4125, 23.8103],
  Chittagong: [91.8049, 22.3384],
  Sylhet: [91.8687, 24.8949],
  Rajshahi: [88.6011, 24.3745],
  Khulna: [89.5403, 22.8456],
  Barisal: [90.3500, 22.7010],
  Rangpur: [89.2500, 25.7500],
  Mymensingh: [90.4000, 24.7500],
  Sherpur: [90.0167, 25.0167],
  Comilla: [91.1833, 23.4667],
  Jessore: [89.2167, 23.1667],
  "Cox's Bazar": [91.9833, 21.4333],
  Bogra: [89.3730, 24.8481],
};

function MapLibrePicker({
  city,
  latitude,
  longitude,
  onCoordsChange,
}: {
  city: string;
  latitude: string;
  longitude: string;
  onCoordsChange: (lat: string, lng: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const isInitialMount = useRef(true);

  const initialLat = parseFloat(latitude) || cityCenters[city]?.[1] || 23.8103;
  const initialLng = parseFloat(longitude) || cityCenters[city]?.[0] || 90.4125;

  // Handle initialization and dynamic import of maplibre-gl to prevent NextJS SSR crashes
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let mapInstance: any = null;
    let resizeObserverInstance: any = null;

    import("maplibre-gl").then((maplibreglModule) => {
      const maplibregl = maplibreglModule.default;

      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: {
          version: 8,
          sources: {
            "carto-dark": {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
            },
          },
          layers: [
            {
              id: "carto-layer",
              type: "raster",
              source: "carto-dark",
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        },
        center: [initialLng, initialLat],
        zoom: 13,
      });

      mapRef.current = mapInstance;

      // Custom marker layout for glowing pointer pin
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(99, 102, 241, 0.3); animation: ping 1.5s infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #6366f1; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>
        </div>
      `;

      const markerInstance = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([initialLng, initialLat])
        .addTo(mapInstance);

      markerRef.current = markerInstance;

      markerInstance.on("dragend", () => {
        const lngLat = markerInstance.getLngLat();
        onCoordsChange(lngLat.lat.toFixed(6), lngLat.lng.toFixed(6));
      });

      mapInstance.on("click", (e: any) => {
        markerInstance.setLngLat(e.lngLat);
        onCoordsChange(e.lngLat.lat.toFixed(6), e.lngLat.lng.toFixed(6));
      });

      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      // ResizeObserver to resize map canvas smoothly during container transitions
      if (typeof ResizeObserver !== "undefined") {
        resizeObserverInstance = new ResizeObserver(() => {
          mapInstance.resize();
        });
        resizeObserverInstance.observe(mapContainerRef.current!);
      }
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      if (resizeObserverInstance) {
        resizeObserverInstance.disconnect();
      }
    };
  }, []);

  // Update map marker when manual coordinate inputs update
  useEffect(() => {
    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    if (latVal && lngVal && markerRef.current && mapRef.current) {
      const current = markerRef.current.getLngLat();
      if (Math.abs(current.lat - latVal) > 0.0001 || Math.abs(current.lng - lngVal) > 0.0001) {
        markerRef.current.setLngLat([lngVal, latVal]);
        mapRef.current.setCenter([lngVal, latVal]);
      }
    }
  }, [latitude, longitude]);

  // Reset initial mount ref if the component unmounts
  useEffect(() => {
    isInitialMount.current = true;
  }, []);

  // Center on city coordinates when city dropdown selection changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (mapRef.current && markerRef.current) {
      const coords = cityCenters[city] || cityCenters["Dhaka"];
      mapRef.current.flyTo({
        center: coords,
        zoom: 14,
        speed: 1.5,
        curve: 1.2,
      });
      markerRef.current.setLngLat(coords);
      onCoordsChange(coords[1].toFixed(6), coords[0].toFixed(6));
    }
  }, [city]);

  // Geolocate user to actual coordinates
  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: latVal, longitude: lngVal } = position.coords;
          onCoordsChange(latVal.toFixed(6), lngVal.toFixed(6));
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [lngVal, latVal],
              zoom: 16,
              speed: 1.8,
            });
          }
          toast.success("Locked onto current location");
        },
        (error) => {
          toast.error("Failed to acquire location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Flying search using local presets + OSM Nominatim
  const handleLocalSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = mapSearch.trim();
    if (!query) return;

    // 1. First check local presets
    const matchKey = Object.keys(cityCenters).find(
      (k) => k.toLowerCase() === query.toLowerCase() || k.toLowerCase().includes(query.toLowerCase())
    );

    if (matchKey && mapRef.current) {
      const coords = cityCenters[matchKey];
      mapRef.current.flyTo({
        center: coords,
        zoom: 14,
        speed: 1.5,
      });
      if (markerRef.current) {
        markerRef.current.setLngLat(coords);
      }
      onCoordsChange(coords[1].toFixed(6), coords[0].toFixed(6));
      toast.success(`Zoomed to preset: ${matchKey}`);
      return;
    }

    // 2. Fall back to Nominatim Geocoding API for any generic city/state/address search!
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Bangladesh")}&format=json&limit=1`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (data && data.length > 0) {
        const item = data[0];
        const latVal = parseFloat(item.lat);
        const lngVal = parseFloat(item.lon);
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lngVal, latVal],
            zoom: 14,
            speed: 1.5,
          });
          if (markerRef.current) {
            markerRef.current.setLngLat([lngVal, latVal]);
          }
          onCoordsChange(latVal.toFixed(6), lngVal.toFixed(6));
          toast.success(`Zoomed to: ${item.display_name.split(",")[0]}`);
        }
      } else {
        // Try without country restriction just in case
        const response2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        );
        const data2 = await response2.json();
        if (data2 && data2.length > 0) {
          const item = data2[0];
          const latVal = parseFloat(item.lat);
          const lngVal = parseFloat(item.lon);
          
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [lngVal, latVal],
              zoom: 14,
              speed: 1.5,
            });
            if (markerRef.current) {
              markerRef.current.setLngLat([lngVal, latVal]);
            }
            onCoordsChange(latVal.toFixed(6), lngVal.toFixed(6));
            toast.success(`Zoomed to: ${item.display_name.split(",")[0]}`);
          }
        } else {
          toast.error(`Location "${query}" not found.`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Geocoding service unavailable.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Floating control search and geolocator hud */}
      <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2 max-w-[90%] pointer-events-auto">
        <form onSubmit={handleLocalSearchSubmit} className="flex bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-lg backdrop-blur-xs w-64 items-center gap-1">
          <Search className="h-4 w-4 text-slate-400 pl-1.5 shrink-0" />
          <input
            type="text"
            placeholder="Search state/city (e.g. Sherpur)..."
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            className="w-full border-none outline-hidden bg-transparent text-xs text-white placeholder-slate-500 py-1"
          />
          <Button type="submit" disabled={searching} size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">
            {searching ? "..." : "Go"}
          </Button>
        </form>

        <Button
          type="button"
          onClick={handleGeolocate}
          className="bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg h-9 px-3 gap-1.5 shadow-lg backdrop-blur-xs font-semibold text-xs shrink-0"
        >
          <Navigation className="h-3.5 w-3.5 fill-current text-rose-500 animate-pulse" /> Find Location
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 select-none pointer-events-none shadow-lg backdrop-blur-xs flex flex-col gap-0.5 min-w-[150px]">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">GPS locking status</div>
        <div className="text-emerald-400">LAT: {initialLat.toFixed(6)}</div>
        <div className="text-emerald-400">LNG: {initialLng.toFixed(6)}</div>
      </div>
    </div>
  );
}

function EditTheaterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [loadingChains, setLoadingChains] = useState(true);
  const [loadingTheater, setLoadingTheater] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableFacilities = [
    "3D Projections",
    "Dolby Atmos",
    "Recliner Seats",
    "VIP Lounge",
    "Food Court",
    "Arcade Zone"
  ];
  
  const cities = [
    "Dhaka",
    "Chittagong",
    "Sylhet",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Rangpur",
    "Mymensingh",
    "Sherpur",
    "Comilla",
    "Jessore",
    "Cox's Bazar",
    "Bogra"
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm<TheaterFormInput>({
    defaultValues: {
      cineplexChainId: "",
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      pincode: "",
      latitude: "23.7508",
      longitude: "90.3916",
      phone: "",
      email: "",
      website: "",
      logoUrl: "",
      contactNumber: "",
      parkingAvailable: false,
      wheelchairAccessible: false,
      foodAllowed: true,
      facilities: [],
    },
  });

  const watchCity = watch("city");
  const watchLatitude = watch("latitude");
  const watchLongitude = watch("longitude");
  const watchName = watch("name");
  const watchFormValues = watch();

  // Load Chains and Theater Data
  useEffect(() => {
    if (!editId) {
      toast.error("No Theater ID specified for editing.");
      router.push("/admin/movies/theaters");
      return;
    }

    const loadData = async () => {
      try {
        const chainsRes = await fetch("/api/cinema/chains?limit=1000").then((r) => r.json());
        setChains(chainsRes.items || []);
        setLoadingChains(false);

        // Fetch location listing to find matching editing branch
        const theatersRes = await fetch("/api/cinema/admin-theaters?limit=1000").then((r) => r.json());
        const theater = (theatersRes.items || []).find((t: CinemaTheater) => t.id === editId);

        if (theater) {
          setValue("cineplexChainId", theater.cineplexChainId || "");
          setValue("name", theater.name);
          setValue("slug", theater.slug);
          setValue("description", theater.description || "");
          setValue("address", theater.address || "");
          setValue("city", theater.city);
          setValue("state", theater.state || (theater.city + " Division"));
          setValue("country", theater.country || "Bangladesh");
          setValue("pincode", theater.pincode || "");
          setValue("latitude", theater.latitude || "");
          setValue("longitude", theater.longitude || "");
          setValue("phone", theater.phone || "");
          setValue("email", theater.email || "");
          setValue("website", theater.website || "");
          setValue("logoUrl", theater.logoUrl || "");
          setValue("contactNumber", theater.contactNumber || "");
          setValue("parkingAvailable", !!theater.parkingAvailable);
          setValue("wheelchairAccessible", !!theater.wheelchairAccessible);
          setValue("foodAllowed", !!theater.foodAllowed);
          setValue("facilities", theater.facilities || []);
        } else {
          toast.error("Cinema Branch Location details not found in database.");
          router.push("/admin/movies/theaters");
        }
        setLoadingTheater(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load details for editing branch");
        setLoadingTheater(false);
      }
    };

    loadData();
  }, [editId, setValue, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    setValue(
      "slug",
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleFacilityToggle = (facility: string, currentFacilities: string[]) => {
    const next = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    setValue("facilities", next);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "slug", "cineplexChainId", "contactNumber"]);
    } else if (step === 2) {
      isValid = await trigger(["address", "city", "state", "country", "pincode", "latitude", "longitude"]);
    } else if (step === 3) {
      isValid = await trigger(["phone", "email", "website", "logoUrl", "facilities", "parkingAvailable", "wheelchairAccessible", "foodAllowed"]);
    }

    if (isValid) {
      setStep((s) => s + 1);
    } else {
      toast.error("Please fill all required fields correctly before moving to the next stage.");
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onFormSubmit = async (data: TheaterFormInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cinema/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cineplexChainId: data.cineplexChainId || null,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          address: data.address || null,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          logoUrl: data.logoUrl || null,
          contactNumber: data.contactNumber || null,
          parkingAvailable: data.parkingAvailable,
          wheelchairAccessible: data.wheelchairAccessible,
          foodAllowed: data.foodAllowed,
          facilities: data.facilities,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update cinema branch");
      }

      toast.success("Multiplex branch details updated successfully!");
      router.push("/admin/movies/theaters");
    } catch (error: any) {
      toast.error(error.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Identity", desc: "Name & Chain Brand", icon: Building2 },
    { num: 2, title: "GPS & Address", desc: "Location Coordinates", icon: MapPin },
    { num: 3, title: "Amenities & Contacts", desc: "Phone, Web & Tech", icon: Activity },
    { num: 4, title: "Confirmation", desc: "Review Parameters", icon: CheckCircle2 },
  ];

  if (loadingChains || loadingTheater) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <span className="text-muted-foreground font-semibold text-sm animate-pulse">Loading location configuration...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-background overflow-hidden relative">
      {/* Left Pane (Form Area) */}
      <div className={`transition-all duration-700 ease-in-out flex flex-col justify-between overflow-y-auto max-h-screen bg-background ${
        step === 2 
          ? "w-full md:w-1/2 border-r border-muted" 
          : "w-full md:w-full"
      }`}>
        <div className={`transition-all duration-700 ease-in-out p-6 md:p-10 space-y-6 ${
          step === 2 ? "w-full" : "max-w-2xl mx-auto w-full"
        }`}>
          {/* Top Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-muted hover:bg-muted/40 shadow-xs shrink-0"
              onClick={() => router.push("/admin/movies/theaters")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Multiplex Branch
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Modify details, coordinates, facilities, and contact parameters.
              </p>
            </div>
          </div>

          {/* Completion Progress HUD */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Configuration progress</span>
              <span className="text-indigo-400 font-semibold">{step * 25}% Complete</span>
            </div>
            <div className="w-full bg-muted/45 h-1.5 rounded-full overflow-hidden border border-muted/20">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>

          {/* Stepper Indicators */}
          <div className="grid grid-cols-4 gap-2 bg-muted/15 p-2 rounded-xl border border-muted/50">
            {stepsList.map((s) => {
              const StepIcon = s.icon;
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num < step) setStep(s.num);
                  }}
                  className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                    isActive
                      ? "bg-background border-indigo-600 shadow-xs"
                      : isCompleted
                      ? "bg-indigo-50/5 border-indigo-500/20 cursor-pointer hover:bg-indigo-50/10"
                      : "border-transparent opacity-50 pointer-events-none"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : <StepIcon className="h-3.5 w-3.5" />}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 text-center truncate w-full ${isActive ? "text-indigo-600" : ""}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actual Form Fields */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold text-foreground">Cineplex Brand / Chain</Label>
                    <select
                      {...register("cineplexChainId")}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Independent (No Chain)</option>
                      {chains.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs font-bold text-foreground">
                      Branch Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Theater Name is required" })}
                      onChange={handleNameChange}
                      placeholder="e.g. Star Cineplex - Bashundhara City"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                    {errors.name && <span className="text-rose-500 text-xs">{errors.name.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="slug" className="text-xs font-bold text-foreground">
                      Slug Identifier <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      {...register("slug", { required: "Slug is required" })}
                      placeholder="e.g. star-cineplex-bashundhara-city"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                    {errors.slug && <span className="text-rose-500 text-xs">{errors.slug.message}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactNumber" className="text-xs font-bold text-foreground">
                      Branch Direct Hotline
                    </Label>
                    <Input
                      id="contactNumber"
                      {...register("contactNumber")}
                      placeholder="e.g. +88029966... / manager hotline"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-xs font-bold text-foreground">
                    Description / Profile
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Provide a detailed write-up about the branch capacity, screen specs, lobby size, parking etc..."
                    rows={4}
                    className="rounded-lg bg-background resize-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: GPS & LOCATION */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-xs font-bold text-foreground">
                    Full Physical Address
                  </Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Level 5, Bashundhara City Shopping Mall, Panthapath..."
                    className="rounded-lg bg-background text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold text-foreground">City</Label>
                    <select
                      {...register("city", {
                        required: "City is required",
                        onChange: (e) => {
                          setValue("state", e.target.value + " Division");
                        }
                      })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state" className="text-xs font-bold text-foreground">
                      State / Division
                    </Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="Dhaka Division"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country" className="text-xs font-bold text-foreground">
                      Country
                    </Label>
                    <Input
                      id="country"
                      {...register("country", { required: "Country is required" })}
                      placeholder="Bangladesh"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pincode" className="text-xs font-bold text-foreground">
                      ZIP / Pincode
                    </Label>
                    <Input
                      id="pincode"
                      {...register("pincode")}
                      placeholder="1215"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border border-muted/50 rounded-xl space-y-3">
                  <Label className="text-xs font-bold text-foreground block">GPS Parameters</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1">
                      <Label htmlFor="latitude" className="text-[10px] uppercase font-semibold text-muted-foreground">Latitude</Label>
                      <Input
                        id="latitude"
                        {...register("latitude")}
                        placeholder="e.g. 23.7508"
                        className="h-9 rounded-lg font-mono text-xs bg-background"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="longitude" className="text-[10px] uppercase font-semibold text-muted-foreground">Longitude</Label>
                      <Input
                        id="longitude"
                        {...register("longitude")}
                        placeholder="e.g. 90.3916"
                        className="h-9 rounded-lg font-mono text-xs bg-background"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Interact directly with the map pane on the right side. You can click anywhere or drag the custom marker to auto-populate coordinates.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT & AMENITIES */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="p-3 bg-muted/25 border border-muted/50 rounded-xl space-y-3">
                  <Label className="text-xs font-bold text-foreground block">Branch Amenities Checklist</Label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        {...register("parkingAvailable")}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Car className="h-3.5 w-3.5 text-indigo-500" /> Parking Available
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        {...register("wheelchairAccessible")}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Accessibility className="h-3.5 w-3.5 text-indigo-500" /> Wheelchair Access
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        {...register("foodAllowed")}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Utensils className="h-3.5 w-3.5 text-indigo-500" /> Food Allowed
                      </span>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-muted/25 border border-muted/50 rounded-xl space-y-3">
                  <Label className="text-xs font-bold text-foreground block">Advanced Screen Tech Features</Label>
                  <Controller
                    name="facilities"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableFacilities.map((fac) => {
                          const isChecked = field.value.includes(fac);
                          return (
                            <div
                              key={fac}
                              onClick={() => handleFacilityToggle(fac, field.value)}
                              className={`flex items-center gap-2 cursor-pointer text-[11px] p-2 rounded-lg border transition-all ${
                                isChecked
                                  ? "bg-indigo-50/10 border-indigo-500/40 text-indigo-400 font-semibold"
                                  : "bg-background border-muted hover:bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                  isChecked ? "bg-indigo-600 border-indigo-500 text-white" : "border-muted-foreground/30"
                                }`}
                              >
                                {isChecked && <Check className="h-2.5 w-2.5" />}
                              </div>
                              <span>{fac}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-indigo-500" /> Office Phone
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+88017..."
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-indigo-500" /> Office Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="branch@cineplex.com"
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="website" className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" /> Website URL
                    </Label>
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://..."
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="logoUrl" className="text-xs font-bold text-foreground flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-indigo-500" /> logo Image URL
                    </Label>
                    <Input
                      id="logoUrl"
                      {...register("logoUrl")}
                      placeholder="https://..."
                      className="rounded-lg bg-background text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRMATION */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-400 font-bold">Ready to commit updates</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Review Coordinates, Brand layout, and technical systems checklists below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" /> General Identity
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-bold text-foreground truncate max-w-[120px]">{watchFormValues.name}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Slug:</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">{watchFormValues.slug}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Chain:</span>
                        <span className="truncate max-w-[120px]">
                          {chains.find((c) => c.id === watchFormValues.cineplexChainId)?.name || "Independent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Geographic Info
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="truncate max-w-[120px]">{watchFormValues.address || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">City:</span>
                        <span>{watchFormValues.city}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-mono text-indigo-400">{watchLatitude}, {watchLongitude}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
                      <Car className="h-3.5 w-3.5 text-indigo-500" /> Features
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {watchFormValues.parkingAvailable && <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">Parking</Badge>}
                        {watchFormValues.wheelchairAccessible && <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">Wheelchair</Badge>}
                        {watchFormValues.foodAllowed && <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">Food</Badge>}
                      </div>
                      {watchFormValues.facilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {watchFormValues.facilities.map((f) => (
                            <Badge key={f} variant="outline" className="text-[8px] px-1 font-normal py-0">{f}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">None configured</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" /> Contacts
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{watchFormValues.phone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="truncate max-w-[100px]">{watchFormValues.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Wizard Footer Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-muted/80">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="h-9 gap-1 rounded-lg border-muted text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/admin/movies/theaters")}
                  className="h-9 text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 gap-1 rounded-lg shadow-xs text-xs"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-9 gap-1.5 rounded-lg shadow-md text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving Updates...
                      </>
                    ) : (
                      <>
                        <Check className="h-4.5 w-4.5" /> Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Pane (A massive full-pane MapLibre GPS radar picker) */}
      <div className={`transition-all duration-700 ease-in-out h-[450px] md:h-screen relative bg-slate-950 overflow-hidden ${
        step === 2 
          ? "w-full md:w-1/2 opacity-100 pointer-events-auto" 
          : "w-0 opacity-0 pointer-events-none"
      }`}>
        <MapLibrePicker
          city={watchCity}
          latitude={watchLatitude}
          longitude={watchLongitude}
          onCoordsChange={(lat, lng) => {
            setValue("latitude", lat);
            setValue("longitude", lng);
          }}
        />
      </div>
    </div>
  );
}

export default function EditTheaterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 gap-4 min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <span className="text-muted-foreground font-semibold text-sm animate-pulse">Loading location editor...</span>
      </div>
    }>
      <EditTheaterContent />
    </Suspense>
  );
}
