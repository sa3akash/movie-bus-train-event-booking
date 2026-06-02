import React, { useMemo } from "react";
import { ProcessedSeat, TierMeta } from "./types";
import { CELL_SIZE } from "./constants";
import { SeatItem } from "./SeatItem";

interface SeatGridProps {
  columns: number;
  rowSpan: number;
  processedSeats: ProcessedSeat[];
  bookedMap: Set<string>;
  selectedSeats: Set<string>;
  tierMeta: TierMeta;
  onToggleSeat: (id: string) => void;
}

export const SeatGrid = React.memo(
  ({
    columns,
    rowSpan,
    processedSeats,
    bookedMap,
    selectedSeats,
    tierMeta,
    onToggleSeat,
  }: SeatGridProps) => {
    const rowLabels = useMemo(() => {
      const map = new Map<number, string>();
      processedSeats.forEach((s) => map.set(s.row, s.rowLabel));
      return Array.from(map.entries());
    }, [processedSeats]);

    return (
      <div className="w-max mx-auto">
        {/* NUMBERS */}
        <div
          className="grid gap-2 mb-2"
          style={{
            gridTemplateColumns: `40px repeat(${columns},${CELL_SIZE}px) 40px`,
          }}
        >
          <div />
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="text-xs text-center">
              {i + 1}
            </div>
          ))}
          <div />
        </div>

        {/* GRID */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `40px repeat(${columns},${CELL_SIZE}px) 40px`,
            gridTemplateRows: `repeat(${rowSpan},${CELL_SIZE}px)`,
          }}
        >
          {/* ROW LABELS */}
          {rowLabels.map(([rowIdx, label]) => (
            <React.Fragment key={`row-labels-${rowIdx}`}>
              <div
                className="flex items-center justify-end text-xs text-slate-500 font-bold pr-2 select-none"
                style={{ gridColumnStart: 1, gridRowStart: rowIdx }}
              >
                {label}
              </div>
              <div
                className="flex items-center justify-start text-xs text-slate-500 font-bold pl-2 select-none"
                style={{ gridColumnStart: columns + 2, gridRowStart: rowIdx }}
              >
                {label}
              </div>
            </React.Fragment>
          ))}

          {processedSeats.map((s) => (
            <SeatItem
              key={s.id}
              id={s.id}
              seat={s.num}
              col={s.col}
              row={s.row}
              isBooked={bookedMap.has(s.id)}
              isSelected={selectedSeats.has(s.id)}
              tierMeta={tierMeta}
              onToggle={onToggleSeat}
            />
          ))}
        </div>
      </div>
    );
  }
);

SeatGrid.displayName = "SeatGrid";
