"use client";

import { CoachData, TYPE_BADGE } from './types';
import { ChevronDown } from './TrainIcons';

// ─── Gangway ──────────────────────────────────────────────────────────────────

export const Gangway = () => (
  <div className="w-2 md:w-3 h-12 md:h-14 bg-slate-900 flex flex-col justify-evenly px-0.5 shrink-0">
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="w-full h-0.5 bg-black/50" />
    ))}
  </div>
);

// ─── CoachCard ────────────────────────────────────────────────────────────────

interface CoachCardProps {
  coach: CoachData;
  active: boolean;
  onClick: () => void;
}

export const CoachCard = ({ coach, active, onClick }: CoachCardProps) => {
  const badge = TYPE_BADGE[coach.type];
  const availCount = coach.layout.seats.filter(s => s.isActive).length;
  const totalCount = coach.layout.seats.length;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-36 md:w-48 h-20 md:h-24 rounded-md flex flex-col justify-between shrink-0
        transition-all duration-300 border-b-4 focus:outline-none group
        ${active
          ? 'bg-emerald-500 border-emerald-700 scale-110 -translate-y-3 shadow-[0_0_40px_rgba(16,185,129,0.6)] z-10'
          : 'bg-slate-300 border-slate-500 hover:bg-slate-200 hover:-translate-y-1 opacity-80 hover:opacity-100'
        }
      `}
    >
      {/* Window row */}
      <div className="flex justify-center gap-1.5 px-3 pt-3 md:pt-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 aspect-square rounded-[3px] max-h-7
              ${active ? 'bg-emerald-900/30' : 'bg-slate-800/30'}`}
          />
        ))}
      </div>

      {/* Label */}
      <div className={`text-center text-[9px] md:text-[10px] font-extrabold pb-2 tracking-widest
        ${active ? 'text-white' : 'text-slate-600'}`}>
        {coach.label}
      </div>

      {/* Wheels */}
      <div className="absolute -bottom-3 left-5 md:left-8 w-5 h-5 rounded-full border-[3px] border-slate-700 bg-slate-400" />
      <div className="absolute -bottom-3 right-5 md:right-8 w-5 h-5 rounded-full border-[3px] border-slate-700 bg-slate-400" />

      {/* Type badge */}
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white whitespace-nowrap
        ${badge.bg} ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
        {badge.label}
      </div>

      {/* Availability bubble when active */}
      {active && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {availCount}/{totalCount} free
        </div>
      )}
    </button>
  );
};

// ─── CoachItem (card + gangway + viewing badge wrapper) ──────────────────────

interface CoachItemProps {
  coach: CoachData;
  isActive: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
}

export const CoachItem = ({ coach, isActive, isLast, onSelect }: CoachItemProps) => (
  <div className="flex items-end">
    <div className="relative flex flex-col items-center">
      {/* "VIEWING" badge */}
      {isActive && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
          <div className="bg-emerald-400 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            VIEWING
          </div>
          <div className="w-0.5 h-3 bg-emerald-400 mt-0.5" />
          <ChevronDown />
        </div>
      )}
      <CoachCard coach={coach} active={isActive} onClick={() => onSelect(coach.id)} />
    </div>
    {!isLast && <Gangway />}
  </div>
);
