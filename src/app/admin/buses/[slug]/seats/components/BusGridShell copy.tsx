"use client";

import React from "react";
import { useSeatBuilder } from "./SeatBuilderContext";
import { SeatInteractiveCell } from "./SeatInteractiveCell";

export function BusGridShell() {
  const {
    activeLevel,
    customRows,
    customCols,
    drawMode,
    setIsDrawing,
    matrix,
  } = useSeatBuilder();

  return (
    <div className="flex-1 bg-muted/20 p-8 rounded-3xl border-4 border-muted/50 flex flex-col items-center shadow-inner relative min-h-[600px] overflow-hidden">
      {/* Front of Bus visual */}
      <div className="absolute top-0 inset-x-0 h-16 bg-muted-foreground/10 rounded-b-[40%] flex justify-end pr-12 items-center">
        {activeLevel === 1 && (
          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded-full flex flex-col items-center justify-center -rotate-45 shadow-sm bg-background">
            <div className="w-4 h-0.5 bg-muted-foreground/50"></div>
            <div className="w-0.5 h-4 bg-muted-foreground/50 -mt-2.5"></div>
          </div>
        )}
      </div>

      <div
        className={`mt-12 z-10 grid gap-3 touch-none select-none ${drawMode !== "none" ? "cursor-crosshair" : "cursor-pointer"}`}
        style={{ gridTemplateColumns: `auto repeat(${customCols}, minmax(0, 1fr))` }}
        onMouseLeave={() => setIsDrawing(false)}
      >
        {/* Top Left Corner */}
        <div></div>

        {/* Column Headers */}
        {Array.from({ length: customCols }).map((_, x) => (
          <div key={`header-col-${x}`} className="flex items-center justify-center text-xs font-bold text-muted-foreground/60 select-none">
            {x + 1}
          </div>
        ))}

        {/* Matrix Rows */}
        {Array.from({ length: customRows }).map((_, y) => (
          <React.Fragment key={`row-${y}`}>
            {/* Row Header */}
            <div className="flex items-center justify-end pr-1 text-xs font-bold text-muted-foreground/60 select-none">
              {String.fromCharCode(65 + y)}
            </div>

            {/* Seat Cells */}
            {Array.from({ length: customCols }).map((_, x) => {
              const cell = matrix[`${activeLevel}-${y}-${x}`] || {
                x,
                y,
                level: activeLevel,
                type: "empty",
                row: "",
                seatNumber: 0,
                isActive: true,
                isAccessible: false,
              };

              return (
                <SeatInteractiveCell key={`${y}-${x}`} cell={cell} x={x} y={y} />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Back of bus visual */}
      <div className="absolute bottom-0 inset-x-0 h-8 bg-muted-foreground/10 rounded-t-3xl"></div>
    </div>
  );
}
