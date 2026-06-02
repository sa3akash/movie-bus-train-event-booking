"use client";

import { CoachData, TYPE_BADGE } from './types';

interface SeatMapProps {
  activeCoach: CoachData;
  activeCoachId: string;
  activeSeatSet: Set<string>;
  onToggleSeat: (seatId: string, isAvailable: boolean) => void;
  onClearCoach: () => void;
}

const LEGEND_ITEMS = [
  { color: 'bg-white border-b-2 border-slate-200 shadow-sm',        label: 'Available' },
  { color: 'bg-emerald-500 border-b-2 border-emerald-700',           label: 'Selected'  },
  { color: 'bg-slate-200 border-b-2 border-slate-300 opacity-50',   label: 'Occupied'  },
];

export const SeatMap = ({
  activeCoach,
  activeCoachId,
  activeSeatSet,
  onToggleSeat,
  onClearCoach,
}: SeatMapProps) => {
  const availableCount = activeCoach.layout.seats.filter(s => s.isActive).length;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-900/10 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-slate-800 text-lg">Select Seats</h3>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Coach {activeCoach.id} — {availableCount} seats available
          </p>
        </div>
        {activeSeatSet.size > 0 && (
          <button
            onClick={onClearCoach}
            className="text-xs text-red-500 font-semibold hover:underline"
          >
            Clear coach
          </button>
        )}
      </div>

      {/* Scrollable coach shell */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-10">
        <div className="min-w-max flex justify-center py-4 px-12 relative">
          <div className="relative flex items-stretch z-10 drop-shadow-2xl">

            {/* Left gangway wall */}
            <div className="w-7 bg-slate-700 flex flex-col justify-center rounded-l-md border-l-4 border-slate-800 z-20">
              <div className="h-14 w-full bg-slate-900/50 flex flex-col justify-between py-1.5 border-y-2 border-slate-900">
                {[0, 1, 2].map(i => <div key={i} className="w-full h-0.5 bg-black/40" />)}
              </div>
            </div>

            {/* Body */}
            <div
              className="bg-slate-100 relative flex items-center px-10 py-8 border-y-8 border-slate-300"
              style={{ boxShadow: 'inset 0 12px 24px rgba(255,255,255,0.8), inset 0 -10px 20px rgba(0,0,0,0.05)' }}
            >
              {/* Top windows */}
              <div className="absolute top-0 left-10 right-10 h-2.5 flex gap-3 px-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-full bg-sky-200/60 rounded-b border border-sky-300/40" />
                ))}
              </div>
              {/* Bottom windows */}
              <div className="absolute bottom-0 left-10 right-10 h-2.5 flex gap-3 px-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-full bg-sky-200/60 rounded-t border border-sky-300/40" />
                ))}
              </div>

              {/* Seat grid */}
              <div
                className="grid gap-x-3 gap-y-3 relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${activeCoach.layout.rows}, minmax(46px, 1fr))`,
                  gridTemplateRows:    `repeat(${activeCoach.layout.columns}, minmax(46px, 1fr))`,
                }}
              >
                {activeCoach.layout.seats.map((seat, i) => {
                  const seatId = `${seat.row}${seat.seatNumber}`;
                  const isAvailable = seat.isActive;
                  const isSelected = activeSeatSet.has(seatId);
                  return (
                    <div
                      key={i}
                      onClick={() => onToggleSeat(seatId, isAvailable)}
                      style={{ gridColumn: seat.y + 1, gridRow: seat.x + 1 }}
                      className={`w-12 h-12 flex flex-col items-center justify-center rounded-t-xl rounded-b-sm text-[11px] font-black transition-all select-none relative
                        ${isSelected
                          ? 'bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.45)] scale-110 z-20 border-b-4 border-emerald-700'
                          : isAvailable
                            ? `bg-white text-slate-400 shadow-md border-b-4 border-slate-200 cursor-pointer
                               hover:border-emerald-400 hover:text-emerald-600 hover:-translate-y-1 hover:shadow-lg
                               ${TYPE_BADGE[activeCoach.type].text}`
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border-b-4 border-slate-300 opacity-50'
                        }`}
                    >
                      <div className={`absolute top-1 w-7 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                      <span className="mt-2">{seatId}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right gangway wall */}
            <div className="w-7 bg-slate-700 flex flex-col justify-center rounded-r-md border-r-4 border-slate-800 z-20">
              <div className="h-14 w-full bg-slate-900/50 flex flex-col justify-between py-1.5 border-y-2 border-slate-900">
                {[0, 1, 2].map(i => <div key={i} className="w-full h-0.5 bg-black/40" />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100">
        {LEGEND_ITEMS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-5 rounded-t-md ${color}`} />
            <span className="text-sm font-medium text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
