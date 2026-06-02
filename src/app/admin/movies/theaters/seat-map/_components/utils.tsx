import { Accessibility, Armchair, Crown, Grid3X3, Monitor, Paintbrush, Sparkles, Star } from 'lucide-react';




// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SeatType {
  id: string;
  name: string;
  capacity: number;
  priceMultiplier: string;
}

export type LayoutMode = "standard" | "center_aisle" | "double_aisle" | "custom";
export type CurveMode = "none" | "slight" | "steep";

export interface GenerationOptions {
  layoutMode: LayoutMode;
  curveMode: CurveMode;
  isTrapezoid: boolean;
  customAisles: string;
  customWalkways: string;
}

export interface ScreenInfo {
  id: string;
  name: string;
  screenType: string;
  totalSeats: number;
  theatreId: string;
  seatLayout: {
    rows: number;
    columns: number;
    seats: { row: string; seatNumber: number; x: number; y: number }[];
  } | null;
}

export interface SeatCell {
  row: string;
  col: number;
  seatTypeId: string | null;
  label: string;
  isAccessible: boolean;
  offsetY?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function rowLabel(index: number): string {
  if (index < 26) return ROW_LETTERS[index];
  return ROW_LETTERS[Math.floor(index / 26) - 1] + ROW_LETTERS[index % 26];
}

export const COLOR_PALETTE = [
  { bg: "bg-indigo-700", border: "border-indigo-400", text: "text-indigo-100" },
  { bg: "bg-violet-700", border: "border-violet-400", text: "text-violet-100" },
  { bg: "bg-rose-700", border: "border-rose-400", text: "text-rose-100" },
  { bg: "bg-amber-700", border: "border-amber-400", text: "text-amber-100" },
  {
    bg: "bg-emerald-700",
    border: "border-emerald-400",
    text: "text-emerald-100",
  },
  { bg: "bg-cyan-700", border: "border-cyan-400", text: "text-cyan-100" },
  { bg: "bg-pink-700", border: "border-pink-400", text: "text-pink-100" },
  { bg: "bg-orange-700", border: "border-orange-400", text: "text-orange-100" },
];

export const TYPE_ICONS = [
  Armchair,
  Crown,
  Star,
  Accessibility,
  Sparkles,
  Monitor,
  Grid3X3,
  Paintbrush,
];

export function buildGrid(
  rows: number,
  cols: number,
  defaultTypeId: string | null,
  options: GenerationOptions
): SeatCell[][] {

  const customAisleSet = new Set(
    options.customAisles?.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
  );
  const customWalkwaySet = new Set(
    options.customWalkways?.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
  );

  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: cols }, (_, ci) => {
      let isAisle = false;
      let isWalkway = false;
      
      // 1. Walkways (Horizontal)
      if (customWalkwaySet.has(ri + 1)) isWalkway = true;

      // 2. Aisles (Vertical)
      if (options.layoutMode === "center_aisle") {
        const mid = Math.floor(cols / 2);
        if (ci === mid || ci === mid - 1) isAisle = true;
      } else if (options.layoutMode === "double_aisle") {
        const third = Math.floor(cols / 3);
        const twoThird = Math.floor((cols * 2) / 3);
        if (ci === third || ci === third - 1 || ci === twoThird || ci === twoThird - 1) isAisle = true;
      } else if (options.layoutMode === "custom") {
        if (customAisleSet.has(ci + 1)) isAisle = true;
      }

      // 3. Trapezoid Pruning (Cinematic Wedge)
      if (options.isTrapezoid) {
        // The closer to the screen (ri=0), the more seats we prune from edges.
        const trapezoidRatio = (rows - ri) / rows; // 1 at front, 0 at back
        // Prune up to 20% of cols from each side at the very front
        const pruneCols = Math.floor(cols * 0.2 * trapezoidRatio);
        if (ci < pruneCols || ci >= cols - pruneCols) isAisle = true;
      }

      // 4. Curve Offset (Stadium)
      let offsetY = 0;
      if (options.curveMode !== "none") {
        const center = (cols - 1) / 2;
        const distFromCenter = Math.abs(ci - center);
        const curveFactor = options.curveMode === "steep" ? 1.5 : 0.5;
        // Parabola: y = a * x^2
        offsetY = Math.pow(distFromCenter, 2) * curveFactor;
      }

      const isEmpty = isAisle || isWalkway;

      return {
        row: rowLabel(ri),
        col: ci + 1,
        seatTypeId: isEmpty ? null : defaultTypeId,
        label: isEmpty ? "" : String(ci + 1),
        isAccessible: false,
        offsetY,
      };
    })
  );
}

export function renumberGrid(grid: SeatCell[][]): SeatCell[][] {
  return grid.map(renumberRow);
}

export function renumberRow(row: SeatCell[]): SeatCell[] {
  let num = 1;
  return row.map((cell) => {
    if (cell.seatTypeId === null) return { ...cell, label: "" };
    return { ...cell, label: String(num++) };
  });
}