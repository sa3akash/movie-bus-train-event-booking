import React, { useCallback, useEffect, useRef, useState } from "react";

interface VideoProgressBarProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSeek: (time: number) => void;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  videoRef,
  onSeek,
}) => {
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    let animationFrameId: number;

    const updateProgressLoop = () => {
      if (!isDragging && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      animationFrameId = requestAnimationFrame(updateProgressLoop);
    };

    const handlePlay = () => {
      animationFrameId = requestAnimationFrame(updateProgressLoop);
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
      if (!isDragging && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const updateBuffer = () => {
      if (video.duration > 0 && video.buffered.length > 0) {
        let bufferedEnd = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          if (
            video.currentTime >= video.buffered.start(i) &&
            video.currentTime <= video.buffered.end(i)
          ) {
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

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", updateBuffer);
    video.addEventListener("progress", updateBuffer);
    video.addEventListener("loadeddata", updateBuffer);

    if (!video.paused) {
      handlePlay();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", updateBuffer);
      video.removeEventListener("progress", updateBuffer);
      video.removeEventListener("loadeddata", updateBuffer);
    };
  }, [videoRef, isDragging]);

  const handleProgressInteraction = useCallback(
    (
      e:
        | React.MouseEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>
        | MouseEvent
        | TouchEvent,
    ) => {
      const video = videoRef?.current;
      const progressBar = progressBarRef?.current;

      if (!progressBar || !video || !video.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const clientX =
        "touches" in e
          ? e.touches[0].clientX
          : (e as React.MouseEvent | MouseEvent).clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      if (video) {
        setProgress(percentage * 100);
        onSeek(percentage * video.duration);
      }
    },
    [videoRef, progressBarRef, onSeek],
  );

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    e.stopPropagation(); // Prevent video from pausing/playing
    const video = videoRef?.current;

    setIsDragging(true);
    if (video) {
      setWasPlayingBeforeDrag(!video.paused);
      video.pause();
    }
    handleProgressInteraction(e);
  };

  const handleDragEnd = useCallback(() => {
    const video = videoRef?.current;

    setIsDragging(false);
    if (video && wasPlayingBeforeDrag) {
      video.play();
    }
  }, [videoRef, wasPlayingBeforeDrag]);

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
      window.addEventListener("touchmove", handleGlobalMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleGlobalEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [
    handleDragEnd,
    handleProgressInteraction,
    isDragging,
    wasPlayingBeforeDrag,
  ]);

  return (
    <div
      className="absolute bottom-0 left-0 w-full h-6 z-50 cursor-pointer group/progress flex items-end touch-none pointer-events-auto"
      ref={progressBarRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="w-full h-[3px] group-hover/progress:h-[6px] group-hover/progress:bottom-2 transition-[height] duration-200 relative bg-white/20">
        {/* Buffer Bar */}
        <div
          className="absolute top-0 left-0 h-full bg-white/40 pointer-events-none"
          style={{ width: `${buffer}%` }}
        />

        {/* Progress Bar */}
        <div
          className=" top-0 left-0 h-full bg-white relative"
          style={{ width: `${progress}%` }}
        >
          {/* Thumb */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-white rounded-full shadow-md transition-all duration-200 ${isDragging ? "opacity-100 scale-125" : "opacity-0 group-hover/progress:opacity-100 scale-100"} translate-x-1/2`}
          />
        </div>
      </div>
    </div>
  );
};
