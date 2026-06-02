"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SeatCell, ColorMap, GridStats } from "./types";
import { getCellClasses, rowLabel } from "./seat-map-utils";
import { Monitor } from "lucide-react";

interface SeatPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grid: SeatCell[][];
  colorMap: ColorMap;
  stats: GridStats;
  screenName: string;
}

export function SeatPreview({
  open,
  onOpenChange,
  grid,
  colorMap,
  stats,
  screenName,
}: SeatPreviewProps) {
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  // Reset selected seats when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedSeats(new Set());
    }
  }, [open]);

  const toggleSeat = (ri: number, ci: number, cell: SeatCell) => {
    if (cell.seatTypeId === null) return; // Aisle
    const key = `${ri}-${ci}`;
    const newSet = new Set(selectedSeats);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedSeats(newSet);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 text-slate-100 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Customer Preview - {screenName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
          {/* Screen indicator */}
          <div className="flex flex-col items-center gap-2 w-full max-w-[min(80%,600px)] mb-12 mt-4">
            <div className="w-full h-2 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full opacity-80 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-semibold">SCREEN</p>
          </div>

          {/* Grid */}
          <div className="select-none overflow-auto max-w-full pb-8 px-4">
            {grid.map((rowArr, ri) => (
              <div key={ri} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 font-mono w-6 text-right shrink-0">{rowLabel(ri)}</span>
                <div className="flex gap-1.5">
                  {rowArr.map((cell, ci) => {
                    const isEmpty = cell.seatTypeId === null;
                    const key = `${ri}-${ci}`;
                    const isSelected = selectedSeats.has(key);
                    
                    let cellClass = getCellClasses(cell, colorMap);
                    if (isSelected) {
                      cellClass = "bg-white text-slate-900 border-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950";
                    }

                    return (
                      <button
                        key={ci}
                        disabled={isEmpty}
                        onClick={() => toggleSeat(ri, ci, cell)}
                        title={isEmpty ? "Aisle" : `${cell.row}${cell.label}${cell.isAccessible ? " ♿" : ""}`}
                        className={`
                          w-8 h-8 rounded-t-lg rounded-b-sm border transition-all duration-200
                          flex items-center justify-center
                          ${isEmpty ? "bg-transparent border-transparent opacity-0 cursor-default" : "cursor-pointer hover:scale-110 hover:brightness-125"}
                          ${!isEmpty ? cellClass : ""}
                        `}
                      >
                        {!isEmpty && (
                          <span className="text-[9px] font-bold leading-none select-none">
                            {cell.isAccessible ? "♿" : cell.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-slate-500 font-mono w-6 shrink-0 ml-1">{rowLabel(ri)}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-auto pt-6 flex flex-wrap items-center justify-center gap-6 px-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-white border-white" />
              <span className="text-xs text-slate-300">Selected</span>
            </div>
            {Object.values(colorMap).map((style, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-t-lg rounded-b-sm ${style.bg} ${style.border}`} />
                <span className="text-xs text-slate-300">{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
