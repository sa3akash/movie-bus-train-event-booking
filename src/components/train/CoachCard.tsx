"use client";

import { CoachData, TYPE_BADGE } from "./types";

// ─── Real Train Paint Schemes (Classic Luxury Metallic) ─────────────────────────

const TYPE_PAINT = {
  economy:  { color: "#38bdf8", trim: "#0284c7", body: ["#1e3a5f", "#0f2540", "#081326"] }, // Deep Steel Blue
  business: { color: "#f59e0b", trim: "#b45309", body: ["#3f1d1d", "#261010", "#120707"] }, // Rich Burgundy/Crimson
  first:    { color: "#fbbf24", trim: "#d97706", body: ["#0f2820", "#081612", "#030a08"] }, // Deep Forest Green
};

// ─── Single wheel ─────────────────────────────────────────────────────────────

const Wheel = ({ size = 18 }: { size?: number }) => (
  <div
    style={{
      width:  size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #64748b 0%, #334155 50%, #0f172a 100%)",
      border: "2px solid #1e293b",
      boxShadow: "0 2px 5px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.15)",
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
        background: "radial-gradient(circle at 40% 40%, #94a3b8, #475569)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
      }}
    />
  </div>
);

// ─── Bogie ────────────────────────────────────────────────────────────────────

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
    {/* heavy iron bogie frame */}
    <div
      style={{
        position: "absolute",
        height: "5px",
        left: "-2px",
        right: "-2px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "linear-gradient(to bottom, #475569, #1e293b)",
        borderRadius: "2px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.8)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "8px",
        height: "8px",
        top: "-3px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#334155",
        borderRadius: "1px",
        border: "1px solid #0f172a",
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
      width: "12px",
      height: "36px",
      marginBottom: "20px",
      background: "repeating-linear-gradient(to bottom, #1e293b 0px, #1e293b 4px, #0f172a 4px, #0f172a 6px)",
      borderTop: "2px solid #020617",
      borderBottom: "2px solid #020617",
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.8)",
    }}
  />
);

// ─── CoachCard ────────────────────────────────────────────────────────────────

interface CoachCardProps {
  coach: CoachData;
  active: boolean;
  onClick: () => void;
}

export const CoachCard = ({ coach, active, onClick }: CoachCardProps) => {
  const badge = TYPE_BADGE[coach.type];
  const paint = TYPE_PAINT[coach.type];
  const avail = coach.layout.seats.filter((s) => s.isActive).length;
  const total = coach.layout.seats.length;
  const pct   = Math.round((avail / total) * 100);
  const dotColor = pct > 55 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";

  const W = "clamp(9rem, 14vw, 12rem)";
  const H = "clamp(4.5rem, 6.8vw, 5.8rem)";

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 focus:outline-none group transition-all duration-300"
      style={{ 
        width: W, 
        height: H, 
        marginBottom: "22px",
        transform: active ? "scale(1.03) translateY(-2px)" : "scale(1)",
        zIndex: active ? 10 : 1,
      }}
    >
      {/* ── Main body (Rich Metallic Paint) ── */}
      <div
        className="absolute transition-all duration-300"
        style={{
          inset: 0,
          borderRadius: "6px 6px 3px 3px",
          background: `linear-gradient(160deg, ${paint.body[0]} 0%, ${paint.body[1]} 40%, ${paint.body[2]} 100%)`,
          border: active ? `1.5px solid ${paint.color}` : `1px solid ${paint.trim}`,
          boxShadow: active
            ? `0 0 20px rgba(0,0,0,0.6), 0 0 15px ${paint.color}66, inset 0 2px 4px rgba(255,255,255,0.1)`
            : `0 4px 12px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05)`,
          overflow: "hidden",
        }}
      >
        {/* ── Roof curve highlight ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "15%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ── Thick colored horizontal band ── */}
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: 0,
            right: 0,
            height: "8px",
            background: active ? paint.color : paint.trim,
            boxShadow: active ? `0 0 10px ${paint.color}` : "none",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            borderBottom: "1px solid rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        />

        {/* ── Coach Name cleanly on the body ── */}
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {coach.label}
        </div>

        {/* ── Windows (Warm interior glow) ── */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "10px",
            right: "10px",
            display: "flex",
            gap: "6px",
            height: "28%",
          }}
        >
          {/* Door panel (left side) */}
          <div
            style={{
              width: "12px",
              flexShrink: 0,
              height: "140%",
              background: `linear-gradient(to bottom, ${paint.body[1]}, ${paint.body[2]})`,
              border: `1px solid rgba(0,0,0,0.6)`,
              borderRadius: "2px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
            }}
          >
            <div style={{ width: "6px", height: "10px", background: "rgba(0,0,0,0.8)", borderRadius: "1px" }} />
          </div>

          {/* Individual Windows */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "3px",
                // Warm, inviting interior light
                background: "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)",
                border: "1px solid #000000",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(253,224,71,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Sillhouette of seats/people inside */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: "10%",
                  width: "30%",
                  height: "40%",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "2px 2px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "10%",
                  width: "30%",
                  height: "40%",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "2px 2px 0 0",
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
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Dual bogies undercarriage ── */}
      <Bogie x="22%" />
      <Bogie x="78%" />

      {/* ── Type badge ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[7px] font-black text-white whitespace-nowrap transition-all duration-300 uppercase tracking-widest shadow-md"
        style={{
          bottom: "calc(100% + 14px)",
          background: paint.trim,
          border: `1px solid ${paint.color}`,
          opacity: active ? 1 : 0.8,
          boxShadow: active ? `0 0 15px ${paint.color}88, 0 2px 4px rgba(0,0,0,0.5)` : "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {badge.label}
      </div>

      {/* ── Availability chip ── */}
      {active && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap"
          style={{
            bottom: "calc(100% + 36px)",
            background: "rgba(0,0,0,0.85)",
            border: `1px solid ${paint.color}`,
            borderRadius: "12px",
            padding: "3px 10px",
            fontSize: "7.5px",
            fontWeight: 800,
            color: "#ffffff",
            boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 15px ${paint.color}44`,
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: dotColor,
              boxShadow: `0 0 6px ${dotColor}`,
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
  const paint = TYPE_PAINT[coach.type];

  return (
    <div className="flex items-end">
      <div className="relative flex flex-col items-center">
        {/* VIEWING beacon */}
        {isActive && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
            style={{ bottom: "calc(100% + 3.5rem)" }}
          >
            <div
              style={{
                color: "#ffffff",
                background: paint.color,
                fontSize: "7px",
                fontWeight: 900,
                letterSpacing: "0.2em",
                padding: "3px 10px",
                borderRadius: "12px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: `0 4px 8px rgba(0,0,0,0.4), 0 0 15px ${paint.color}99`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff", boxShadow: "0 0 4px #fff" }} />
              VIEWING
            </div>
            {/* Connector line */}
            <div
              style={{
                width: "2px",
                height: "26px",
                background: `linear-gradient(to bottom, ${paint.color}, transparent)`,
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
