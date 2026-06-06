"use client";

import React from "react";
import { useAdvancedPlayer } from "./context";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const TimeDisplay = () => {
  const { currentTime, duration, isAdPlaying, adCurrentTime, adDuration } = useAdvancedPlayer();

  const displayTime = isAdPlaying ? adCurrentTime : currentTime;
  const displayDuration = isAdPlaying ? adDuration : duration;

  return (
    <div className="text-white/80 text-sm font-medium tracking-wide font-mono pointer-events-none select-none">
      {formatTime(displayTime)} <span className="opacity-50">/</span> {formatTime(displayDuration)}
    </div>
  );
};
