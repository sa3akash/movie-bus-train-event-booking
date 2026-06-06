"use client";

import React, { useEffect, useRef, useState } from "react";
import { useShakaContext } from "@/context/ShakaContext";
import { Volume2, VolumeX } from "lucide-react";

interface HoverVideoPlayerProps {
  manifestUrl: string;
}

export function HoverVideoPlayer({ manifestUrl }: HoverVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { shaka, isSupported } = useShakaContext();
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isSupported || !videoRef.current || !shaka || !manifestUrl) return;

    const player = new shaka.Player(videoRef.current);

    // Optimize for fast startup preview
    player.configure({
      abr: { enabled: true, defaultBandwidthEstimate: 500000 },
      streaming: { bufferingGoal: 2, rebufferingGoal: 1 },
      // Allow audio to be downloaded so it can be unmuted
      manifest: { disableText: true },
    });

    const loadVideo = async () => {
      try {
        await player.load(manifestUrl);
      } catch (err) {
        console.error("Hover player failed to load", err);
      }
    };

    loadVideo();

    return () => {
      try {
        player.destroy();
      } catch {}
    };
  }, [manifestUrl, isSupported, shaka]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const paddingX = 8; // px-2 is 8px
    const clickX = e.clientX - rect.left - paddingX;
    const barWidth = rect.width - paddingX * 2;
    const percentage = Math.max(0, Math.min(1, clickX / barWidth));

    setProgress(percentage * 100);
    video.currentTime = percentage * video.duration;
  };

  return (
    <div className="absolute inset-0 z-10 w-full h-full group/player">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
      />

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors z-20 cursor-pointer shadow-sm"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* Progress Bar Hit Area Wrapper */}
      <div
        className="absolute bottom-0 left-0 right-0 w-full px-2 pt-4 pb-2 cursor-pointer opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 z-20 group/progress"
        onClick={handleSeek}
      >
        <div className="relative h-1 group-hover/progress:h-1.5 group-hover/progress:-translate-y-0.5 bg-white/30 transition-all duration-200 rounded-full w-full pointer-events-none">
          {/* Progress Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all duration-100 ease-linear rounded-l-full group-hover/progress:rounded-full"
            style={{ width: `${progress}%` }}
          >
            {/* Thumb Indicator (visible on hover) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transform translate-x-1/2 transition-opacity shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
