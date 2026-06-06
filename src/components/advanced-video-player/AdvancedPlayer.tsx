"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAdvancedPlayer, AdvancedPlayerProvider } from "./context";
import { PlayerControls } from "./PlayerControls";
import { AdOverlay } from "./AdOverlay";
import { StatsOverlay } from "./StatsOverlay";
import {
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { AdvancedVideoPlayerProps } from "./types";

const PlayerInner = (props: AdvancedVideoPlayerProps) => {
  const {
    videoRef,
    containerRef,
    initializePlayer,
    loadVttStoryboard,
    isBuffering,
    isAdPlaying,
    isLiveState,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seek,
    currentTime,
    volume,
    setVolume,
    duration,
    isMuted,
    isFullscreen,
  } = useAdvancedPlayer();
  const [isIdle, setIsIdle] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [actionIndicator, setActionIndicator] = useState<{
    icon: React.ReactNode;
    text?: string;
    id: number;
  } | null>(null);
  const [loop, setLoop] = useState(false);

  const triggerAction = (icon: React.ReactNode, text?: string) => {
    setActionIndicator({ icon, text, id: Date.now() });
  };

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 240;
      const menuHeight = 200;
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (x + menuWidth > rect.width) x = rect.width - menuWidth - 8;
      if (y + menuHeight > rect.height) y = rect.height - menuHeight - 8;

      setContextMenu({ x: Math.max(8, x), y: Math.max(8, y) });
    }
  };

  useEffect(() => {
    initializePlayer(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.manifestUrl, props.videoId, props.isLive]);

  // Load or update storyboard when URL changes (without resetting player)
  useEffect(() => {
    if (props.storyboardUrl) {
      loadVttStoryboard(props.storyboardUrl);
    }
  }, [props.storyboardUrl, loadVttStoryboard]);

  // Handle ?t= parameter from URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const tParam = urlParams.get("t");

    if (tParam && !isNaN(Number(tParam))) {
      const time = Number(tParam);
      const video = videoRef.current;
      if (!video) return;

      const handleReadyToSeek = () => {
        // Only seek once when initially loaded
        seek(time);
        video.removeEventListener("loadedmetadata", handleReadyToSeek);
        video.removeEventListener("canplay", handleReadyToSeek);
      };

      if (video.readyState >= 1) {
        handleReadyToSeek();
      } else {
        video.addEventListener("loadedmetadata", handleReadyToSeek);
        video.addEventListener("canplay", handleReadyToSeek);
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleReadyToSeek);
        video.removeEventListener("canplay", handleReadyToSeek);
      };
    }
  }, [seek, videoRef]);

  // Keyboard controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          triggerAction(videoRef.current?.paused ? <Pause /> : <Play />);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          triggerAction(isFullscreen ? <Minimize /> : <Maximize />);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          triggerAction(!isMuted ? <VolumeX /> : <Volume2 />);
          break;
        case "arrowleft":
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          triggerAction(<RotateCcw />, "-5s");
          break;
        case "arrowright":
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          triggerAction(<RotateCw />, "+5s");
          break;
        case "arrowup":
          e.preventDefault();
          const newVolUp = Math.min(1, volume + 0.1);
          setVolume(newVolUp);
          triggerAction(<Volume2 />, `${Math.round(newVolUp * 100)}%`);
          break;
        case "arrowdown":
          e.preventDefault();
          const newVolDown = Math.max(0, volume - 0.1);
          setVolume(newVolDown);
          triggerAction(
            newVolDown === 0 ? <VolumeX /> : <Volume2 />,
            `${Math.round(newVolDown * 100)}%`,
          );
          break;
      }
    };

    // container.addEventListener("keydown", handleKeyDown);
    // return () => container.removeEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    containerRef,
    togglePlay,
    toggleFullscreen,
    toggleMute,
    seek,
    currentTime,
    duration,
    setVolume,
    volume,
    isFullscreen,
    isMuted,
    videoRef,
  ]);

  // Idle detection for hiding controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 3000);
    };

    const handleMouseLeave = () => setIsIdle(true);
    const handleMouseEnter = () => handleMouseMove();

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
      container.addEventListener("mouseenter", handleMouseEnter);

      // Initial trigger
      handleMouseMove();
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        container.removeEventListener("mouseenter", handleMouseEnter);
      }
    };
  }, [containerRef]);

  useEffect(() => {
    setLoop(videoRef.current?.loop || false);
  }, [videoRef]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onContextMenu={handleContextMenu}
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50 group select-none transition-all duration-700 focus:outline-none ${props.className || ""}`}
      style={
        props.blurDataUrl
          ? {
              backgroundImage: `url(${props.blurDataUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              ...props.style,
            }
          : props.style
      }
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={props.posterUrl}
        className="w-full h-full object-contain"
        autoPlay={props.autoPlay ?? true}
        playsInline
        muted={props.muted}
        loop={props.loop}
      />

      {/* Click / DoubleClick interaction layer */}
      <div
        className="absolute inset-0 z-10"
        onClick={(e) => {
          if (isAdPlaying) return;
          if ((e.target as HTMLElement).closest(".pointer-events-auto")) return;

          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          } else {
            clickTimeoutRef.current = setTimeout(() => {
              if (videoRef.current) {
                togglePlay();
                triggerAction(videoRef.current.paused ? <Pause /> : <Play />);
              }
              clickTimeoutRef.current = null;
            }, 250);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          if (isAdPlaying) return;
          if ((e.target as HTMLElement).closest(".pointer-events-auto")) return;

          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }

          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;

          const clickX = e.clientX - rect.left;
          const width = rect.width;

          if (clickX < width * 0.33) {
            seek(Math.max(0, currentTime - 10));
            triggerAction(<RotateCcw />, "-10s");
          } else if (clickX > width * 0.66) {
            seek(Math.min(duration, currentTime + 10));
            triggerAction(<RotateCw />, "+10s");
          } else {
            toggleFullscreen();
            triggerAction(!isFullscreen ? <Maximize /> : <Minimize />);
          }
        }}
      />

      {/* Action Indicator Animation */}
      <style>{`
        @keyframes actionPulse {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
      {actionIndicator && (
        <div
          key={actionIndicator.id}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div
            className="bg-black/60 backdrop-blur-sm text-white rounded-full p-5 flex flex-col items-center justify-center shadow-2xl"
            style={{ animation: "actionPulse 0.7s ease-out forwards" }}
          >
            <div className="[&>svg]:w-10 [&>svg]:h-10">
              {actionIndicator.icon}
            </div>
            {actionIndicator.text && (
              <span className="text-sm font-bold mt-1 tracking-wider">
                {actionIndicator.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-90 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setContextMenu(null)}
          />

          <div
            className="
              fixed bottom-0 left-0 right-0 w-full z-100
              md:absolute md:w-auto md:bottom-auto md:left-auto md:right-auto
              bg-zinc-950 md:bg-black/90 md:border border-white/10 rounded-t-2xl md:rounded-md shadow-2xl py-2 md:py-2 min-w-[240px] text-[13px] md:text-[13px] text-base pointer-events-auto md:backdrop-blur-md
              animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 duration-300
            "
            style={
              typeof window !== "undefined" && window.innerWidth >= 768
                ? { left: contextMenu.x, top: contextMenu.y }
                : undefined
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle */}
            <div className="w-full flex justify-center pb-2 md:hidden">
              <div className="w-10 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="flex flex-col max-h-[50vh] overflow-y-auto overscroll-contain">
              <button
                className="w-full flex items-center justify-between text-left px-4 py-3 md:py-1.5 hover:bg-white/10 text-white/90 transition-colors"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.loop = !videoRef.current.loop;
                  }
                  setContextMenu(null);
                }}
              >
                <span>Loop</span>
                {loop && <span className="text-white/60">✓</span>}
              </button>

              <button
                className="w-full text-left px-4 py-3 md:py-1.5 hover:bg-white/10 text-white/90 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setContextMenu(null);
                }}
              >
                Copy video URL
              </button>

              <button
                className="w-full text-left px-4 py-3 md:py-1.5 hover:bg-white/10 text-white/90 transition-colors"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("t", Math.round(currentTime).toString());
                  navigator.clipboard.writeText(url.toString());
                  setContextMenu(null);
                }}
              >
                Copy video URL at current time
              </button>

              <div className="h-px bg-white/10 my-1.5 mx-2" />

              <button
                className="w-full text-left px-4 py-3 md:py-1.5 hover:bg-white/10 text-white/90 transition-colors"
                onClick={() => {
                  alert(
                    "Playback logs collected. Please send them to support.",
                  );
                  setContextMenu(null);
                }}
              >
                Troubleshoot playback issue
              </button>

              <button
                className="w-full flex items-center justify-between text-left px-4 py-3 md:py-1.5 hover:bg-white/10 text-white/90 transition-colors"
                onClick={() => {
                  setShowStats(!showStats);
                  setContextMenu(null);
                }}
              >
                <span>Stats for nerds</span>
                {showStats && <span className="text-white/60">✓</span>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Stats Overlay */}
      {showStats && <StatsOverlay onClose={() => setShowStats(false)} />}

      {/* Loading Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-10 transition-opacity">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Ad Overlay Layer */}
      {isAdPlaying && <AdOverlay />}

      {/* Live Badge */}
      {isLiveState && (
        <div
          className={`absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 transition-opacity duration-500 pointer-events-none ${isIdle && !isBuffering ? "opacity-0" : "opacity-100"}`}
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-xs font-bold tracking-wider">
            LIVE
          </span>
        </div>
      )}

      {/* Player Controls */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 ${
          isIdle && !isBuffering ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Subtle top gradient for visibility if needed */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Main Controls at bottom */}
        <PlayerControls />
      </div>
    </div>
  );
};

export const AdvancedVideoPlayer = (props: AdvancedVideoPlayerProps) => {
  return (
    <AdvancedPlayerProvider>
      <PlayerInner {...props} />
    </AdvancedPlayerProvider>
  );
};
