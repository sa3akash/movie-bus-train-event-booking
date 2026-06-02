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

  // ── Drag state ──────────────────────────────────────────────────────────────
  const isDragging    = useRef(false);
  const dragStartX    = useRef(0);
  const scrollStart   = useRef(0);
  const hasDragged    = useRef(false);

  // ── Non-passive wheel → horizontal scroll ───────────────────────────────────
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

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current  = true;
    hasDragged.current  = false;
    dragStartX.current  = e.clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  }, []);

  const stopDrag = useCallback(() => { isDragging.current = false; }, []);

  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDragged.current) { e.stopPropagation(); hasDragged.current = false; }
  }, []);

  // ── Touch drag ──────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    dragStartX.current  = e.touches[0].clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = scrollStart.current - (e.touches[0].clientX - dragStartX.current);
  }, []);

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{
        height: "28rem",
        borderRadius: "0 0 2.5rem 2.5rem",
        // Rich dusk sky gradient
        background: "linear-gradient(to bottom, #0a0a1a 0%, #0d1b3e 20%, #1a1040 40%, #2d1b4e 55%, #1a0d2e 70%, #0d1520 85%, #071018 100%)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.8)",
      }}
    >
      {/* ── Stars ── */}
      {[
        [12, 8], [25, 5], [38, 12], [52, 4], [65, 9], [78, 6], [88, 14],
        [18, 18], [45, 7], [70, 16], [92, 8], [5, 22], [33, 3], [60, 20], [82, 11],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}%`,
            top:  `${y}%`,
            width:  i % 3 === 0 ? "2px" : "1px",
            height: i % 3 === 0 ? "2px" : "1px",
            background: "#fff",
            opacity: 0.4 + (i % 4) * 0.15,
            animation: `pulse ${1.5 + (i % 5) * 0.4}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Moon ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "6%", right: "8%",
          width: "36px", height: "36px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #d97706)",
          boxShadow: "0 0 24px rgba(253,230,138,0.5), 0 0 60px rgba(253,230,138,0.2)",
        }}
      />
      {/* Moon crescent shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "5.2%", right: "6.8%",
          width: "32px", height: "32px",
          borderRadius: "50%",
          background: "rgba(13,27,62,0.7)",
        }}
      />

      {/* ── Distant mountains ── */}
      <svg
        className="absolute bottom-[5.5rem] left-0 w-full pointer-events-none"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ height: "80px", opacity: 0.6 }}
      >
        <path
          d="M0,120 L0,80 L80,30 L160,70 L240,20 L340,65 L420,15 L500,60 L580,25 L660,55 L740,10 L820,50 L900,30 L980,60 L1060,20 L1140,55 L1200,40 L1200,120 Z"
          fill="#1a1040"
        />
      </svg>

      {/* ── Closer dark hill silhouette ── */}
      <svg
        className="absolute bottom-[5.2rem] left-0 w-full pointer-events-none"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        style={{ height: "50px", opacity: 0.85 }}
      >
        <path
          d="M0,60 L0,40 L100,20 L200,38 L300,15 L400,35 L500,22 L600,40 L700,18 L800,38 L900,25 L1000,42 L1100,20 L1200,36 L1200,60 Z"
          fill="#110d22"
        />
      </svg>

      {/* ── Tree silhouettes ── */}
      <svg
        className="absolute bottom-[5rem] pointer-events-none"
        style={{ left: "2%", height: "48px", width: "120px", opacity: 0.6 }}
        viewBox="0 0 120 48"
      >
        {[10, 30, 55, 80, 105].map((x, i) => (
          <g key={i} transform={`translate(${x}, ${48 - 10 - (i % 2) * 6})`}>
            <rect x="-2" y="0" width="4" height="10" fill="#0a0a18" />
            <polygon points="0,-28 -8,0 8,0" fill="#0f1520" />
            <polygon points="0,-20 -6,4 6,4" fill="#0a1020" />
          </g>
        ))}
      </svg>

      {/* ── Ground platform ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "0",
          height: "5rem",
          background: "linear-gradient(to top, #050d14 0%, #071018 60%, transparent 100%)",
        }}
      />

      {/* ── Ground glow (ambient light from train) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "0",
          height: "4rem",
          background: "radial-gradient(ellipse at 40% 100%, rgba(56,189,248,0.08) 0%, rgba(168,85,247,0.06) 50%, transparent 80%)",
        }}
      />

      {/* ── Ballast / gravel under tracks ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2.2rem",
          height: "0.9rem",
          background:
            "repeating-linear-gradient(90deg, #0f172a 0px, #1e293b 3px, #0f172a 6px)",
          opacity: 0.9,
        }}
      />

      {/* ── Railway sleepers ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2.4rem",
          height: "1rem",
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 22px, #1a2535 22px, #1a2535 38px)",
        }}
      />

      {/* ── Lower rail (near) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "2.3rem",
          height: "4px",
          background: "linear-gradient(to bottom, #64748b, #475569)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(100,116,139,0.3)",
        }}
      />

      {/* ── Upper rail (far) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "3.2rem",
          height: "4px",
          background: "linear-gradient(to bottom, #94a3b8, #64748b)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.6), 0 0 16px rgba(148,163,184,0.25)",
        }}
      />

      {/* ── Rail highlight shine ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "3.24rem",
          height: "1px",
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.35) 80%, transparent 100%)",
        }}
      />

      {/* ──────────────── SCROLLABLE TRAIN STRIP ──────────────────────────────── */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClickCapture={onClickCapture}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="absolute left-0 right-0 no-scrollbar cursor-grab active:cursor-grabbing"
        style={{
          bottom: "3.4rem",
          overflowX: "auto",
          overflowY: "visible",
          paddingLeft: "1rem",
          paddingRight: "3rem",
          paddingBottom: "0",
          paddingTop: "6rem",
        }}
      >
        <div className="flex items-end flex-nowrap" style={{ gap: 0 }}>

          {/* ──────────── Locomotive (Minimal Premium) ──────────── */}
          <div className="flex items-end shrink-0">
            <div
              className="relative shrink-0"
              style={{
                width: "clamp(8rem, 12vw, 11rem)",
                height: "clamp(4.2rem, 6.5vw, 5.8rem)",
                marginBottom: "18px",
              }}
            >
              {/* Main loco body */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: "2.5rem 6px 2px 2px",
                  background: "linear-gradient(160deg, #1e293b 0%, #0f172a 40%, #020617 100%)",
                  border: "1px solid #334155",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                {/* Front nose cowl highlight */}
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "40%",
                    height: "100%",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.03), transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* Cab window (sleek dark tint) */}
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "8px",
                    width: "35%",
                    height: "55%",
                    borderRadius: "1rem 0 0.2rem 0",
                    background: "linear-gradient(145deg, #020617 0%, #000000 100%)",
                    border: "1px solid #1e293b",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                    overflow: "hidden",
                  }}
                >
                  {/* window glare */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "40%",
                      background: "linear-gradient(to bottom right, rgba(255,255,255,0.08), transparent)",
                    }}
                  />
                </div>

                {/* Small side window */}
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "10px",
                    width: "18%",
                    height: "35%",
                    borderRadius: "2px",
                    background: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />

                {/* Minimal accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "#38bdf8",
                    opacity: 0.8,
                    boxShadow: "0 0 8px rgba(56,189,248,0.5)",
                  }}
                />

                {/* Number plate */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    right: "8px",
                    fontSize: "7px",
                    fontWeight: 800,
                    color: "#64748b",
                    letterSpacing: "0.2em",
                  }}
                >
                  ENG-1
                </div>

                {/* Headlight */}
                <div
                  style={{
                    position: "absolute",
                    left: "4px",
                    bottom: "18px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#fdf8f6",
                    boxShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4)",
                  }}
                />
                
                {/* Exhaust / ventilation slats */}
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: `${35 + i * 8}%`,
                      right: "12px",
                      width: "15%",
                      height: "1.5px",
                      background: "#020617",
                      borderBottom: "1px solid #334155",
                    }}
                  />
                ))}
              </div>

              {/* Loco wheels (sleek bogie) */}
              <div
                className="absolute flex items-center"
                style={{
                  bottom: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    height: "3px",
                    left: "2px",
                    right: "2px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#334155",
                    borderRadius: "2px",
                  }}
                />
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 30% 30%, #475569 0%, #1e293b 60%, #020617 100%)",
                      border: "2px solid #334155",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.9)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "5px",
                        borderRadius: "50%",
                        background: "#0f172a",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Gangway />
          </div>

          {/* ──────────── Coach cars ──────────── */}
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

      {/* ── Drag / scroll hint ── */}
      <div
        className="absolute hidden md:flex items-center gap-1.5 pointer-events-none"
        style={{
          bottom: "0.6rem",
          right: "1.2rem",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        <span>←</span>
        <span>DRAG TO SCROLL</span>
        <span>→</span>
      </div>
    </div>
  );
};
