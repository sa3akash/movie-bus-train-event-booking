/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { useEffect, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import { useShakaContext, PlayerInstance } from "@/context/ShakaContext";

interface ShakaPlayerProps {
  manifestUrl: string;
  posterUrl?: string;
  onPlayerReady?: (player: any) => void;
}

export default function ShakaPlayer({
  manifestUrl,
  posterUrl,
  onPlayerReady,
}: ShakaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { initPlayer, isSupported } = useShakaContext();
  const [playerInstance, setPlayerInstance] = useState<PlayerInstance | null>(null);

  useEffect(() => {
    if (!isSupported || !videoRef.current || !containerRef.current) return;

    let mounted = true;
    let localInstance: PlayerInstance | null = null;

    const setup = async () => {
      localInstance = await initPlayer(
        videoRef.current!,
        containerRef.current!,
        manifestUrl,
        onPlayerReady
      );
      
      if (mounted && localInstance) {
        setPlayerInstance(localInstance);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (localInstance) {
        try {
          localInstance.ui.destroy();
          localInstance.player.destroy();
        } catch (e) {
          console.error("Failed to destroy player instance", e);
        }
      }
    };
  }, [manifestUrl, isSupported, initPlayer]); // Ensure initPlayer and isSupported are stable from context

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto shadow-2xl rounded-xl overflow-hidden border border-border bg-black"
    >
      <video
        ref={videoRef}
        poster={posterUrl}
        className="w-full h-full object-contain"
        autoPlay
      />
    </div>
  );
}
