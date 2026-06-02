"use client";

import React from "react";
import type { SeatType, ColorMap, GridStats } from "./types";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface SeatLegendProps {
  seatTypes: SeatType[];
  colorMap: ColorMap;
  stats: GridStats;
  isGenerated: boolean;
  open: boolean;
  onToggle: () => void;
}

export function SeatLegend({
  seatTypes,
  colorMap,
  stats,
  isGenerated,
  open,
  onToggle,
}: SeatLegendProps) {
  return (
    <div className="border-b border-slate-800">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-slate-800/50 transition-colors"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-indigo-400" /> Legend &amp; Stats
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && isGenerated && (
        <div className="px-4 pb-4 space-y-2">
          {/* Seat type rows */}
          {seatTypes.map(st => {
            const style = colorMap[st.id];
            const count = stats.counts[st.id] || 0;
            return (
              <div key={st.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-sm shrink-0 border
                      ${style?.bg ?? "bg-slate-700"}
                      ${style?.border ?? "border-slate-500"}`}
                  />
                  <span className="text-[11px] text-slate-300">{st.name}</span>
                  <span className="text-[9px] text-slate-600">×{st.priceMultiplier}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{count}</span>
              </div>
            );
          })}

          {/* Aisle row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm bg-transparent border border-dashed border-slate-600 shrink-0" />
              <span className="text-[11px] text-slate-300">Aisle</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{stats.aisles}</span>
          </div>

          {/* Accessible row */}
          <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm ring-2 ring-emerald-400 bg-slate-700 shrink-0" />
              <span className="text-[11px] text-slate-300">Accessible ♿</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">{stats.accessible}</span>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-slate-700/50">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Seats</span>
              <span className="text-white font-bold">{stats.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
