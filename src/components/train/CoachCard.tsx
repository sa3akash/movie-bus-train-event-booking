"use client";

import { CoachData, TYPE_BADGE } from "./types";

// ─── Gangway ──────────────────────────────────────────────────────────────────

export const Gangway = () => (
  <div className="w-3 h-10 bg-slate-900 flex flex-col justify-evenly px-0.5 shrink-0 self-end mb-1">
    {[0, 1, 2, 3].map((i) => (
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
  const availCount = coach.layout.seats.filter((s) => s.isActive).length;
  const totalCount = coach.layout.seats.length;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-28 sm:w-36 h-16 sm:h-20 rounded-sm flex flex-col justify-between shrink-0
        transition-all duration-300 border-b-[3px] focus:outline-none group
        ${
          active
            ? "bg-emerald-500 border-emerald-700 shadow-[0_0_28px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/50 z-10"
            : "bg-slate-300 border-slate-500 hover:bg-slate-200 opacity-80 hover:opacity-100"
        }
      `}
    >
      {/* Window row */}
      <div className="flex justify-center gap-1 px-2 pt-2 sm:pt-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 aspect-square rounded-[2px] max-h-5
              ${active ? "bg-emerald-900/30" : "bg-slate-800/30"}`}
          />
        ))}
      </div>

      {/* Label */}
      <div
        className={`text-center text-[8px] font-extrabold pb-1 tracking-widest
        ${active ? "text-white" : "text-slate-600"}`}
      >
        {coach.label}
      </div>

      {/* Wheels — positioned so they sit ON the rail */}
      <div className="absolute bottom-[-10px] left-3 w-4 h-4 rounded-full border-[2.5px] border-slate-700 bg-slate-400" />
      <div className="absolute bottom-[-10px] right-3 w-4 h-4 rounded-full border-[2.5px] border-slate-700 bg-slate-400" />

      {/* Type badge */}
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[7px] font-bold text-white whitespace-nowrap
        ${badge.bg} ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
      >
        {badge.label}
      </div>

      {/* Availability bubble when active */}
      {active && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap flex items-center gap-1">
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

export const CoachItem = ({
  coach,
  isActive,
  isLast,
  onSelect,
}: CoachItemProps) => (
  <div className="flex items-end">
    <div className="relative flex flex-col items-center">
      {/* "VIEWING" badge — sits well above the coach so it never clips */}
      {isActive && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
          style={{ bottom: "calc(100% + 2.8rem)" }}
        >
          <div className="bg-emerald-400 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1 animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            VIEWING
          </div>
          <div className="w-0.5 h-8 bg-emerald-400/60 mt-0.5" />
        </div>
      )}
      <CoachCard
        coach={coach}
        active={isActive}
        onClick={() => onSelect(coach.id)}
      />
    </div>
    {!isLast && <Gangway />}
  </div>
);
