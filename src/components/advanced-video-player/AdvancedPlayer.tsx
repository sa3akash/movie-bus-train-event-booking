"use client";

import React, { useEffect, useState } from "react";
import { useAdvancedPlayer, AdvancedPlayerProvider } from "./context";
import { PlayerControls } from "./PlayerControls";
import { AdOverlay } from "./AdOverlay";
import { Loader2 } from "lucide-react";
import { AdvancedVideoPlayerProps } from "./types";

const PlayerInner = (props: AdvancedVideoPlayerProps) => {
  const { videoRef, containerRef, initializePlayer, isBuffering, isAdPlaying } = useAdvancedPlayer();
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    initializePlayer(props);
  }, [props.manifestUrl, props.storyboardUrl, props.ads, props.shakaConfig, props.drm, initializePlayer]);

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

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50 group select-none transition-all duration-700 ${props.className || ''}`}
      style={props.blurDataUrl ? {
        backgroundImage: `url(${props.blurDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...props.style
      } : props.style}
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

      {/* Loading Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-10 transition-opacity">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Ad Overlay Layer */}
      {isAdPlaying && <AdOverlay />}

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
