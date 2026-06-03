"use client";

import React from "react";
import { useAdvancedPlayer } from "@/context/AdvancedPlayerContext";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const TimeDisplay = () => {
  const { currentTime, duration } = useAdvancedPlayer();

  return (
    <div className="text-white/80 text-sm font-medium tracking-wide font-mono pointer-events-none select-none">
      {formatTime(currentTime)} <span className="opacity-50">/</span> {formatTime(duration)}
    </div>
  );
};
