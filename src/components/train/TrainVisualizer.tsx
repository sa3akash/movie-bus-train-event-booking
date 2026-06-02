"use client";

import { COACHES } from "./types";
import { CoachItem, Gangway } from "./CoachCard";

interface TrainVisualizerProps {
  activeCoachId: string;
  onSelectCoach: (id: string) => void;
}

export const TrainVisualizer = ({
  activeCoachId,
  onSelectCoach,
}: TrainVisualizerProps) => (
  <div className="relative w-full h-120 bg-linear-to-b from-slate-950 via-slate-900 to-slate-800 rounded-b-[4rem] shadow-2xl overflow-hidden">
    {/* Dot-grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
    {/* Ground glow */}
    <div className="absolute bottom-16 left-0 w-full h-24 bg-linear-to-t from-emerald-900/20 to-transparent" />

    {/* Tracks */}
    <div className="absolute bottom-[4.2rem] left-0 right-0 h-[3px] bg-slate-600 shadow-md" />
    <div className="absolute bottom-12 left-0 right-0 h-[3px] bg-slate-600 shadow-md" />
    <div
      className="absolute bottom-12 left-0 right-0 h-[1.2rem]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent, transparent 36px, #1e293b 36px, #1e293b 46px)",
      }}
    />

    {/* Train */}
    <div className="absolute bottom-[5.2rem] left-0 right-0 flex items-end px-8 md:px-24 overflow-x-auto no-scrollbar gap-0">
      {/* Locomotive */}
      <div className="flex items-end shrink-0">
        <div className="w-36 md:w-52 h-20 md:h-24 bg-slate-200 rounded-tl-[3rem] rounded-tr-md flex flex-col justify-between border-b-4 border-slate-400 relative shadow-lg opacity-90">
          <div className="w-12 md:w-16 h-8 md:h-10 bg-slate-800 rounded-tl-2xl rounded-br-lg absolute left-2 md:left-3 top-2 md:top-3 shadow-inner" />
          <div className="w-full h-2 bg-emerald-500 absolute bottom-6" />
          <div className="absolute -bottom-3 left-6 md:left-10 w-5 h-5 rounded-full border-[3px] border-slate-700 bg-slate-400" />
          <div className="absolute -bottom-3 right-4 md:right-8 w-5 h-5 rounded-full border-[3px] border-slate-700 bg-slate-400" />
          <div className="absolute bottom-2 right-3 text-[8px] font-black text-slate-500 tracking-widest">
            ENG
          </div>
        </div>
        <Gangway />
      </div>

      {/* Coach wagons */}
      {COACHES.map((coach, idx) => (
        <CoachItem
          key={coach.id}
          coach={coach}
          isActive={coach.id === activeCoachId}
          isLast={idx === COACHES.length - 1}
          onSelect={onSelectCoach}
        />
      ))}
    </div>
  </div>
);
