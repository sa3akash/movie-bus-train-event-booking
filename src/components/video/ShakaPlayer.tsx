/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { useEffect, useRef } from "react";
// We must use require inside useEffect to avoid Next.js SSR crash with navigator/window.
import "shaka-player/dist/controls.css";

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

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const shaka = require("shaka-player/dist/shaka-player.ui.js");

    if (!videoRef.current || !containerRef.current) return;

    // Initialize Shaka Player
    const player = new shaka.Player(videoRef.current);

    // Initialize UI Overlay
    const ui = new shaka.ui.Overlay(
      player,
      containerRef.current,
      videoRef.current,
    );

    const controls = ui.getControls();

    // Listen for error events
    player.addEventListener("error", (event: any) => {
      console.error("Shaka Player Error", event.detail);
    });

    controls.addEventListener("error", (event: any) => {
      console.error("Shaka UI Error", event.detail);
    });

    if (onPlayerReady) {
      onPlayerReady(player);
    }

    // Try to load the manifest
    player.load(manifestUrl).catch((e: any) => {
      console.error("Error loading manifest", e);
    });

    return () => {
      ui.destroy();
      player.destroy();
    };
  }, [manifestUrl]);

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
