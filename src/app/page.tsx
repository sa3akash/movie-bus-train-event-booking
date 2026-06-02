"use client";

import React, { useState, useMemo, useCallback } from "react";
import { seatsLayout } from "@/lib/data";
import { TierKey, SectionedSeatsLayout, ProcessedSeat } from "@/components/seat-picker/types";
import { TIER_META } from "@/components/seat-picker/constants";
import { Screen } from "@/components/seat-picker/Screen";
import { TierTabs } from "@/components/seat-picker/TierTabs";
import { ScrollAreaWithMinimap } from "@/components/seat-picker/ScrollAreaWithMinimap";
import { SeatGrid } from "@/components/seat-picker/SeatGrid";

export default function DynamicSeatPicker({
  layoutData = seatsLayout,
  bookedSeats = [],
}: {
  layoutData?: SectionedSeatsLayout;
  bookedSeats?: string[];
}) {
  const [tier, setTier] = useState<TierKey>("standard");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const layout = layoutData[tier];
  const { seats, columns } = layout;

  const bookedMap = useMemo(() => new Set(bookedSeats), [bookedSeats]);

  const minY = Math.min(...seats.map((s) => s.y));
  const maxY = Math.max(...seats.map((s) => s.y));
  const rowSpan = maxY - minY + 1;

  // ---------------- PREPROCESS ----------------
  const processed = useMemo<ProcessedSeat[]>(() => {
    return seats.map((s) => ({
      id: `${tier}-${s.row}-${s.seatNumber}`,
      col: s.x + 2,
      row: s.y - minY + 1,
      num: s.seatNumber,
      rowLabel: s.row,
    }));
  }, [seats, tier, minY]);

  // ---------------- SELECT ----------------
  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ---------------- TOTAL ----------------
  const total = useMemo(() => {
    let sum = 0;
    selected.forEach((id) => {
      const t = id.split("-")[0] as TierKey;
      sum += TIER_META[t].price;
    });
    return sum;
  }, [selected]);

  return (
    <div className="p-4 text-white">
      {/* TABS */}
      <TierTabs currentTier={tier} onSelectTier={setTier} />

      <Screen />

      {/* SCROLL AREA & MINIMAP ORCHESTRATOR */}
      <ScrollAreaWithMinimap
        processedSeats={processed}
        selectedSeats={selected}
        bookedSeats={bookedMap}
        columns={columns}
      >
        <SeatGrid
          columns={columns}
          rowSpan={rowSpan}
          processedSeats={processed}
          bookedMap={bookedMap}
          selectedSeats={selected}
          tierMeta={TIER_META[tier]}
          onToggleSeat={toggle}
        />
      </ScrollAreaWithMinimap>

      {/* FOOTER */}
      <div className="flex justify-between mt-4">
        <span>{selected.size} seats</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}