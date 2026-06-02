"use client";

import { useRef, useEffect, useCallback } from "react";
import { COACHES } from "./types";
import { CoachItem, Gangway } from "./CoachCard";

interface TrainVisualizerProps {
  activeCoachId: string;
  onSelectCoach: (id: string) => void;
}

export const TrainVisualizer = ({
  activeCoachId,
  onSelectCoach,
}: TrainVisualizerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Drag state ────────────────────────────────────────────────────────────
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const hasDragged = useRef(false); // distinguish click vs drag

  // ── Non-passive wheel: redirect vertical scroll → horizontal ──────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += (e.deltaY !== 0 ? e.deltaY : e.deltaX) * 0.8;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Mouse drag handlers ───────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStartLeft.current - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Prevent click from firing on coaches after a drag
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDragged.current) {
      e.stopPropagation();
      hasDragged.current = false;
    }
  }, []);

  // ── Touch drag handlers ───────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    dragStartX.current = e.touches[0].clientX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    scrollRef.current.scrollLeft = scrollStartLeft.current - dx;
  }, []);

  return (
    /*
      overflow-x-hidden  — hide horizontal bleed
      overflow-y-visible — let the VIEWING badge / availability bubble poke above
      We add paddingTop so the badges don't get clipped by the browser viewport edge.
    */
    <div
      className="relative w-full rounded-b-[3rem] shadow-2xl select-none"
      style={{
        height: "26rem",           // extra room above train for badges
        background: "linear-gradient(to bottom, #020617, #0f172a, #1e293b)",
        overflowX: "hidden",
        overflowY: "visible",      // ← badges can poke above
      }}
    >
      {/* ── Dot-grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Ground & sky glow ── */}
      <div
        className="absolute bottom-0 left-0 w-full h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(6,78,59,0.28), transparent)" }}
      />
      <div
        className="absolute top-0 left-0 w-full h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(23,37,84,0.35), transparent)" }}
      />

      {/* ──────────────── RAILS ────────────────
          Upper rail: bottom 2.8rem  (where wheel tops rest)
          Lower rail: bottom 2.0rem
          Sleepers   : bottom 2.0rem, height 1.2rem
      */}

      {/* Sleepers */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2rem",
          height: "1.2rem",
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 30px, #1e293b 30px, #1e293b 44px)",
        }}
      />
      {/* Lower rail */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2rem",
          height: "3px",
          background: "#475569",
          boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      />
      {/* Upper rail */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2.8rem",
          height: "3px",
          background: "#64748b",
          boxShadow: "0 1px 6px rgba(0,0,0,0.5)",
        }}
      />
      {/* Rail specular shine */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2.8rem",
          height: "1px",
          background: "rgba(255,255,255,0.18)",
        }}
      />

      {/* ──────────────── TRAIN STRIP ────────────────
          bottom = upper-rail (2.8rem) + wheel-height (10px ≈ 0.625rem) = 3.425rem
          We use 3.4rem. The strip itself is overflow-y: visible so badges show.
      */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClickCapture={onClickCapture}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="absolute left-0 right-0 flex items-end no-scrollbar cursor-grab active:cursor-grabbing"
        style={{
          bottom: "3.4rem",
          overflowX: "auto",
          overflowY: "visible",   // ← VIEWING badge / bubble visible above
          paddingLeft: "1rem",
          paddingRight: "2rem",
          paddingBottom: "2px",
          paddingTop: "5rem",     // reserve space for badges above coaches
        }}
      >
        <div className="flex items-end flex-nowrap" style={{ gap: 0 }}>

          {/* ── Locomotive ── */}
          <div className="flex items-end shrink-0">
            <div
              className="relative shrink-0 border-b-[3px] border-slate-400 shadow-xl"
              style={{
                width: "clamp(7rem, 10vw, 10rem)",
                height: "clamp(3.5rem, 5.5vw, 5rem)",
                background: "linear-gradient(to bottom, #e2e8f0, #cbd5e1)",
                borderRadius: "2rem 4px 4px 4px",
              }}
            >
              {/* Cab window */}
              <div
                className="absolute bg-slate-800 shadow-inner"
                style={{
                  left: "8px", top: "8px",
                  width: "35%", height: "55%",
                  borderRadius: "0.75rem 0 0.5rem 0",
                }}
              />
              {/* Green stripe */}
              <div
                className="absolute left-0 right-0 bg-emerald-500"
                style={{ bottom: "1.2rem", height: "5px" }}
              />
              {/* ENG label */}
              <div
                className="absolute text-[7px] font-black text-slate-500 tracking-widest"
                style={{ bottom: "4px", right: "6px" }}
              >
                ENG
              </div>
              {/* Wheels */}
              <div className="absolute -bottom-[10px] left-3 w-4 h-4 rounded-full border-[2.5px] border-slate-700 bg-slate-400" />
              <div className="absolute -bottom-[10px] right-3 w-4 h-4 rounded-full border-[2.5px] border-slate-700 bg-slate-400" />
            </div>
            <Gangway />
          </div>

          {/* ── Coaches ── */}
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

      {/* ── Scroll hint ── */}
      <div
        className="absolute hidden md:flex items-center gap-1 text-white/25 text-[9px] font-bold tracking-widest pointer-events-none"
        style={{ bottom: "0.5rem", right: "1rem" }}
      >
        <span>←</span><span>SCROLL</span><span>→</span>
      </div>
    </div>
  );
};
