"use client";

import { CoachData, TYPE_BADGE } from "./types";

// ─── Minimalist Premium Accents ────────────────────────────────────────────────

// We use a universal dark metallic body for all coaches.
// Only the accent LED stripe and active glows change per class.
const TYPE_ACCENT = {
  economy:  { color: "#38bdf8", glow: "rgba(56,189,248,0.6)" },
  business: { color: "#fbbf24", glow: "rgba(251,191,36,0.6)" },
  first:    { color: "#a855f7", glow: "rgba(168,85,247,0.6)" },
};

// ─── Single wheel ─────────────────────────────────────────────────────────────

const Wheel = ({ size = 18 }: { size?: number }) => (
  <div
    style={{
      width:  size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, #475569 0%, #1e293b 60%, #020617 100%)",
      border: "2px solid #334155",
      boxShadow: "0 2px 6px rgba(0,0,0,0.9)",
      position: "relative",
      flexShrink: 0,
    }}
  >
    {/* hub cap */}
    <div
      style={{
        position: "absolute",
        inset: "4px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, #64748b, #334155)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
      }}
    />
    {/* hub bolt */}
    <div
      style={{
        position: "absolute",
        inset: "6px",
        borderRadius: "50%",
        background: "#0f172a",
      }}
    />
  </div>
);

// ─── Bogie (axle frame with 2 wheels + frame bar) ─────────────────────────────

const Bogie = ({ x }: { x: string }) => (
  <div
    style={{
      position: "absolute",
      bottom: "-15px",
      left: x,
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    {/* bogie frame */}
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
        boxShadow: "0 1px 3px rgba(0,0,0,0.8)",
      }}
    />
    {/* bogie center block */}
    <div
      style={{
        position: "absolute",
        width: "6px",
        height: "6px",
        top: "-2px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1e293b",
        borderRadius: "1px",
        border: "1px solid #475569",
        zIndex: 2,
      }}
    />
    <Wheel size={18} />
    <Wheel size={18} />
  </div>
);

// ─── Gangway connector ────────────────────────────────────────────────────────

