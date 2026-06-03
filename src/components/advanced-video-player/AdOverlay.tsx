"use client";

import React from "react";
import { useAdvancedPlayer } from "@/context/AdvancedPlayerContext";
import { SkipForward, Info } from "lucide-react";

export const AdOverlay = () => {
  const { adTimeRemaining, canSkipAd, skipAd, adTitle, adTimeUntilSkippable } = useAdvancedPlayer();

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="p-4 flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 flex items-center gap-3">
          <Info className="w-4 h-4 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold tracking-wide">
              Advertisement
            </span>
            <span className="text-white/60 text-xs font-medium">
              {adTitle || "Video will resume shortly"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area (Skip Button) */}
      <div className="p-6 flex justify-end items-end pb-20">
        <div className="pointer-events-auto">
          {canSkipAd ? (
            <button
              onClick={skipAd}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group"
            >
              Skip Ad
              <SkipForward className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
            </button>
          ) : (
            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white/80 px-6 py-3 rounded-full font-medium text-sm shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              {adTimeUntilSkippable > 0 
                ? `You can skip to video in ${Math.ceil(adTimeUntilSkippable)}s`
                : `Video resumes in ${Math.ceil(adTimeRemaining)}s`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
