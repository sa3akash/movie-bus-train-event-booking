"use client";

import React, { useRef, useState } from "react";
import { useAdvancedPlayer } from "./context";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

export const VolumeControl = () => {
  const { volume, setVolume, isMuted, toggleMute } = useAdvancedPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayVolume = isMuted ? 0 : volume;

  const handlePointerDown = (e: React.PointerEvent) => {
    updateVolume(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) {
      updateVolume(e);
    }
  };

  const updateVolume = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let newVol = (e.clientX - rect.left) / rect.width;
    newVol = Math.max(0, Math.min(1, newVol));
    setVolume(newVol);
  };

  const VolumeIcon = displayVolume === 0 ? VolumeX : displayVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div 
      className="hidden md:flex items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={toggleMute}
        className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      {/* Expandable slider container */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isHovered ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
        <div 
          ref={sliderRef}
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none"
            style={{ width: `${displayVolume * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow pointer-events-none"
            style={{ left: `${displayVolume * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>
    </div>
  );
};
