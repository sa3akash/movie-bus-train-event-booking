"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAdvancedPlayer } from "@/context/AdvancedPlayerContext";

export const ProgressBar = () => {
  const { currentTime, duration, seek, isAdPlaying, adCurrentTime, adDuration, getThumbnail } = useAdvancedPlayer();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailStyle, setThumbnailStyle] = useState<React.CSSProperties>({});
  const [thumbWidth, setThumbWidth] = useState<number>(160);

  const displayTime = isAdPlaying ? adCurrentTime : currentTime;
  const displayDuration = isAdPlaying ? adDuration : duration;
  const percentage = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAdPlaying) return;
    setIsDragging(true);
    updateProgress(e);
    
    // Capture pointer to allow dragging outside element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isAdPlaying) return;
    
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      let newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      newPercent = Math.max(0, Math.min(100, newPercent));
      setHoverPosition(newPercent);
      
      if (duration > 0) {
        const hoverTime = (newPercent / 100) * duration;
        getThumbnail(hoverTime).then((thumb) => {
          if (thumb) {
            setThumbnailUrl(thumb.uris[0]);
            setThumbWidth(thumb.imageWidth);
            setThumbnailStyle({
              width: `${thumb.imageWidth}px`,
              height: `${thumb.imageHeight}px`,
              backgroundPosition: `-${thumb.positionX}px -${thumb.positionY}px`,
              backgroundSize: "max-content",
            });
          }
        });
      }
    }

    if (isDragging) {
      updateProgress(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isAdPlaying) return;
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerLeave = () => {
    setHoverPosition(null);
  };

  const updateProgress = (e: React.PointerEvent) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let newPercent = (e.clientX - rect.left) / rect.width;
    newPercent = Math.max(0, Math.min(1, newPercent));
    seek(newPercent * duration);
  };

  return (
    <div 
      className={`relative w-full h-1.5 bg-white/20 rounded-full group transition-all duration-200 ${isAdPlaying ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:h-2'}`}
      ref={progressBarRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Hover preview bar and thumbnail */}
      {!isAdPlaying && hoverPosition !== null && (
        <>
          <div 
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full pointer-events-none"
            style={{ width: `${hoverPosition}%` }}
          />
          {thumbnailUrl && (
            <div 
              className="absolute bottom-4 -translate-x-1/2 pointer-events-none bg-black rounded overflow-hidden shadow-lg border border-white/20"
              style={{ left: `clamp(${thumbWidth / 2}px, ${hoverPosition}%, calc(100% - ${thumbWidth / 2}px))` }}
            >
              <div
                style={{
                  ...thumbnailStyle,
                  backgroundImage: `url(${thumbnailUrl})`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          )}
        </>
      )}
      
      {/* Current progress bar */}
      <div 
        className={`absolute top-0 left-0 h-full ${isAdPlaying ? 'bg-yellow-400' : 'bg-primary'} rounded-full pointer-events-none`}
        style={{ width: `${percentage}%` }}
      >
        {/* Scrubber Knob */}
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-transform ${isDragging ? 'scale-125' : (isAdPlaying ? 'scale-0' : 'scale-0 group-hover:scale-100')} translate-x-1/2`} />
      </div>
    </div>
  );
};
