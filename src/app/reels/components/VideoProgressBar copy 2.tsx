import React, { useEffect, useRef, useState } from "react";

interface VideoProgressBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({ videoRef }) => {
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (!isDragging && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const updateBuffer = () => {
      if (video.duration > 0 && video.buffered.length > 0) {
        let bufferedEnd = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.currentTime >= video.buffered.start(i) && video.currentTime <= video.buffered.end(i)) {
            bufferedEnd = video.buffered.end(i);
            break;
          }
        }
        if (bufferedEnd === 0 && video.buffered.length > 0) {
          bufferedEnd = video.buffered.end(video.buffered.length - 1);
        }
        setBuffer((bufferedEnd / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("progress", updateBuffer);
    video.addEventListener("loadeddata", updateBuffer);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("progress", updateBuffer);
      video.removeEventListener("loadeddata", updateBuffer);
    };
  }, [videoRef, isDragging]);

  const handleProgressInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (!progressBarRef.current || !videoRef.current || !videoRef.current.duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent | MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    setProgress(percentage * 100);
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (videoRef.current) {
      setWasPlayingBeforeDrag(!videoRef.current.paused);
      videoRef.current.pause();
    }
    handleProgressInteraction(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (videoRef.current && wasPlayingBeforeDrag) {
      videoRef.current.play();
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        handleProgressInteraction(e);
      }
    };

    const handleGlobalEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalEnd);
      window.addEventListener("touchmove", handleGlobalMove, { passive: false });
      window.addEventListener("touchend", handleGlobalEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging, wasPlayingBeforeDrag]);

  return (
    <div 
      className="absolute bottom-2 left-0 w-full h-6 z-50 cursor-pointer group/progress flex items-center touch-none px-2"
      ref={progressBarRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="w-full h-[3px] group-hover/progress:h-[5px] transition-all duration-200 relative bg-white/20 rounded-full">
        {/* Buffer Bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-white/40 pointer-events-none transition-all duration-200 rounded-full" 
          style={{ width: `${buffer}%` }}
        />

        {/* Progress Bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-white relative transition-all duration-200 rounded-full" 
          style={{ width: `${progress}%` }}
        >
          {/* Thumb */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-white rounded-full shadow-md transition-all duration-200 ${isDragging ? "opacity-100 scale-125" : "opacity-0 group-hover/progress:opacity-100 scale-100"} translate-x-1/2`} />
        </div>
      </div>
    </div>
  );
};
