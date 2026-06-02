"use client";

import React from "react";
import { Armchair, Paintbrush } from "lucide-react";
import type { SeatType, ColorMap } from "./types";

interface PaintToolbarProps {
  seatTypes: SeatType[];
  colorMap: ColorMap;
  activeTool: string | null;
  onToolChange: (toolId: string | null) => void;
}

export function PaintToolbar({
  seatTypes,
  colorMap,
  activeTool,
  onToolChange,
}: PaintToolbarProps) {
  const toggle = (id: string) => onToolChange(activeTool === id ? null : id);

  return (
    <div className="border-b border-slate-800">
      <div className="px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
        <Paintbrush className="h-3.5 w-3.5 text-indigo-400" /> Paint Tools
      </div>

      <div className="px-4 pb-4 space-y-2">
        {/* Aisle / Block tool */}
        <button
          onClick={() => toggle("__aisle__")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            activeTool === "__aisle__"
              ? "bg-slate-700 border-slate-400 text-white ring-1 ring-slate-400"
              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <div className="h-5 w-5 rounded border-2 border-dashed border-slate-500 flex items-center justify-center shrink-0">
            <span className="text-[8px] text-slate-500">−</span>
          </div>
          <span>Aisle / Block</span>
          {activeTool === "__aisle__" && (
            <span className="ml-auto text-[10px] text-emerald-400">● Active</span>
          )}
        </button>

        {/* Seat-type tools */}
        {seatTypes.length === 0 ? (
          <div className="text-[11px] text-slate-600 text-center py-3 space-y-1">
            <p>No seat types in database.</p>
            <p className="text-indigo-400">
              You can still use the Aisle tool to design the layout.
            </p>
          </div>
        ) : (
          seatTypes.map(st => {
            const style = colorMap[st.id];
            const Icon = style?.icon ?? Armchair;
            const isActive = activeTool === st.id;
            return (
              <button
                key={st.id}
                onClick={() => toggle(st.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  isActive
                    ? `${style?.bg ?? "bg-indigo-700"} ${style?.border ?? "border-indigo-400"} ${style?.text ?? "text-white"} ring-1 ${style?.border ?? "ring-indigo-400"}`
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${
                    isActive ? "bg-white/20" : style?.bg ?? "bg-slate-700"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex flex-col items-start">
                  <span>{st.name}</span>
                  <span className={`text-[9px] ${isActive ? "opacity-70" : "text-slate-600"}`}>
                    ×{st.priceMultiplier} price
                  </span>
                </div>
                {isActive && (
                  <span className="ml-auto text-[10px] text-emerald-300">● Active</span>
                )}
              </button>
            );
          })
        )}

        {activeTool && (
          <p className="text-[10px] text-slate-500 text-center pt-1">
            Click or drag seats to paint · Right-click to toggle ♿
          </p>
        )}
      </div>
    </div>
  );
}
