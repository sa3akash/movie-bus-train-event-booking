"use client";

import React from "react";
import { useAdvancedPlayer } from "@/context/AdvancedPlayerContext";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

export const PlaybackButtons = () => {
  const { isPlaying, togglePlay, seek, currentTime, isAdPlaying } = useAdvancedPlayer();

  const handleRewind = () => {
    if (!isAdPlaying) seek(Math.max(0, currentTime - 10));
  };

  const handleForward = () => {
    if (!isAdPlaying) seek(currentTime + 10);
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleRewind}
        disabled={isAdPlaying}
        className="p-1.5 text-white/80 hover:text-white disabled:opacity-50 transition-colors rounded-full hover:bg-white/10"
        title="Rewind 10s"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      <button 
        onClick={togglePlay}
        className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 rounded-full"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
      </button>

      <button 
        onClick={handleForward}
        disabled={isAdPlaying}
        className="p-1.5 text-white/80 hover:text-white disabled:opacity-50 transition-colors rounded-full hover:bg-white/10"
        title="Forward 10s"
      >
        <RotateCw className="w-5 h-5" />
      </button>
    </div>
  );
};
