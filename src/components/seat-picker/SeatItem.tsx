import React from "react";
import { TierMeta } from "./types";

interface SeatItemProps {
  id: string;
  seat: number;
  isBooked: boolean;
  isSelected: boolean;
  col: number;
  row: number;
  tierMeta: TierMeta;
  onToggle: (id: string) => void;
}

export const SeatItem = React.memo(
  ({ id, seat, isBooked, isSelected, onToggle, col, row, tierMeta }: SeatItemProps) => (
    <button
      disabled={isBooked}
      onClick={() => onToggle(id)}
      style={{ gridColumnStart: col, gridRowStart: row }}
      className={`w-8 h-8 text-[10px] rounded border transition
      ${
        isBooked
          ? "bg-slate-800/30 opacity-30"
          : isSelected
          ? tierMeta.active
          : tierMeta.color
      }`}
    >
      {seat}
    </button>
  )
);

SeatItem.displayName = "SeatItem";
