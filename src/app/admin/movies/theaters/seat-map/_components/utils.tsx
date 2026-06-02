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

export type LayoutMode = "standard" | "center_aisle" | "double_aisle";

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
  layoutMode: LayoutMode = "standard"
): SeatCell[][] {
  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: cols }, (_, ci) => {
      let isAisle = false;
      if (layoutMode === "center_aisle") {
        // 2 aisle columns in the center
        const mid = Math.floor(cols / 2);
        if (ci === mid || ci === mid - 1) isAisle = true;
      } else if (layoutMode === "double_aisle") {
        // aisles at 1/3 and 2/3 marks (2 cols each)
        const third = Math.floor(cols / 3);
        const twoThird = Math.floor((cols * 2) / 3);
        if (ci === third || ci === third - 1 || ci === twoThird || ci === twoThird - 1) isAisle = true;
      }

      return {
        row: rowLabel(ri),
        col: ci + 1,
        seatTypeId: isAisle ? null : defaultTypeId,
        label: isAisle ? "" : String(ci + 1),
        isAccessible: false,
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