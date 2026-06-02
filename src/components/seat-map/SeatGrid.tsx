"use client";

import React, { useCallback, useState } from "react";
import type { SeatCell, ColorMap } from "./types";
import { rowLabel, getCellClasses } from "./seat-map-utils";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SeatGridProps {
  grid: SeatCell[][];
  colorMap: ColorMap;
  activeTool: string | null;
  /** Called when a cell should be painted (single or drag) */
  onPaintCell: (ri: number, ci: number) => void;
  /** Called when a rectangular zone should be painted */
  onPaintZone: (r1: number, c1: number, r2: number, c2: number) => void;
  /** Called on right-click to toggle accessibility */
  onToggleAccessible: (ri: number, ci: number, e: React.MouseEvent) => void;
  /** Size variant for the cell squares */
  cellSize?: "sm" | "md" | "lg";
}

const CELL_SIZES = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-9 h-9",
};

const FONT_SIZES = {
  sm: "text-[6px]",
  md: "text-[8px]",
  lg: "text-[10px]",
};

// ─────────────────────────────────────────────────────────────────────────────
// SeatGrid — interactive editor grid
// ─────────────────────────────────────────────────────────────────────────────

export function SeatGrid({
  grid,
  colorMap,
  activeTool,
  onPaintCell,
  onPaintZone,
  onToggleAccessible,
  cellSize = "md",
}: SeatGridProps) {
  const [isPainting, setIsPainting] = useState(false);
  const [zoneStart, setZoneStart] = useState<{ r: number; c: number } | null>(null);

  const cols = grid[0]?.length ?? 0;
  const csz = CELL_SIZES[cellSize];
  const fsz = FONT_SIZES[cellSize];

  const stopPainting = useCallback(() => {
    setIsPainting(false);
    setZoneStart(null);
  }, []);

  return (
    <div
      className="select-none"
      onMouseLeave={stopPainting}
      onMouseUp={stopPainting}
    >
      {grid.map((rowArr, ri) => (
        <div key={ri} className="flex items-center gap-1 mb-1">
          {/* Left row label */}
          <span className="text-[11px] text-slate-600 font-mono w-5 text-right shrink-0">
            {rowLabel(ri)}
          </span>

          <div className="flex gap-1">
            {rowArr.map((cell, ci) => {
              const isEmpty = cell.seatTypeId === null;
              return (
                <button
                  key={ci}
                  title={
                    isEmpty
                      ? "Aisle"
                      : `${cell.row}${cell.label}${cell.isAccessible ? " ♿" : ""}`
                  }
                  className={`
                    ${csz} rounded-sm border transition-all duration-75
                    flex items-end justify-center pb-0.5
                    ${getCellClasses(cell, colorMap)}
                    ${activeTool ? "cursor-crosshair" : "cursor-default"}
                    ${!isEmpty ? "hover:brightness-125 hover:scale-110" : ""}
                  `}
                  onMouseDown={(e) => {
                    if (e.button === 2) return;
                    setIsPainting(true);
                    setZoneStart({ r: ri, c: ci });
                    onPaintCell(ri, ci);
                  }}
                  onMouseEnter={() => {
                    if (isPainting && activeTool) onPaintCell(ri, ci);
                  }}
                  onMouseUp={(e) => {
                    if (e.button === 2) return;
                    if (zoneStart && (zoneStart.r !== ri || zoneStart.c !== ci)) {
                      onPaintZone(zoneStart.r, zoneStart.c, ri, ci);
                    }
                    setIsPainting(false);
                    setZoneStart(null);
                  }}
                  onContextMenu={(e) => onToggleAccessible(ri, ci, e)}
                >
                  {!isEmpty && (
                    <span className={`${fsz} font-bold leading-none select-none`}>
                      {cell.isAccessible ? "♿" : cell.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right row label */}
          <span className="text-[11px] text-slate-600 font-mono w-5 shrink-0">
            {rowLabel(ri)}
          </span>
        </div>
      ))}

      {/* Column numbers footer */}
      <div className="flex items-center gap-1 mt-2 ml-6">
        {Array.from({ length: cols }, (_, ci) => (
          <span
            key={ci}
            className={`${csz} text-center text-[8px] text-slate-700 font-mono`}
          >
            {ci + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
