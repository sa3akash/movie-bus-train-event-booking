"use client";

import React from "react";
import { useAdvancedPlayer } from "./context";

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const TimeDisplay = () => {
  const {
    currentTime,
    duration,
    isAdPlaying,
    adCurrentTime,
    adDuration,
    isLiveState,
    seekRange,
    goToLive,
    chapters,
  } = useAdvancedPlayer();

  const currentChapter = React.useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    return chapters.find((c: any) => currentTime >= c.startTime && currentTime <= (c.endTime || duration)) || null;
  }, [chapters, currentTime, duration]);

  if (isAdPlaying) {
    return (
      <div className="text-white/80 text-sm font-medium tracking-wide font-mono pointer-events-none select-none">
        {formatTime(adCurrentTime)} <span className="opacity-50">/</span>{" "}
        {formatTime(adDuration)}
      </div>
    );
  }

  if (isLiveState) {
    const isAtLiveEdge = currentTime >= seekRange.end - 10; // Within 10s of live edge
    return (
      <div className="flex items-center gap-2">
        {!isAtLiveEdge && (
          <div className="text-white/80 text-sm font-medium tracking-wide font-mono select-none">
            -{formatTime(seekRange.end - currentTime)}
          </div>
        )}
        <button
          onClick={goToLive}
          className={`flex items-center gap-1.5 text-xs font-bold tracking-wider px-2 py-0.5 rounded transition-colors ${isAtLiveEdge ? "text-white cursor-default pointer-events-none" : "text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isAtLiveEdge ? "bg-red-500" : "bg-white/40"}`}
          />
          LIVE
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pointer-events-none select-none">
      <div className="text-white/80 text-sm font-medium tracking-wide font-mono">
        {formatTime(currentTime)} <span className="opacity-50">/</span>{" "}
        {formatTime(duration)}
      </div>
      {currentChapter && (
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide truncate">
          <span className="opacity-50 text-[10px]">•</span>
          <span className="max-w-[150px] md:max-w-[300px] truncate">{currentChapter.title}</span>
        </div>
      )}
    </div>
  );
};
