import React, { useState } from "react";
import { ViewportState, ProcessedSeat } from "./types";

interface MinimapProps {
  viewport: ViewportState;
  processedSeats: ProcessedSeat[];
  selectedSeats: Set<string>;
  bookedSeats: Set<string>;
  columns: number;
  isScrolling: boolean;
  onMinimapClick: (x: number, y: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  viewport,
  processedSeats,
  selectedSeats,
  bookedSeats,
  columns,
  isScrolling,
  onMinimapClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isScrollable =
    viewport.scrollWidth > viewport.width + 1 ||
    viewport.scrollHeight > viewport.height + 1;

  const isVisible = isScrollable && (isScrolling || isHovered);

  const sWidth = viewport.scrollWidth || 1;
  const sHeight = viewport.scrollHeight || 1;
  const mapAspectRatio = sWidth / sHeight;

  const vLeft = (viewport.x / sWidth) * 100;
  const vTop = (viewport.y / sHeight) * 100;
  const vWidth = (viewport.width / sWidth) * 100;
  const vHeight = (viewport.height / sHeight) * 100;

  const gridWidth = 88 + columns * 40;
  const offsetLeft = Math.max(0, (sWidth - gridWidth) / 2);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 origin-bottom-right ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="absolute -inset-3 bg-sky-500/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2 flex justify-between items-center">
          <span>Minimap</span>
        </div>

        <div
          className="relative rounded-md overflow-hidden cursor-crosshair bg-slate-950 border border-slate-800 shadow-inner"
          style={{
            aspectRatio: `${sWidth} / ${sHeight}`,
            width: mapAspectRatio > 1 ? "140px" : "auto",
            height: mapAspectRatio <= 1 ? "140px" : "auto",
            maxWidth: "140px",
            maxHeight: "140px",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            onMinimapClick(x, y);
          }}
        >
          {/* SEATS */}
          {processedSeats.map((s) => {
            const leftPx = offsetLeft + 48 + (s.col - 2) * 40;
            const topPx = 16 + (s.row - 1) * 40;
            const sizePctW = (32 / sWidth) * 100;
            const sizePctH = (32 / sHeight) * 100;

            return (
              <div
                key={s.id}
                className={`absolute rounded-[1px] transition-colors ${
                  selectedSeats.has(s.id)
                    ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                    : bookedSeats.has(s.id)
                      ? "bg-slate-800"
                      : "bg-slate-500/70"
                }`}
                style={{
                  left: `${(leftPx / sWidth) * 100}%`,
                  top: `${(topPx / sHeight) * 100}%`,
                  width: `${sizePctW}%`,
                  height: `${sizePctH}%`,
                }}
              />
            );
          })}

          {/* VIEWPORT BOX */}
          <div
            className="absolute border-[1.5px] border-sky-400 bg-sky-400/10 rounded-[3px] shadow-[0_0_15px_rgba(56,189,248,0.25)] pointer-events-none transition-all duration-75 ease-out"
            style={{
              left: `${Math.max(0, Math.min(100 - vWidth, vLeft))}%`,
              top: `${Math.max(0, Math.min(100 - vHeight, vTop))}%`,
              width: `${Math.min(100, vWidth)}%`,
              height: `${Math.min(100, vHeight)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
