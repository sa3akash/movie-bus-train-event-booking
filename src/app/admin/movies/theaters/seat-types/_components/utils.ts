import {
  Armchair,
  Crown,
  Star,
  Accessibility,
  Sparkles,
  Layers,
  Users,
} from "lucide-react";
import React from "react";

export interface SeatType {
  id: string;
  name: string;
  capacity: number;
  priceMultiplier: string;
  price: number;
  color: string;
  currency: string;
  theaterId: string;
}

export const PRESET_STYLES: {
  keyword: string;
  gradient: string;
  icon: React.ComponentType<any>;
  badge: string;
  ring: string;
}[] = [
  {
    keyword: "standard",
    gradient: "from-slate-700 to-slate-800",
    icon: Armchair,
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    ring: "ring-slate-400",
  },
  {
    keyword: "premium",
    gradient: "from-indigo-600 to-violet-700",
    icon: Star,
    badge: "bg-indigo-50 text-indigo-700 border-indigo-300",
    ring: "ring-indigo-400",
  },
  {
    keyword: "vip",
    gradient: "from-amber-500 to-orange-600",
    icon: Crown,
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    ring: "ring-amber-400",
  },
  {
    keyword: "recliner",
    gradient: "from-violet-600 to-purple-700",
    icon: Sparkles,
    badge: "bg-violet-50 text-violet-700 border-violet-300",
    ring: "ring-violet-400",
  },
  {
    keyword: "wheelchair",
    gradient: "from-emerald-600 to-teal-700",
    icon: Accessibility,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
    ring: "ring-emerald-400",
  },
  {
    keyword: "couple",
    gradient: "from-rose-500 to-pink-600",
    icon: Users,
    badge: "bg-rose-50 text-rose-700 border-rose-300",
    ring: "ring-rose-400",
  },
];

export const FALLBACK_GRADIENTS = [
  "from-cyan-600 to-blue-700",
  "from-fuchsia-600 to-pink-700",
  "from-lime-600 to-green-700",
  "from-orange-600 to-red-700",
];

export function getPreset(name: string, index: number) {
  const lower = name.toLowerCase();
  const match = PRESET_STYLES.find(p => lower.includes(p.keyword));
  if (match) return match;
  return {
    keyword: lower,
    gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
    icon: Layers,
    badge: "bg-blue-50 text-blue-700 border-blue-300",
    ring: "ring-blue-400",
  };
}
