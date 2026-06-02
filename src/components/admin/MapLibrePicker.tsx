"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, Navigation } from "lucide-react";
import { toast } from "sonner";
import "maplibre-gl/dist/maplibre-gl.css";

export const cityCenters: Record<string, [number, number]> = {
  // Dhaka Division
  Dhaka: [90.4125, 23.8103],
  Gazipur: [90.4203, 24.0023],
  Narsingdi: [90.7177, 23.9208],
  Manikganj: [90.0047, 23.8617],
  Munshiganj: [90.5305, 23.5422],
  Narayanganj: [90.5000, 23.6238],
  Tangail: [89.9167, 24.2513],
  Kishoreganj: [90.7749, 24.4449],
  Faridpur: [89.8406, 23.6070],
  Gopalganj: [89.8266, 23.0050],
  Rajbari: [89.6445, 23.7574],
  Madaripur: [90.2076, 23.1641],
  Shariatpur: [90.3490, 23.2423],

  // Chattogram Division
  Chittagong: [91.8049, 22.3384],
  CoxsBazar: [91.9833, 21.4272],
  Cumilla: [91.1833, 23.4682],
  Brahmanbaria: [91.1119, 23.9571],
  Chandpur: [90.6713, 23.2333],
  Feni: [91.3966, 23.0159],
  Lakshmipur: [90.8310, 22.9443],
  Noakhali: [91.0995, 22.8245],
  Khagrachari: [91.9640, 23.1193],
  Rangamati: [92.2031, 22.7324],
  Bandarban: [92.2230, 22.1953],

  // Rajshahi Division
  Rajshahi: [88.6011, 24.3745],
  Bogura: [89.3730, 24.8481],
  Joypurhat: [89.0561, 25.0947],
  Naogaon: [88.9318, 24.7936],
  Natore: [89.0187, 24.4206],
  Chapainawabganj: [88.2912, 24.5965],
  Pabna: [89.2391, 24.0064],
  Sirajganj: [89.7080, 24.4534],

  // Khulna Division
  Khulna: [89.5403, 22.8456],
  Bagerhat: [89.7754, 22.6516],
  Satkhira: [89.0705, 22.3155],
  Jessore: [89.2167, 23.1667],
  Jhenaidah: [89.1553, 23.5440],
  Magura: [89.4194, 23.4870],
  Narail: [89.5000, 23.1725],
  Kushtia: [89.1200, 23.9013],
  Meherpur: [88.6344, 23.7622],
  Chuadanga: [88.8498, 23.6402],

  // Barishal Division
  Barisal: [90.3490, 22.7010],
  Patuakhali: [90.3535, 22.3596],
  Bhola: [90.6440, 22.6859],
  Pirojpur: [89.9750, 22.5797],
  Barguna: [90.1152, 22.0953],
  Jhalokathi: [90.1981, 22.6406],

  // Sylhet Division
  Sylhet: [91.8687, 24.8949],
  Moulvibazar: [91.7700, 24.4829],
  Habiganj: [91.4155, 24.3740],
  Sunamganj: [91.3950, 25.0658],

  // Rangpur Division
  Rangpur: [89.2500, 25.7460],
  Dinajpur: [88.6378, 25.6217],
  Kurigram: [89.6362, 25.8054],
  Lalmonirhat: [89.4450, 25.9923],
  Nilphamari: [88.8560, 25.9310],
  Panchagarh: [88.5542, 26.3411],
  Thakurgaon: [88.4675, 26.0337],
  Gaibandha: [89.5280, 25.3288],

  // Mymensingh Division
  Mymensingh: [90.3982, 24.7471],
  Jamalpur: [89.9481, 24.9375],
  Sherpur: [90.0167, 25.0207],
  Netrokona: [90.7270, 24.8835],
};

