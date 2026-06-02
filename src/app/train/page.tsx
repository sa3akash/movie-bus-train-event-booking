"use client";

import React, { useState, useMemo } from "react";
import { COACHES } from "@/components/train/types";
import { TrainNav } from "@/components/train/TrainNav";
import { TrainVisualizer } from "@/components/train/TrainVisualizer";
import { CoachInfoBar } from "@/components/train/CoachInfoBar";
import { SeatMap } from "@/components/train/SeatMap";
import { FareSummary } from "@/components/train/FareSummary";

export default function TrainPage() {
  const [activeCoachId, setActiveCoachId] = useState<string>("C-04");
  const [seatSelections, setSeatSelections] = useState<
    Record<string, Set<string>>
  >({});

  const activeCoach = useMemo(
    () => COACHES.find((c) => c.id === activeCoachId)!,
    [activeCoachId],
  );

  const activeSeatSet = seatSelections[activeCoachId] ?? new Set<string>();

  const toggleSeat = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSeatSelections((prev) => {
      const existing = new Set(prev[activeCoachId] ?? []);
      if (existing.has(seatId)) existing.delete(seatId);
      else existing.add(seatId);
      return { ...prev, [activeCoachId]: existing };
    });
  };

  const clearCoach = () =>
    setSeatSelections((prev) => ({ ...prev, [activeCoachId]: new Set() }));

  const allSelected = useMemo(
    () =>
      Object.entries(seatSelections).flatMap(([coachId, seats]) =>
        [...seats].map((seatId) => ({ coachId, seatId })),
      ),
    [seatSelections],
  );

  const totalPrice = useMemo(
    () =>
      allSelected.reduce((sum, { coachId }) => {
        const coach = COACHES.find((c) => c.id === coachId);
        return sum + (coach?.price ?? 0);
      }, 45 + 8.5),
    [allSelected],
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-800">
      {/* Hero + Train Visualizer */}
      <div className="relative">
        <TrainVisualizer
          activeCoachId={activeCoachId}
          onSelectCoach={setActiveCoachId}
        />
        <TrainNav />
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <CoachInfoBar
          activeCoach={activeCoach}
          activeCoachId={activeCoachId}
          seatSelections={seatSelections}
          onSelectCoach={setActiveCoachId}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Seat Map — takes 2/3 width */}
          <div className="xl:col-span-2">
            <SeatMap
              activeCoach={activeCoach}
              activeCoachId={activeCoachId}
              activeSeatSet={activeSeatSet}
              onToggleSeat={toggleSeat}
              onClearCoach={clearCoach}
            />
          </div>

          {/* Fare Summary — takes 1/3 width */}
          <FareSummary allSelected={allSelected} totalPrice={totalPrice} />
        </div>
      </main>

      {/* Global scrollbar styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
