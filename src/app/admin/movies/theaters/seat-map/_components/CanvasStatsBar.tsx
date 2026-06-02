import React from "react";
import { SeatType, COLOR_PALETTE } from "./utils";

interface CanvasStatsBarProps {
  rows: number;
  cols: number;
  stats: {
    counts: Record<string, number>;
    aisles: number;
    accessible: number;
    total: number;
  };
  seatTypes: SeatType[];
  colorMap: Record<
    string,
    (typeof COLOR_PALETTE)[0] & {
      label: string;
      icon: React.ComponentType<any>;
    }
  >;
}

export function CanvasStatsBar({
  rows,
  cols,
  stats,
  seatTypes,
  colorMap,
}: CanvasStatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px]">
      <span className="text-slate-500">
        Grid:{" "}
        <strong className="text-white">
          {rows}R × {cols}C
        </strong>
      </span>
      <span className="text-slate-700">|</span>
      <span className="text-slate-500">
        Seats: <strong className="text-indigo-400">{stats.total}</strong>
      </span>
      <span className="text-slate-700">|</span>
      <span className="text-slate-500">
        Aisles: <strong className="text-slate-400">{stats.aisles}</strong>
      </span>
      <span className="text-slate-700">|</span>
      <span className="text-slate-500">
        Accessible:{" "}
        <strong className="text-emerald-400">{stats.accessible}</strong>
      </span>
      {seatTypes.map((st) => {
        const count = stats.counts[st.id] || 0;
        if (!count) return null;
        const style = colorMap[st.id];
        return (
          <React.Fragment key={st.id}>
            <span className="text-slate-700">|</span>
            <span className={style?.text || "text-slate-400"}>
              {st.name}: <strong>{count}</strong>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
