// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the seat-map component system
// ─────────────────────────────────────────────────────────────────────────────

export interface SeatType {
  id: string;
  name: string;
  capacity: number;
  priceMultiplier: string;
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
  /** Letter label for the row, e.g. "A", "B" */
  row: string;
  /** 1-based column index */
  col: number;
  /** null = aisle / blocked cell */
  seatTypeId: string | null;
  /** Display seat number within the row */
  label: string;
  isAccessible: boolean;
}

export interface ColorEntry {
  bg: string;
  border: string;
  text: string;
  label: string;
  icon: React.ComponentType<any>;
}

export type ColorMap = Record<string, ColorEntry>;

export interface GridStats {
  counts: Record<string, number>;
  aisles: number;
  accessible: number;
  total: number;
}
