import React, { useRef, useCallback, memo } from "react";
import { SeatCell, rowLabel } from "./utils";

interface SeatGridProps {
  grid: SeatCell[][];
  cols: number;
  zoomLevel: number;
  activeTool: string | null;
  paintCell: (r: number, c: number) => void;
  applyZoneRange: (r1: number, c1: number, r2: number, c2: number) => void;
  toggleAccessible: (ri: number, ci: number, e: React.MouseEvent) => void;
  getCellStyle: (cell: SeatCell) => string;
}

const getZoomClasses = (zoomLevel: number) => {
  if (zoomLevel <= 0.5)
    return {
      size: "w-3 h-3",
      font: "text-[4px]",
      gap: "gap-[1px]",
      labelW: "w-3",
      labelF: "text-[8px]",
    };
  if (zoomLevel <= 0.75)
    return {
      size: "w-5 h-5",
      font: "text-[6px]",
      gap: "gap-0.5",
      labelW: "w-4",
      labelF: "text-[9px]",
    };
  if (zoomLevel <= 1.25)
    return {
      size: "w-7 h-7",
      font: "text-[8px]",
      gap: "gap-1",
      labelW: "w-5",
      labelF: "text-[11px]",
    };
  if (zoomLevel <= 1.5)
    return {
      size: "w-9 h-9",
      font: "text-[10px]",
      gap: "gap-1.5",
      labelW: "w-6",
      labelF: "text-xs",
    };
  if (zoomLevel <= 1.75)
    return {
      size: "w-11 h-11",
      font: "text-[12px]",
      gap: "gap-2",
      labelW: "w-7",
      labelF: "text-sm",
    };
  return {
    size: "w-12 h-12",
    font: "text-[14px]",
    gap: "gap-2",
    labelW: "w-8",
    labelF: "text-base",
  };
};

interface MemoizedSeatCellProps {
  cell: SeatCell;
  ri: number;
  ci: number;
  zoomConfig: ReturnType<typeof getZoomClasses>;
  activeTool: string | null;
  getCellStyle: (cell: SeatCell) => string;
  onMouseDown: (ri: number, ci: number, e: React.MouseEvent) => void;
  onMouseEnter: (ri: number, ci: number) => void;
  onMouseUp: (ri: number, ci: number, e: React.MouseEvent) => void;
  onContextMenu: (ri: number, ci: number, e: React.MouseEvent) => void;
}

const MemoizedSeatCell = memo(function MemoizedSeatCell({
  cell,
  ri,
  ci,
  zoomConfig,
  activeTool,
  getCellStyle,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onContextMenu,
}: MemoizedSeatCellProps) {
  const isEmpty = cell.seatTypeId === null;
  return (
    <button
      title={
        isEmpty
          ? "Aisle"
          : `${cell.row}${cell.label}${cell.isAccessible ? " ♿" : ""}`
      }
      className={`
          ${zoomConfig.size} rounded-sm border transition-all duration-75 flex items-end justify-center pb-0.5
          ${getCellStyle(cell)}
          ${activeTool ? "cursor-crosshair" : "cursor-default"}
          ${!isEmpty ? "hover:brightness-125 hover:scale-110" : ""}
        `}
      onMouseDown={(e) => onMouseDown(ri, ci, e)}
      onMouseEnter={() => onMouseEnter(ri, ci)}
      onMouseUp={(e) => onMouseUp(ri, ci, e)}
      onContextMenu={(e) => onContextMenu(ri, ci, e)}
    >
      {!isEmpty && (
        <span
          className={`${zoomConfig.font} font-bold leading-none select-none`}
        >
          {cell.isAccessible ? "♿" : cell.label}
        </span>
      )}
    </button>
  );
});

export function SeatGrid({
  grid,
  cols,
  zoomLevel,
  activeTool,
  paintCell,
  applyZoneRange,
  toggleAccessible,
  getCellStyle,
}: SeatGridProps) {
  const isPaintingRef = useRef(false);
  const zoneStartRef = useRef<{ r: number; c: number } | null>(null);

  const handleMouseDown = useCallback(
    (ri: number, ci: number, e: React.MouseEvent) => {
      if (e.button === 2) return;
      isPaintingRef.current = true;
      zoneStartRef.current = { r: ri, c: ci };
      paintCell(ri, ci);
    },
    [paintCell],
  );

  const handleMouseEnter = useCallback(
    (ri: number, ci: number) => {
      if (isPaintingRef.current && activeTool) {
        paintCell(ri, ci);
      }
    },
    [activeTool, paintCell],
  );

  const handleMouseUp = useCallback(
    (ri: number, ci: number, e: React.MouseEvent) => {
      if (e.button === 2) return;
      const start = zoneStartRef.current;
      if (start && (start.r !== ri || start.c !== ci)) {
        applyZoneRange(start.r, start.c, ri, ci);
      }
      isPaintingRef.current = false;
      zoneStartRef.current = null;
    },
    [applyZoneRange],
  );

  const zoomConfig = getZoomClasses(zoomLevel);

  return (
    <div
      className="select-none"
      onMouseLeave={() => {
        isPaintingRef.current = false;
        zoneStartRef.current = null;
      }}
      onMouseUp={() => {
        isPaintingRef.current = false;
        zoneStartRef.current = null;
      }}
    >
      {grid.map((rowArr, ri) => (
        <div key={ri} className={`flex items-center ${zoomConfig.gap} mb-1`}>
          <span
            className={`${zoomConfig.labelF} text-slate-600 font-mono ${zoomConfig.labelW} text-right shrink-0`}
          >
            {rowLabel(ri)}
          </span>
          <div className={`flex ${zoomConfig.gap}`}>
            {rowArr.map((cell, ci) => (
              <MemoizedSeatCell
                key={ci}
                cell={cell}
                ri={ri}
                ci={ci}
                zoomConfig={zoomConfig}
                activeTool={activeTool}
                getCellStyle={getCellStyle}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
                onContextMenu={toggleAccessible}
              />
            ))}
          </div>
          <span
            className={`${zoomConfig.labelF} text-slate-600 font-mono ${zoomConfig.labelW} shrink-0`}
          >
            {rowLabel(ri)}
          </span>
        </div>
      ))}

      {/* Column numbers */}
      <div className={`flex items-center ${zoomConfig.gap} mt-2 ml-6`}>
        {Array.from({ length: cols }, (_, ci) => (
          <span
            key={ci}
            className={`${zoomConfig.size} text-center ${zoomConfig.font} text-slate-700 font-mono`}
          >
            {ci + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