export const Gangway = () => (
  <div
    className="shrink-0 self-end"
    style={{
      width: "10px",
      height: "32px",
      marginBottom: "20px",
      background: "#020617",
      borderTop: "1px solid #1e293b",
      borderBottom: "1px solid #1e293b",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      padding: "2px 1px",
      boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)",
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          height: "1px",
          background: "#1e293b",
        }}
      />
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
  const accent = TYPE_ACCENT[coach.type];
  const avail = coach.layout.seats.filter((s) => s.isActive).length;
  const total = coach.layout.seats.length;
  const pct   = Math.round((avail / total) * 100);
  const dotColor = pct > 55 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";

  const W = "clamp(8.5rem, 13vw, 11rem)";
  const H = "clamp(4.2rem, 6.5vw, 5.5rem)";

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 focus:outline-none group"
      style={{ width: W, height: H, marginBottom: "22px" }}
    >
      {/* ── Main coach body (Sleek Dark Metal) ── */}
      <div
        className="absolute transition-all duration-300"
        style={{
          inset: 0,
          borderRadius: "4px 4px 2px 2px",
          // Deep slate metallic gradient
          background: "linear-gradient(to bottom, #1e293b 0%, #0f172a 40%, #020617 100%)",
          border: active ? `1px solid ${accent.color}` : `1px solid #334155`,
          borderTop: active ? `1px solid ${accent.color}` : `1px solid #475569`,
          boxShadow: active
            ? `0 0 15px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.8)`
            : `0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
          overflow: "hidden",
        }}
      >
        {/* ── Top edge highlight ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "15%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ── Minimalist LED Accent Stripe ── */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: 0,
            right: 0,
            height: "2px",
            background: active ? accent.color : "#334155",
            boxShadow: active ? `0 0 8px ${accent.glow}, 0 0 16px ${accent.glow}` : "none",
            transition: "all 0.3s ease",
          }}
        />

        {/* ── Windows ── */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            right: "8px",
            display: "flex",
            gap: "4px",
            alignItems: "flex-start",
          }}
        >
          {/* Door panel (left side) */}
          <div
            style={{
              width: "8px",
              flexShrink: 0,
              height: "clamp(16px, 2.5vw, 22px)",
              background: "#0f172a",
              borderRadius: "1px",
              border: `1px solid #1e293b`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {[0,1].map((i) => (
              <div key={i} style={{ width: "2px", height: "1px", background: `#334155`, borderRadius: "1px" }} />
            ))}
          </div>

          {/* Windows (5 panes) - Dark tinted glass */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "clamp(16px, 2.5vw, 22px)",
                borderRadius: "2px",
                // Very dark, almost black tinted windows
                background: "linear-gradient(145deg, #020617 0%, #000000 100%)",
                border: "1px solid #0f172a",
                borderTop: "1px solid #1e293b",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle glass reflection */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "40%",
                  background: "linear-gradient(to bottom right, rgba(255,255,255,0.06), transparent)",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Coach number label ── */}
        <div
          style={{
            position: "absolute",
            bottom: "2px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "7px",
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: active ? accent.color : "#64748b",
            textShadow: active ? `0 0 6px ${accent.glow}` : "none",
            transition: "all 0.3s ease",
          }}
        >
          {coach.label}
        </div>

        {/* ── Subtle rivets ── */}
        {[
          { top: "3px",  left:  "3px" },
          { top: "3px",  right: "3px" },
          { bottom: "4px", left:  "3px" },
          { bottom: "4px", right: "3px" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "2px",
              height: "2px",
              borderRadius: "50%",
              background: "#334155",
              ...pos,
            }}
          />
        ))}
      </div>

      {/* ── Dual bogies undercarriage ── */}
      <Bogie x="25%" />
      <Bogie x="75%" />

      {/* ── Type badge (subtle dark mode) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-sm text-[7px] font-bold text-slate-300 whitespace-nowrap transition-all duration-300 uppercase tracking-widest"
        style={{
          bottom: "calc(100% + 14px)",
          background: "#0f172a",
          border: `1px solid ${active ? accent.color : "#334155"}`,
          opacity: active ? 1 : 0.6,
          boxShadow: active ? `0 0 10px ${accent.glow}, 0 2px 4px rgba(0,0,0,0.5)` : "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {badge.label}
      </div>

      {/* ── Availability chip (minimalist) ── */}
      {active && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap"
          style={{
            bottom: "calc(100% + 32px)",
            background: "rgba(2,6,23,0.8)",
            border: `1px solid #1e293b`,
            borderRadius: "12px",
            padding: "2px 8px",
            fontSize: "7px",
            fontWeight: 600,
            color: "#cbd5e1",
            boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: dotColor,
              boxShadow: `0 0 5px ${dotColor}`,
            }}
          />
          {avail}/{total} free
        </div>
      )}
    </button>
  );
};

// ─── CoachItem ────────────────────────────────────────────────────────────────

interface CoachItemProps {
  coach: CoachData;
  isActive: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
}

export const CoachItem = ({ coach, isActive, isLast, onSelect }: CoachItemProps) => {
  const accent = TYPE_ACCENT[coach.type];

  return (
    <div className="flex items-end">
      <div className="relative flex flex-col items-center">
        {/* VIEWING beacon (minimal) */}
        {isActive && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
            style={{ bottom: "calc(100% + 3.2rem)" }}
          >
            <div
              style={{
                color: accent.color,
                fontSize: "7px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                padding: "2px 8px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textShadow: `0 0 8px ${accent.glow}`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: accent.color, boxShadow: `0 0 6px ${accent.glow}` }} />
              VIEWING
            </div>
            {/* Minimal connector line */}
            <div
              style={{
                width: "1px",
                height: "24px",
                background: `linear-gradient(to bottom, ${accent.color}, transparent)`,
                opacity: 0.5,
                marginTop: "2px",
              }}
            />
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
};
