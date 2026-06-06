"use client";

import React from "react";
import { PlaybackButtons } from "./PlaybackButtons";
import { VolumeControl } from "./VolumeControl";
import { TimeDisplay } from "./TimeDisplay";
import { ProgressBar } from "./ProgressBar";
import { SettingsMenu } from "./SettingsMenu";
import { useAdvancedPlayer } from "./context";
import { Maximize, Minimize, PictureInPicture, Subtitles } from "lucide-react";

export const PlayerControls = () => {
  const { toggleFullscreen, isFullscreen, isAdPlaying, togglePiP, textTracks, isTextTrackVisible, toggleTextTrackVisibility } = useAdvancedPlayer();

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto flex flex-col gap-2">
      {/* Top row: Progress Bar */}
      <ProgressBar />

      {/* Bottom row: Controls */}
      <div className="flex items-center justify-between mt-1">
        
        {/* Left Side: Playback, Volume, Time */}
        <div className="flex items-center gap-4">
          <PlaybackButtons />
          <VolumeControl />
          <TimeDisplay />
        </div>

        {/* Right Side: Fullscreen, PiP, Settings */}
        <div className="flex items-center gap-2 md:gap-4">
          {textTracks.length > 0 && (
            <button
              onClick={toggleTextTrackVisibility}
              className={`p-1.5 transition-colors rounded-full hover:bg-white/10 ${isTextTrackVisible ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
              title="Closed Captions"
            >
              <Subtitles className="w-5 h-5" />
            </button>
          )}
          
          <SettingsMenu />
          
          <button
            onClick={togglePiP}
            className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Picture-in-Picture"
          >
            <PictureInPicture className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
        
      </div>
    </div>
  );
};
