import React from "react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { SeatType, COLOR_PALETTE } from "./utils";

interface LegendPanelProps {
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  isGenerated: boolean;
  seatTypes: SeatType[];
  colorMap: Record<
    string,
    (typeof COLOR_PALETTE)[0] & {
      label: string;
      icon: React.ComponentType<any>;
    }
  >;
  stats: {
    counts: Record<string, number>;
    aisles: number;
    accessible: number;
    total: number;
  };
}

export function LegendPanel({
  showLegend,
  setShowLegend,
  isGenerated,
  seatTypes,
  colorMap,
  stats,
}: LegendPanelProps) {
  return (
    <div className="border-b">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest transition-colors"
        onClick={() => setShowLegend(!showLegend)}
      >
        <span className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-indigo-400" /> Legend & Stats
        </span>
        {showLegend ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {showLegend && isGenerated && (
        <div className="px-4 pb-4 space-y-2">
          {seatTypes.map((st) => {
            const style = colorMap[st.id];
            const count = stats.counts[st.id] || 0;
            return (
              <div key={st.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-sm ${style?.bg || "bg-slate-700"} border ${style?.border || "border-slate-500"} shrink-0`}
                  />
                  <span className="text-[11px] text-slate-300">{st.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {count}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm bg-transparent border border-dashed border-slate-600 shrink-0" />
              <span className="text-[11px] text-slate-300">Aisle</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {stats.aisles}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm ring-2 ring-emerald-400 bg-slate-700 shrink-0" />
              <span className="text-[11px] text-slate-300">Accessible</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">
              {stats.accessible}
            </span>
          </div>
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
