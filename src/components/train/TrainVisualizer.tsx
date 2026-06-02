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
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);

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
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDragged.current) {
      e.stopPropagation();
      hasDragged.current = false;
    }
  }, []);

  // ── Touch drag ──────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    dragStartX.current = e.touches[0].clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft =
      scrollStart.current - (e.touches[0].clientX - dragStartX.current);
  }, []);

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{
        height: "28rem",
        borderRadius: "0 0 2.5rem 2.5rem",
        // Rich dusk sky gradient
        background:
          "linear-gradient(to bottom, #0a0a1a 0%, #0d1b3e 20%, #1a1040 40%, #2d1b4e 55%, #1a0d2e 70%, #0d1520 85%, #071018 100%)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.8)",
      }}
    >
      {/* ── Stars ── */}
      {[
        [12, 8],
        [25, 5],
        [38, 12],
        [52, 4],
        [65, 9],
        [78, 6],
        [88, 14],
        [18, 18],
        [45, 7],
        [70, 16],
        [92, 8],
        [5, 22],
        [33, 3],
        [60, 20],
        [82, 11],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: i % 3 === 0 ? "2px" : "1px",
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
          top: "6%",
          right: "8%",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #d97706)",
          boxShadow:
            "0 0 24px rgba(253,230,138,0.5), 0 0 60px rgba(253,230,138,0.2)",
        }}
      />
      {/* Moon crescent shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "5.2%",
          right: "6.8%",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(13,27,62,0.7)",
        }}
      />

      {/* ── Distant mountains ── */}
      <svg
        className="absolute bottom-22 left-0 w-full pointer-events-none"
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
        className="absolute bottom-20 pointer-events-none"
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
          background:
            "linear-gradient(to top, #050d14 0%, #071018 60%, transparent 100%)",
        }}
      />

      {/* ── Ground glow (ambient light from train) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "0",
          height: "4rem",
          background:
            "radial-gradient(ellipse at 40% 100%, rgba(56,189,248,0.08) 0%, rgba(168,85,247,0.06) 50%, transparent 80%)",
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
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(100,116,139,0.3)",
        }}
      />

      {/* ── Upper rail (far) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: "3.2rem",
          height: "4px",
          background: "linear-gradient(to bottom, #94a3b8, #64748b)",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.6), 0 0 16px rgba(148,163,184,0.25)",
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
          paddingTop: "10rem",
        }}
      >
        <div className="flex items-end flex-nowrap" style={{ gap: 0 }}>
          {/* ──────────── Locomotive (Classic Luxury Metallic) ──────────── */}
          <div className="flex items-end shrink-0">
            <div
              className="relative shrink-0"
              style={{
                width: "clamp(9rem, 14vw, 12rem)",
                height: "clamp(4.5rem, 6.8vw, 5.8rem)",
                marginBottom: "22px",
                transform: "scale(1)",
              }}
            >
              {/* Main loco body (Deep Steel Blue Metallic) */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: "3rem 6px 3px 3px",
                  background:
                    "linear-gradient(160deg, #1e3a5f 0%, #0f2540 40%, #081326 100%)",
                  border: "1px solid #0284c7",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)",
                  overflow: "hidden",
                }}
              >
                {/* Roof curve highlight */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "15%",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* Front nose highlight */}
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "40%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* Thick colored horizontal band */}
                <div
                  style={{
                    position: "absolute",
                    top: "55%",
                    left: 0,
                    right: 0,
                    height: "8px",
                    background: "#38bdf8",
                    boxShadow: "0 0 10px rgba(56,189,248,0.5)",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    borderBottom: "1px solid rgba(0,0,0,0.3)",
                  }}
                />

                {/* Engine Name (Premium Metallic Text - Bottom Left) */}
                <div
                  style={{
                    position: "absolute",
                    top: "75%",
                    right: "12px",
                    fontSize: "9px",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.95)",
                    letterSpacing: "0.2em",
                    textShadow:
                      "1px 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(255,255,255,0.4)",
                    zIndex: 10,
                  }}
                >
                  ENGINE
                </div>

                {/* Cab window (Warm interior glow) */}
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "14%",
                    width: "35%",
                    height: "35%",
                    borderRadius: "1rem 0 0.2rem 0",
                    background:
                      "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)",
                    border: "1px solid #000000",
                    boxShadow:
                      "inset 0 2px 6px rgba(0,0,0,0.8), 0 0 15px rgba(253,224,71,0.3)",
                    overflow: "hidden",
                  }}
                >
                  {/* window silhouette */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "10%",
                      width: "40%",
                      height: "60%",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  {/* Glass glare */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "40%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
                    }}
                  />
                </div>

                {/* Small side window */}
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "14%",
                    width: "18%",
                    height: "30%",
                    borderRadius: "2px",
                    background:
                      "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)",
                    border: "1px solid #000000",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                  }}
                >
                  {/* Glass glare */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "40%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
                    }}
                  />
                </div>

                {/* Headlight */}
                <div
                  style={{
                    position: "absolute",
                    left: "3px",
                    bottom: "20px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#fef08a",
                    boxShadow:
                      "0 0 20px rgba(253,224,71,1), 0 0 50px rgba(253,224,71,0.6)",
                  }}
                />

                {/* Exhaust / ventilation slats */}
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "20%",
                      right: `${35 + i * 8}%`,
                      width: "3%",
                      height: "20%",
                      background: "#081326",
                      borderLeft: "1px solid #1e3a5f",
                    }}
                  />
                ))}
              </div>

              {/* Loco wheels (Heavy Bogie) */}
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
                    height: "6px",
                    left: "-4px",
                    right: "-4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "linear-gradient(to bottom, #475569, #1e293b)",
                    borderRadius: "3px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.8)",
                  }}
                />
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 35%, #64748b 0%, #334155 50%, #0f172a 100%)",
                      border: "2px solid #1e293b",
                      boxShadow:
                        "0 2px 5px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.15)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "5px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 40% 40%, #94a3b8, #475569)",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
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
