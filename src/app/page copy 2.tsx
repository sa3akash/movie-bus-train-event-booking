"use client";

import { seatsLayout } from "@/lib/data";
import React, { useState, useMemo } from "react";

// --- TypeScript Interfaces ---
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

const TIER_META = {
  vip: {
    label: "VIP Lounge",
    price: 25.0,
    colorClass: "bg-purple-600/90 text-purple-100 hover:bg-purple-500 border-purple-500/30",
    activeGlow: "bg-purple-400 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.6)] ring-2 ring-purple-300 scale-105",
  },
  premium: {
    label: "Premium Seat",
    price: 18.5,
    colorClass: "bg-sky-600/90 text-sky-100 hover:bg-sky-500 border-sky-500/30",
    activeGlow: "bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.6)] ring-2 ring-sky-300 scale-105",
  },
  standard: {
    label: "Standard Zone",
    price: 12.0,
    colorClass: "bg-slate-700/90 text-slate-200 hover:bg-slate-600 border-slate-600/50",
    activeGlow: "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] ring-2 ring-amber-300 scale-105",
  },
};

type TierKey = "vip" | "premium" | "standard";

export const DynamicSeatPicker: React.FC<SeatPickerProps> = ({
  layoutData,
  bookedSeats = [],
}) => {
  const [activeTier, setActiveTier] = useState<TierKey>("standard");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const currentTierLayout = layoutData[activeTier];
  const { rows, columns, seats } = currentTierLayout;

  // --- OPTIMIZATION: Cache Booked/Selected Lookups ---
  const bookedMap = useMemo(() => new Set(bookedSeats), [bookedSeats]);
  const selectedMap = useMemo(() => new Set(selectedSeats), [selectedSeats]);

  // --- FIX FOR 30+ ROWS & OFFSETS ---
  // Map exact row letters directly to their real database "y" coordinate instead of array array index.
  const rowLabelsMap = useMemo(() => {
    const map: Record<number, string> = {};
    seats.forEach((seat) => {
      map[seat.y] = seat.row;
    });
    return map;
  }, [seats]);

  // We find the lowest and highest coordinates to handle starting offsets (e.g., if matrix starts at y = 4)
  const minY = useMemo(() => (seats.length ? Math.min(...seats.map((s) => s.y)) : 0), [seats]);
  const maxY = useMemo(() => (seats.length ? Math.max(...seats.map((s) => s.y)) : rows - 1), [seats]);
  
  // Calculate rendering row span dimension boundaries dynamically
  const calculatedRowSpan = maxY - minY + 1;

  const handleSeatClick = (globalSeatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(globalSeatId)
        ? prev.filter((id) => id !== globalSeatId)
        : [...prev, globalSeatId]
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, globalId) => {
      const [tier] = globalId.split("-") as [TierKey, string, string];
      return total + TIER_META[tier].price;
    }, 0);
  };

  return (
    <div className="w-full  mx-auto my-2 rounded-3xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col transition-all">
      
      {/* Top Banner Header */}
      <div className="p-4 md:p-6 text-center bg-gradient-to-b from-slate-950/40 to-transparent border-b border-slate-800/40">
        <h2 className="text-lg md:text-2xl font-black tracking-tight text-slate-100">
          Choose Seating Area
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Absolute coordinate grid rendering for massive venues</p>
      </div>

      {/* Tabs Layout */}
      <div className="px-4 md:px-6 pt-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800/60 w-full shadow-inner">
          {(Object.keys(layoutData) as TierKey[]).map((tierKey) => {
            const isActive = activeTier === tierKey;
            return (
              <button
                key={tierKey}
                onClick={() => setActiveTier(tierKey)}
                className={`py-2 md:py-3 px-1 text-xs font-black rounded-xl transition-all duration-150 flex flex-col items-center justify-center min-w-0 ${
                  isActive
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700/60 scale-[1.01]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                }`}
              >
                <span className="truncate w-full text-center text-[11px] sm:text-xs">{TIER_META[tierKey].label}</span>
                <span className={`text-[10px] font-bold ${isActive ? "text-amber-400" : "text-slate-500"}`}>
                  ${TIER_META[tierKey].price.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Element */}
      <div className="relative w-full flex flex-col items-center mt-6 px-6">
        <div className="w-3/4 h-[3px] bg-gradient-to-r from-transparent via-sky-500 to-transparent rounded-full opacity-60" />
        <span className="text-[9px] font-black tracking-[0.25em] text-sky-500/50 mt-1.5">SCREEN</span>
      </div>

      {/* Map Content Wrapper (Supports Horizontal & Vertical Scroll Safely) */}
      <div className="w-full overflow-auto px-4 md:px-6 py-6 flex justify-start md:justify-center items-center touch-pan-x touch-pan-y scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="flex flex-col gap-2 w-max mx-auto p-4 md:p-6 bg-slate-950/20 border border-slate-800/40 rounded-2xl shadow-inner relative">
          
          {/* Top Row Column Number Indicators */}
          <div 
            className="grid gap-2 mb-1"
            style={{ 
              gridTemplateColumns: `40px repeat(${columns}, 34px) 40px`,
              justifyItems: 'center'
            }}
          >
            <div className="w-10" />
            {Array.from({ length: columns }).map((_, colIndex) => (
              <span key={colIndex} className="text-[10px] font-bold text-slate-600 select-none">
                {colIndex + 1}
              </span>
            ))}
            <div className="w-10" />
          </div>

          {/* Seating Layout Canvas System */}
          <div
            className="grid gap-2 items-center"
            style={{
              gridTemplateColumns: `40px repeat(${columns}, 34px) 40px`,
              // The rows height map scales strictly relative to computed coordinate span bounds
              gridTemplateRows: `repeat(${calculatedRowSpan}, 34px)`,
            }}
          >
            {/* LEFT Row designation lettering axis */}
            {Object.entries(rowLabelsMap).map(([yCoord, letter]) => {
              const gridRowIndex = parseInt(yCoord) - minY + 1;
              return (
                <div
                  key={`left-${yCoord}`}
                  style={{
                    gridColumnStart: 1,
                    gridRowStart: gridRowIndex,
                  }}
                  className="flex items-center justify-center text-[11px] font-black text-slate-500 select-none bg-slate-900/80 h-full w-7 rounded border border-slate-800/50 shadow-sm"
                >
                  {letter}
                </div>
              );
            })}

            {/* RIGHT Row designation lettering axis */}
            {Object.entries(rowLabelsMap).map(([yCoord, letter]) => {
              const gridRowIndex = parseInt(yCoord) - minY + 1;
              return (
                <div
                  key={`right-${yCoord}`}
                  style={{
                    gridColumnStart: columns + 2,
                    gridRowStart: gridRowIndex,
                  }}
                  className="flex items-center justify-center text-[11px] font-black text-slate-500 select-none bg-slate-900/80 h-full w-7 rounded border border-slate-800/50 shadow-sm"
                >
                  {letter}
                </div>
              );
            })}

            {/* Core Individual Interactive Map Elements */}
            {seats.map((seat) => {
              const seatId = `${seat.row}-${seat.seatNumber}`;
              const globalSeatId = `${activeTier}-${seatId}`;

              const isBooked = bookedMap.has(globalSeatId);
              const isSelected = selectedMap.has(globalSeatId);
              
              // Dynamic coordinate formula adapts flawlessly to any custom row index offset bounds (e.g. y = 30)
              const computedGridRow = seat.y - minY + 1;

              return (
                <button
                  key={seatId}
                  disabled={isBooked}
                  onClick={() => handleSeatClick(globalSeatId)}
                  style={{
                    gridColumnStart: seat.x + 2, // Accounting for Left row index column offset
                    gridRowStart: computedGridRow,
                  }}
                  className={`
                    w-8.5 h-8.5 text-[10px] font-black rounded-t-lg rounded-b transition-all duration-75 flex flex-col items-center justify-center relative shadow-sm border will-change-transform
                    ${isBooked
                      ? "bg-slate-800/30 text-slate-600 border-slate-800/50 cursor-not-allowed line-through opacity-25"
                      : isSelected
                        ? TIER_META[activeTier].activeGlow
                        : TIER_META[activeTier].colorClass
                    }
                  `}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking State Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 bg-slate-950/20 border-t border-b border-slate-800/40 py-3 w-full px-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-t bg-slate-700 block border border-slate-600" /> 
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-t bg-amber-400 block border border-amber-300" /> 
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-t bg-slate-800 block opacity-25 line-through" /> 
          <span>Reserved</span>
        </div>
      </div>

      {/* Checkout Footer Bar */}
      <div className="p-4 md:p-6 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center gap-4 w-full mt-auto">
        <div className="flex flex-col text-center sm:text-left w-full sm:min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-black">
            Selected Seats ({selectedSeats.length})
          </span>
          <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
            {selectedSeats.length > 0
              ? selectedSeats.map((id) => id.split("-")[1] + id.split("-")[2]).sort().join(", ")
              : "No selections made"}
          </span>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          <div className="flex flex-col items-end whitespace-nowrap">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Total Bill</span>
            <span className="text-xl font-black text-amber-400 tracking-tight">${calculateTotal().toFixed(2)}</span>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            className={`
              px-5 py-3 rounded-xl font-black text-xs tracking-wider uppercase transition-all w-36 text-center shadow-lg
              ${selectedSeats.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>

    </div>
  );
};

export default function Home() {
  const sampleBooked = ["vip-V-2", "standard-D-2"];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <DynamicSeatPicker layoutData={seatsLayout} bookedSeats={sampleBooked} />
    </div>
  );
}