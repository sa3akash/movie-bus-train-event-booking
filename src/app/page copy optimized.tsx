"use client";

import React, { useState, useMemo, useCallback } from "react";
import { seatsLayout } from "@/lib/data";
import ScreenLavel from "@/components/ScreenLavel";

// ---------------- TYPES ----------------
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

interface SeatPickerProps {
  layoutData: SectionedSeatsLayout;
  bookedSeats?: string[];
}

type TierKey = "vip" | "premium" | "standard";

// ---------------- CONFIG ----------------
const TIER_META = {
  vip: {
    label: "VIP Lounge",
    price: 25,
    colorClass: "bg-purple-600/90 text-purple-100",
    activeGlow:
      "bg-purple-400 text-black shadow-[0_0_10px_rgba(168,85,247,0.7)] scale-105",
  },
  premium: {
    label: "Premium",
    price: 18.5,
    colorClass: "bg-sky-600/90 text-sky-100",
    activeGlow:
      "bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.7)] scale-105",
  },
  standard: {
    label: "Standard",
    price: 12,
    colorClass: "bg-slate-700 text-white",
    activeGlow:
      "bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.7)] scale-105",
  },
};

// ---------------- SEAT ITEM ----------------
const SeatItem = React.memo(
  ({
    seatNumber,
    isBooked,
    isSelected,
    onClick,
    gridColumn,
    gridRow,
    tierMeta,
  }: any) => {
    return (
      <button
        disabled={isBooked}
        onClick={onClick}
        style={{
          gridColumnStart: gridColumn,
          gridRowStart: gridRow,
        }}
        className={`w-8 h-8 text-[10px] font-bold rounded transition-all flex items-center justify-center border
        ${
          isBooked
            ? "bg-slate-800/30 text-slate-600 opacity-25 cursor-not-allowed"
            : isSelected
            ? tierMeta.activeGlow
            : tierMeta.colorClass
        }`}
      >
        {seatNumber}
      </button>
    );
  }
);

// ---------------- MAIN COMPONENT ----------------
export const DynamicSeatPicker: React.FC<SeatPickerProps> = ({
  layoutData,
  bookedSeats = [],
}) => {
  const [activeTier, setActiveTier] = useState<TierKey>("standard");
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  const currentTierLayout = layoutData[activeTier];
  const { columns, seats } = currentTierLayout;

  // ---------------- LOOKUPS ----------------
  const bookedMap = useMemo(() => new Set(bookedSeats), [bookedSeats]);

  // ---------------- GRID BOUNDS ----------------
  const minY = useMemo(
    () => (seats.length ? Math.min(...seats.map((s) => s.y)) : 0),
    [seats]
  );

  const maxY = useMemo(
    () => (seats.length ? Math.max(...seats.map((s) => s.y)) : 0),
    [seats]
  );

  const rowSpan = maxY - minY + 1;

  // ---------------- ROW LABELS ----------------
  const rowLabels = useMemo(() => {
    const map = new Map<number, string>();
    seats.forEach((s) => {
      if (!map.has(s.y)) map.set(s.y, s.row);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  // ---------------- PREPROCESS SEATS ----------------
  const processedSeats = useMemo(() => {
    return seats.map((seat) => {
      const globalId = `${activeTier}-${seat.row}-${seat.seatNumber}`;

      return {
        seatNumber: seat.seatNumber,
        globalId,
        gridColumn: seat.x + 2,
        gridRow: seat.y - minY + 1,
      };
    });
  }, [seats, activeTier, minY]);

  // ---------------- HANDLER ----------------
  const handleSeatClick = useCallback((id: string) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ---------------- TOTAL ----------------
  const total = useMemo(() => {
    let sum = 0;
    selectedSeats.forEach((id) => {
      const tier = id.split("-")[0] as TierKey;
      sum += TIER_META[tier].price;
    });
    return sum;
  }, [selectedSeats]);

  // ---------------- RENDER ----------------
  return (
    <div className="w-full p-4">

      {/* TABS */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(layoutData) as TierKey[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`p-2 rounded font-bold ${
              activeTier === tier ? "bg-slate-700" : "bg-slate-800"
            }`}
          >
            {TIER_META[tier].label}
          </button>
        ))}
      </div>

      {/* SCREEN */}
      {/* <div className="text-center text-xs text-sky-400 mb-2">
        SCREEN
      </div> */}

      {/* SCREEN */}
        <ScreenLavel />

      {/* SCROLL AREA (FIXED SYNC) */}
      <div className="overflow-auto touch-pan-x touch-pan-y py-4">

        <div className="w-max mx-auto">

          {/* COLUMN NUMBERS (NOW SCROLLS WITH SEATS) */}
          <div
            className="grid gap-2 mb-2"
            style={{
              gridTemplateColumns: `40px repeat(${columns}, 32px) 40px`,
            }}
          >
            <div />
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="text-center text-xs text-slate-500 select-none"
              >
                {i + 1}
              </div>
            ))}
            <div />
          </div>

          {/* GRID */}
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `40px repeat(${columns}, 32px) 40px`,
              gridTemplateRows: `repeat(${rowSpan}, 32px)`,
            }}
          >

            {/* LEFT LABELS */}
            {rowLabels.map(([y, row]) => (
              <div
                key={`left-${y}`}
                style={{
                  gridColumnStart: 1,
                  gridRowStart: y - minY + 1,
                }}
                className="flex items-center justify-center text-xs text-slate-400 font-bold"
              >
                {row}
              </div>
            ))}

            {/* RIGHT LABELS */}
            {rowLabels.map(([y, row]) => (
              <div
                key={`right-${y}`}
                style={{
                  gridColumnStart: columns + 2,
                  gridRowStart: y - minY + 1,
                }}
                className="flex items-center justify-center text-xs text-slate-400 font-bold"
              >
                {row}
              </div>
            ))}

            {/* SEATS */}
            {processedSeats.map((seat) => (
              <SeatItem
                key={seat.globalId}
                seatNumber={seat.seatNumber}
                gridColumn={seat.gridColumn}
                gridRow={seat.gridRow}
                isBooked={bookedMap.has(seat.globalId)}
                isSelected={selectedSeats.has(seat.globalId)}
                tierMeta={TIER_META[activeTier]}
                onClick={() => handleSeatClick(seat.globalId)}
              />
            ))}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between mt-4 items-center">
        <div className="text-sm">
          Selected: {selectedSeats.size}
        </div>
        <div className="text-lg font-bold text-amber-400">
          ${total.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

// ---------------- PAGE ----------------
export default function Home() {
  const booked = ["vip-V-2", "standard-D-2", "standard-D-5"];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <DynamicSeatPicker layoutData={seatsLayout} bookedSeats={booked} />
    </div>
  );
}