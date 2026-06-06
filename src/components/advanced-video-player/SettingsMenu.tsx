"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAdvancedPlayer } from "@/context/AdvancedPlayerContext";
import { Settings, ChevronRight, ChevronLeft, Check } from "lucide-react";

type MenuState = "main" | "quality" | "speed";

export const SettingsMenu = () => {
  const {
    videoTracks,
    selectedTrackId,
    activeTrackHeight,
    selectTrack,
    playbackRate,
    setPlaybackRate,
  } = useAdvancedPlayer();

  const [isOpen, setIsOpen] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>("main");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setTimeout(() => setMenuState("main"), 200);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setMenuState("main"), 200);
    } else {
      setIsOpen(true);
    }
  };

  // Derive unique qualities (resolutions) from variant tracks
  const qualities = Array.from(
    new Map(
      videoTracks
        .filter((t) => t.type === 'variant' && t.height)
        .map((t) => [t.height, { id: t.id.toString(), height: t.height }])
    ).values()
  ).sort((a, b) => b.height - a.height); // Highest resolution first

  const activeQualityName =
    selectedTrackId === null
      ? (activeTrackHeight ? `Auto (${activeTrackHeight}p)` : "Auto")
      : `${videoTracks.find((t) => t.id.toString() === selectedTrackId)?.height}p` || "Auto";

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className={`p-1.5 transition-colors rounded-full hover:bg-white/10 ${
          isOpen ? "text-white rotate-45" : "text-white/80 hover:text-white"
        }`}
        style={{ transition: "transform 0.3s ease" }}
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 text-sm font-medium text-white/90">
          
          {/* Main Menu */}
          {menuState === "main" && (
            <div className="flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setMenuState("quality")}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <span>Quality</span>
                <div className="flex items-center text-white/50">
                  <span className="mr-2 text-xs">{activeQualityName}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => setMenuState("speed")}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <span>Playback speed</span>
                <div className="flex items-center text-white/50">
                  <span className="mr-2 text-xs">{playbackRate === 1 ? "Normal" : `${playbackRate}x`}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* Quality Submenu */}
          {menuState === "quality" && (
            <div className="flex flex-col py-2 animate-in slide-in-from-right-4 duration-200">
              <button
                onClick={() => setMenuState("main")}
                className="flex items-center px-4 py-3 border-b border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Quality</span>
              </button>
              
              <div className="max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    selectTrack(null);
                    setIsOpen(false);
                    setTimeout(() => setMenuState("main"), 200);
                  }}
                  className="w-full flex items-center px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 flex items-center justify-center">
                    {selectedTrackId === null && <Check className="w-4 h-4" />}
                  </div>
                  <span>Auto</span>
                </button>

                {qualities.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      selectTrack(q.id);
                      setIsOpen(false);
                      setTimeout(() => setMenuState("main"), 200);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 flex items-center justify-center">
                      {selectedTrackId === q.id && <Check className="w-4 h-4" />}
                    </div>
                    <span>{q.height}p</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speed Submenu */}
          {menuState === "speed" && (
            <div className="flex flex-col py-2 animate-in slide-in-from-right-4 duration-200">
              <button
                onClick={() => setMenuState("main")}
                className="flex items-center px-4 py-3 border-b border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Playback speed</span>
              </button>
              
              <div className="max-h-60 overflow-y-auto">
                {speeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      setIsOpen(false);
                      setTimeout(() => setMenuState("main"), 200);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 flex items-center justify-center">
                      {playbackRate === speed && <Check className="w-4 h-4" />}
                    </div>
                    <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
