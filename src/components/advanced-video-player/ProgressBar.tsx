"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAdvancedPlayer } from "./context";

export const ProgressBar = () => {
  const { currentTime, duration, seek, isAdPlaying, adCurrentTime, adDuration, getThumbnail, chapters } = useAdvancedPlayer();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTimeValue, setHoverTimeValue] = useState<number>(0);
  const [hoverChapterTitle, setHoverChapterTitle] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailStyle, setThumbnailStyle] = useState<React.CSSProperties>({});
  const [thumbWidth, setThumbWidth] = useState<number>(160);
  const [thumbScale, setThumbScale] = useState<number>(1);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
        setHoverTimeValue(hoverTime);
        
        if (chapters && chapters.length > 0) {
          const currentChapter = chapters.find(c => hoverTime >= c.startTime && hoverTime <= (c.endTime || duration));
          if (currentChapter) {
            setHoverChapterTitle(currentChapter.title);
          } else {
            setHoverChapterTitle(null);
          }
        }
        
        getThumbnail(hoverTime).then((thumb) => {
          if (thumb) {
            setThumbnailUrl(thumb.uris[0]);
            
            // Client-side scaling to strictly enforce max 160x90 bounding box 
            // for older videos processed before the backend update
            let newScale = 1;
            if (thumb.imageHeight > 90) {
              newScale = 90 / thumb.imageHeight;
            } else if (thumb.imageWidth > 160) {
              newScale = 160 / thumb.imageWidth;
            }
            
            setThumbWidth(thumb.imageWidth * newScale);
            setThumbScale(newScale);
            
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
          <div 
            className="absolute bottom-4 pointer-events-none flex flex-col items-center gap-1.5"
            style={{ 
              left: `clamp(${thumbWidth / 2}px, ${hoverPosition}%, calc(100% - ${thumbWidth / 2}px))`,
              transform: `translateX(-50%)`,
              transformOrigin: "bottom center"
            }}
          >
            {thumbnailUrl && (
              <div 
                className="bg-black rounded overflow-hidden shadow-lg border border-white/20"
                style={{
                  transform: `scale(${thumbScale})`,
                  transformOrigin: "bottom center"
                }}
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
            <div className="bg-black/90 px-2 py-1 rounded flex flex-col items-center shadow-md">
              {hoverChapterTitle && <span className="text-white/80 text-[10px] uppercase mb-0.5 font-bold tracking-wider max-w-[140px] truncate">{hoverChapterTitle}</span>}
              <span className="text-white text-xs font-semibold tracking-wide">{formatTime(hoverTimeValue)}</span>
            </div>
          </div>
        </>
      )}
      
      {/* Chapter Gaps */}
      {!isAdPlaying && duration > 0 && chapters && chapters.map((chapter, i) => {
        if (i === chapters.length - 1) return null;
        const leftPercent = (chapter.endTime / duration) * 100;
        if (leftPercent >= 100 || leftPercent <= 0) return null;
        return (
          <div 
            key={`chapter-${i}`}
            className="absolute top-0 bottom-0 w-[2px] bg-black/60 z-10 pointer-events-none"
            style={{ left: `${leftPercent}%` }}
          />
        );
      })}

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
