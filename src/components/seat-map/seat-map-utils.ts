import {
  Armchair,
  Crown,
  Star,
  Accessibility,
  Sparkles,
  Monitor,
  Grid3X3,
  Paintbrush,
} from "lucide-react";
import type { SeatCell, ColorMap, GridStats, SeatType } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Row label helpers
// ─────────────────────────────────────────────────────────────────────────────

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function rowLabel(index: number): string {
  if (index < 26) return ROW_LETTERS[index];
  return ROW_LETTERS[Math.floor(index / 26) - 1] + ROW_LETTERS[index % 26];
}

// ─────────────────────────────────────────────────────────────────────────────
// Color palette (maps seat types in order)
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR_PALETTE = [
  { bg: "bg-indigo-700", border: "border-indigo-400", text: "text-indigo-100" },
  { bg: "bg-violet-700", border: "border-violet-400", text: "text-violet-100" },
  { bg: "bg-rose-700",   border: "border-rose-400",   text: "text-rose-100"   },
  { bg: "bg-amber-700",  border: "border-amber-400",  text: "text-amber-100"  },
  { bg: "bg-emerald-700",border: "border-emerald-400",text: "text-emerald-100"},
  { bg: "bg-cyan-700",   border: "border-cyan-400",   text: "text-cyan-100"   },
  { bg: "bg-pink-700",   border: "border-pink-400",   text: "text-pink-100"   },
  { bg: "bg-orange-700", border: "border-orange-400", text: "text-orange-100" },
];

/** Hex versions of the palette for canvas / non-Tailwind contexts */
export const HEX_PALETTE = [
  "#4338ca", // indigo-700
  "#6d28d9", // violet-700
  "#be123c", // rose-700
  "#b45309", // amber-700
  "#047857", // emerald-700
  "#0e7490", // cyan-700
  "#be185d", // pink-700
  "#c2410c", // orange-700
];

export const TYPE_ICONS = [
  Armchair, Crown, Star, Accessibility, Sparkles, Monitor, Grid3X3, Paintbrush,
];

// ─────────────────────────────────────────────────────────────────────────────
// Build a fresh empty grid
// ─────────────────────────────────────────────────────────────────────────────

export function buildGrid(
  rows: number,
  cols: number,
  defaultTypeId: string | null,
): SeatCell[][] {
  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: cols }, (_, ci) => ({
      row: rowLabel(ri),
      col: ci + 1,
      seatTypeId: defaultTypeId,
      label: String(ci + 1),
      isAccessible: false,
    }))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-number seat labels per row, skipping aisles
// ─────────────────────────────────────────────────────────────────────────────

export function renumberGrid(grid: SeatCell[][]): SeatCell[][] {
  return grid.map(row => {
    let num = 1;
    return row.map(cell => {
      if (cell.seatTypeId === null) return { ...cell, label: "" };
      return { ...cell, label: String(num++) };
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a ColorMap from a list of seat types
// ─────────────────────────────────────────────────────────────────────────────

export function buildColorMap(types: SeatType[]): ColorMap {
  const cm: ColorMap = {};
  types.forEach((t, i) => {
    cm[t.id] = {
      ...COLOR_PALETTE[i % COLOR_PALETTE.length],
      label: t.name,
      icon: TYPE_ICONS[i % TYPE_ICONS.length],
    };
  });
  return cm;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute grid stats
// ─────────────────────────────────────────────────────────────────────────────

export function computeStats(grid: SeatCell[][]): GridStats {
  const counts: Record<string, number> = {};
  let aisles = 0;
  let accessible = 0;
  grid.forEach(row =>
    row.forEach(cell => {
      if (cell.seatTypeId === null) { aisles++; return; }
      counts[cell.seatTypeId] = (counts[cell.seatTypeId] || 0) + 1;
      if (cell.isAccessible) accessible++;
    })
  );
  return {
    counts,
    aisles,
    accessible,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve Tailwind cell class string from a SeatCell
// ─────────────────────────────────────────────────────────────────────────────

export function getCellClasses(
  cell: SeatCell,
  colorMap: ColorMap,
  ringOffset = "ring-offset-slate-950",
): string {
  if (cell.seatTypeId === null) {
    return "bg-transparent border-transparent opacity-30 hover:opacity-60 hover:bg-slate-800/30";
  }
  const style = colorMap[cell.seatTypeId];
  if (!style) return "bg-slate-700 border-slate-500 text-slate-200";
  const ring = cell.isAccessible
    ? `ring-2 ring-emerald-400 ring-offset-1 ${ringOffset}`
    : "";
  return `${style.bg} ${style.border} ${style.text} ${ring}`;
}