export const divisionCities: Record<string, string[]> = {
  "Dhaka Division": ["Dhaka", "Gazipur", "Narsingdi", "Manikganj", "Munshiganj", "Narayanganj", "Tangail", "Kishoreganj", "Faridpur", "Gopalganj", "Rajbari", "Madaripur", "Shariatpur"],
  "Chattogram Division": ["Chittagong", "CoxsBazar", "Cumilla", "Brahmanbaria", "Chandpur", "Feni", "Lakshmipur", "Noakhali", "Khagrachari", "Rangamati", "Bandarban"],
  "Rajshahi Division": ["Rajshahi", "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj"],
  "Khulna Division": ["Khulna", "Bagerhat", "Satkhira", "Jessore", "Jhenaidah", "Magura", "Narail", "Kushtia", "Meherpur", "Chuadanga"],
  "Barishal Division": ["Barisal", "Patuakhali", "Bhola", "Pirojpur", "Barguna", "Jhalokathi"],
  "Sylhet Division": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  "Rangpur Division": ["Rangpur", "Dinajpur", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon", "Gaibandha"],
  "Mymensingh Division": ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"],
};

export function getDivisionForCity(city: string): string {
  for (const [division, cities] of Object.entries(divisionCities)) {
    if (cities.includes(city)) return division;
  }
  return "";
}

export function MapLibrePicker({
  city,
  latitude,
  longitude,
  onCoordsChange,
  onCityChange,
  onReverseGeocode,
}: {
  city: string;
  latitude: string;
  longitude: string;
  onCoordsChange: (lat: string, lng: string) => void;
  onCityChange?: (city: string) => void;
  onReverseGeocode?: (data: { address?: string; city?: string; pincode?: string }) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isInitialMount = useRef(true);

  const filteredCities = mapSearch.trim()
    ? Object.keys(cityCenters).filter((c) =>
        c.toLowerCase().includes(mapSearch.toLowerCase())
      )
    : [];

  const zoomToPreset = (matchKey: string) => {
    if (mapRef.current) {
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
      if (onCityChange) onCityChange(matchKey);
      toast.success(`Zoomed to preset: ${matchKey}`);
      setMapSearch(matchKey);
      setShowSuggestions(false);
    }
  };

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
        style: "https://tiles.openfreemap.org/styles/positron",
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

      const markerInstance = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([initialLng, initialLat])
        .addTo(mapInstance);

      markerRef.current = markerInstance;

      const triggerReverseGeocode = async (lat: number, lng: number) => {
        if (!onReverseGeocode) return;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const possibleCity = addr.city || addr.town || addr.county || addr.state_district;
            onReverseGeocode({
              address: data.display_name,
              city: possibleCity,
              pincode: addr.postcode,
            });
            toast.success("Location auto-detected!");
          }
        } catch (err) {
          console.error(err);
        }
      };

      markerInstance.on("dragend", () => {
        const lngLat = markerInstance.getLngLat();
        onCoordsChange(lngLat.lat.toFixed(6), lngLat.lng.toFixed(6));
        triggerReverseGeocode(lngLat.lat, lngLat.lng);
      });

      mapInstance.on("click", (e: any) => {
        markerInstance.setLngLat(e.lngLat);
        onCoordsChange(e.lngLat.lat.toFixed(6), e.lngLat.lng.toFixed(6));
        triggerReverseGeocode(e.lngLat.lat, e.lngLat.lng);
      });

      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );

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
  }, []); // Empty dependency array, safe because initial coordinates are captured, and subsequent updates handled by the other useEffect

  // Update map marker when manual coordinate inputs update
  useEffect(() => {
    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    if (latVal && lngVal && markerRef.current && mapRef.current) {
      const current = markerRef.current.getLngLat();
      if (
        Math.abs(current.lat - latVal) > 0.0001 ||
        Math.abs(current.lng - lngVal) > 0.0001
      ) {
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
  }, [city, onCoordsChange]);

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
        },
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
      (k) =>
        k.toLowerCase() === query.toLowerCase() ||
        k.toLowerCase().includes(query.toLowerCase()),
    );

    if (matchKey) {
      zoomToPreset(matchKey);
      return;
    }

    // 2. Fall back to Nominatim Geocoding API for any generic city/state/address search!
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Bangladesh")}&format=json&limit=1`,
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
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
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
      <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2 max-w-[90%] pointer-events-auto items-start">
        <div className="relative flex flex-col">
          <form
            onSubmit={handleLocalSearchSubmit}
            className="flex bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-lg backdrop-blur-xs w-64 items-center gap-1"
          >
            <Search className="h-4 w-4 text-slate-400 pl-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search state/city (e.g. Sherpur)..."
              value={mapSearch}
              onChange={(e) => {
                setMapSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full border-none outline-hidden bg-transparent text-xs text-white placeholder-slate-500 py-1"
            />
            <Button
              type="submit"
              disabled={searching}
              size="sm"
              variant="ghost"
              className="h-6 px-1.5 text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300"
            >
              {searching ? "..." : "Go"}
            </Button>
          </form>

          {showSuggestions && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 backdrop-blur-md">
              {filteredCities.map((c) => (
                <div
                  key={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    zoomToPreset(c);
                  }}
                  className="px-3 py-2 text-xs text-slate-200 hover:bg-indigo-500/20 hover:text-white cursor-pointer transition-colors border-b border-slate-800/50 last:border-0"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleGeolocate}
          className="bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg h-9 px-3 gap-1.5 shadow-lg backdrop-blur-xs font-semibold text-xs shrink-0"
        >
          <Navigation className="h-3.5 w-3.5 fill-current text-rose-500 animate-pulse" />{" "}
          Find Location
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 select-none pointer-events-none shadow-lg backdrop-blur-xs flex flex-col gap-0.5 min-w-[150px]">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
          GPS locking status
        </div>
        <div className="text-emerald-400">LAT: {initialLat.toFixed(6)}</div>
        <div className="text-emerald-400">LNG: {initialLng.toFixed(6)}</div>
      </div>
    </div>
  );
}
