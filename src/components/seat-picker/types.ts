export type TierKey = "vip" | "premium" | "standard";

export interface Seat {
  row: string;
  seatNumber: number;
  x: number;
  y: number;
}

export interface TierLayout {
  rows: number;
  columns: number;
  seats: Seat[];
}

export interface SectionedSeatsLayout {
  vip: TierLayout;
  premium: TierLayout;
  standard: TierLayout;
}

export interface TierMeta {
  price: number;
  color: string;
  active: string;
}

export interface ViewportState {
  x: number;
  y: number;
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
}

export interface ProcessedSeat {
  id: string;
  col: number;
  row: number;
  num: number;
}
