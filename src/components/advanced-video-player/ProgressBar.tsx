"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAdvancedPlayer } from "./context";

export const ProgressBar = () => {
  const { videoRef, currentTime, duration, seek, isAdPlaying, adCurrentTime, adDuration, getThumbnail, chapters, isLiveState, seekRange } = useAdvancedPlayer();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTimeValue, setHoverTimeValue] = useState<number>(0);
  const [hoverChapterTitle, setHoverChapterTitle] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailStyle, setThumbnailStyle] = useState<React.CSSProperties>({});
  const [thumbWidth, setThumbWidth] = useState<number>(160);
  const [thumbScale, setThumbScale] = useState<number>(1);
  const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffer = () => {
      const ranges = [];
      for (let i = 0; i < video.buffered.length; i++) {
        ranges.push({
          start: video.buffered.start(i),
          end: video.buffered.end(i)
        });
      }
      setBufferedRanges(ranges);
    };

    video.addEventListener('progress', updateBuffer);
    video.addEventListener('timeupdate', updateBuffer);
    updateBuffer();

    return () => {
      video.removeEventListener('progress', updateBuffer);
      video.removeEventListener('timeupdate', updateBuffer);
    };
  }, [videoRef]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const dvrWindow = isLiveState ? Math.max(0, seekRange.end - seekRange.start) : 0;
  const isDVR = isLiveState && dvrWindow > 5; // Need at least 5s window to seek

  let percentage = 0;
  if (isAdPlaying) {
    percentage = adDuration > 0 ? (adCurrentTime / adDuration) * 100 : 0;
  } else if (isLiveState) {
    percentage = isDVR ? ((currentTime - seekRange.start) / dvrWindow) * 100 : 100;
  } else {
    percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  }
  percentage = Math.max(0, Math.min(100, percentage || 0));

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
      
      if (!isAdPlaying && (duration > 0 || isLiveState)) {
        let hoverTime = 0;
        if (isLiveState) {
          hoverTime = isDVR ? seekRange.start + (newPercent / 100) * dvrWindow : seekRange.end;
        } else {
          hoverTime = (newPercent / 100) * duration;
        }
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
    if (!progressBarRef.current || (duration === 0 && !isDVR)) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let newPercent = (e.clientX - rect.left) / rect.width;
    newPercent = Math.max(0, Math.min(1, newPercent));
    
    if (isLiveState && isDVR) {
      seek(seekRange.start + newPercent * dvrWindow);
    } else if (!isLiveState) {
      seek(newPercent * duration);
    }
  };

  return (
    <div 
      className={`relative w-full py-3 group -my-3 touch-none ${isAdPlaying || (isLiveState && !isDVR) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      ref={progressBarRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div className="relative w-full h-1.5 bg-white/20 rounded-full transition-all duration-200 group-hover:h-2">
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
                className="hidden md:block bg-black rounded-sm overflow-hidden shadow-lg border border-white/20"
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
            <div className="bg-black/90 px-2 py-1.5 rounded flex items-center gap-1.5 shadow-md">
              <span className="text-white text-xs font-semibold tracking-wide">
                {isLiveState ? (
                  hoverTimeValue >= seekRange.end - 5 ? "LIVE" : `-${formatTime(Math.max(0, seekRange.end - hoverTimeValue))}`
                ) : (
                  formatTime(hoverTimeValue)
                )}
              </span>
              {/* {hoverChapterTitle && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-white/80 text-[11px] font-medium tracking-wide max-w-[140px] truncate">
                    {hoverChapterTitle}
                  </span>
                </>
              )} */}
            </div>
          </div>
        </>
      )}
      
      {/* Chapter Gaps */}
      {!isAdPlaying && (duration > 0 || isLiveState) && chapters && chapters.map((chapter, i) => {
        if (i === chapters.length - 1) return null;
        
        let leftPercent = 0;
        if (isLiveState && isDVR) {
          leftPercent = ((chapter.endTime - seekRange.start) / dvrWindow) * 100;
        } else if (!isLiveState) {
          leftPercent = (chapter.endTime / duration) * 100;
        }
        
        if (leftPercent >= 100 || leftPercent <= 0) return null;
        return (
          <div 
            key={`chapter-${i}`}
            className="absolute top-0 bottom-0 w-[2px] bg-black/60 z-10 pointer-events-none"
            style={{ left: `${leftPercent}%` }}
          />
        );
      })}

      {/* Buffered Ranges */}
      {!isAdPlaying && bufferedRanges.map((range, i) => {
        let leftPercent = 0;
        let widthPercent = 0;
        if (isLiveState && isDVR) {
          const clampedStart = Math.max(range.start, seekRange.start);
          const clampedEnd = Math.min(range.end, seekRange.end);
          leftPercent = ((clampedStart - seekRange.start) / dvrWindow) * 100;
          widthPercent = ((clampedEnd - clampedStart) / dvrWindow) * 100;
        } else if (!isLiveState && duration > 0) {
          leftPercent = (range.start / duration) * 100;
          widthPercent = ((range.end - range.start) / duration) * 100;
        }
        
        if (widthPercent <= 0) return null;
        
        return (
          <div 
            key={`buffer-${i}`}
            className="absolute top-0 h-full bg-white/40 rounded-full pointer-events-none"
            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
          />
        );
      })}

      {/* Current progress bar */}
      <div 
        className={`absolute top-0 left-0 h-full ${isAdPlaying ? 'bg-yellow-400' : 'bg-primary'} rounded-full pointer-events-none`}
        style={{ width: `${percentage}%` }}
      >
        {/* Scrubber Knob */}
        <div className={`absolute z-20 right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-transform ${isDragging ? 'scale-125' : (isAdPlaying || (isLiveState && !isDVR) ? 'scale-0' : 'scale-0 group-hover:scale-100')} translate-x-1/2`} />
      </div>
      </div>
    </div>
  );
};
