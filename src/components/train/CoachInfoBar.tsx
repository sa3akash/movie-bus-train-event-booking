"use client";

import { CoachData, COACHES, TYPE_BADGE } from './types';

interface CoachInfoBarProps {
  activeCoach: CoachData;
  activeCoachId: string;
  seatSelections: Record<string, Set<string>>;
  onSelectCoach: (id: string) => void;
}

export const CoachInfoBar = ({
  activeCoach,
  activeCoachId,
  seatSelections,
  onSelectCoach,
}: CoachInfoBarProps) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    {/* Title + badge */}
    <div className="text-white">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl md:text-4xl font-black">Coach {activeCoach.id}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${TYPE_BADGE[activeCoach.type].bg}`}>
          {TYPE_BADGE[activeCoach.type].label}
        </span>
      </div>
      <p className="text-slate-300 font-medium text-sm">
        Express Intercity • New York → Boston &nbsp;·&nbsp;
        <span className="text-emerald-300">${activeCoach.price} / seat</span>
      </p>
    </div>

    {/* Coach switcher pills — horizontal scroll strip */}
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full md:max-w-lg xl:max-w-none flex-nowrap">
      {COACHES.map(c => {
        const sel = seatSelections[c.id]?.size ?? 0;
        return (
          <button
            key={c.id}
            onClick={() => onSelectCoach(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0
              ${c.id === activeCoachId
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-black text-white/70 hover:bg-black/10 backdrop-blur-md'
              }`}
          >
            {c.label}
            {sel > 0 && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
                ${c.id === activeCoachId ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                {sel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
