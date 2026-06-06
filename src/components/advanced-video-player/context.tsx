"use client";

import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from "react";
import { useShakaContext } from "../../context/ShakaContext";
import { AdvancedVideoPlayerProps } from "./types";
import { AdvancedPlayerContextType } from "./types";

import { useVideoState } from "./hooks/useVideoState";
import { usePlayerControls } from "./hooks/usePlayerControls";
import { useVideoTracks } from "./hooks/useVideoTracks";
import { useThumbnails } from "./hooks/useThumbnails";
import { useVideoAds } from "./hooks/useVideoAds";
import { useShakaPlayer } from "./hooks/useShakaPlayer";
import shaka from "shaka-player";

const AdvancedPlayerContext = createContext<AdvancedPlayerContextType | null>(null);

export interface Chapter {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
}

export const AdvancedPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { shaka, isSupported } = useShakaContext();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const propsRef = useRef<AdvancedVideoPlayerProps | null>(null);
  const isAdPlayingRef = useRef(false);

  const [chapters, setChapters] = React.useState<Chapter[]>([]);

  // Base Video State
  const videoState = useVideoState({
    videoRef,
    playerRef,
    propsRef,
    isAdPlayingRef,
  });

  // Video Ad State
  const {
    adManagerRef,
    currentAdRef,
    registeredAdsRef,
    adMetadataMapRef,
    isAdPlaying,
    setIsAdPlaying,
    canSkipAd,
    setCanSkipAd,
    adTimeRemaining,
    setAdTimeRemaining,
    adTimeUntilSkippable,
    setAdTimeUntilSkippable,
    adTitle,
    setAdTitle,
    adCurrentTime,
    setAdCurrentTime,
    adDuration,
    setAdDuration,
    skipAd,
  } = useVideoAds({
    videoRef,
    playerRef,
    propsRef,
    isAdPlayingRef,
    setDuration: videoState.setDuration,
    setCurrentTime: videoState.setCurrentTime,
  });

  // Controls (Play, Pause, Mute, PiP, etc.)
  const controls = usePlayerControls({
    videoRef,
    containerRef,
    isAdPlaying,
    isMuted: videoState.isMuted,
    setIsMuted: videoState.setIsMuted,
    setVolumeState: videoState.setVolumeState,
    setPlaybackRateState: videoState.setPlaybackRateState,
    setCurrentTime: videoState.setCurrentTime,
  });

  // Tracks (Video Qualities, Audio Languages, Text Tracks)
  const tracks = useVideoTracks({
    playerRef,
  });

  // Thumbnails
  const { getThumbnail, loadVttStoryboard } = useThumbnails({
    playerRef,
  });

  // Shaka Player Initialization
  const { initializePlayer } = useShakaPlayer({
    videoRef,
    containerRef,
    playerRef,
    propsRef,
    shaka,
    isSupported,
    adManagerRef,
    registeredAdsRef,
    adMetadataMapRef,
    currentAdRef,
    setIsAdPlaying,
    isAdPlayingRef,
    setAdTitle,
    setCanSkipAd,
    setAdTimeRemaining,
    setAdTimeUntilSkippable,
    setAdCurrentTime,
    setAdDuration,
    setDuration: videoState.setDuration,
    setCurrentTime: videoState.setCurrentTime,
    setVideoTracks: tracks.setVideoTracks,
    setActiveTrackHeight: tracks.setActiveTrackHeight,
    setTextTracks: tracks.setTextTracks,
    setSelectedTextTrackId: tracks.setSelectedTextTrackId,
    setIsTextTrackVisible: tracks.setIsTextTrackVisible,
    setAudioLanguages: tracks.setAudioLanguages,
    setSelectedAudioLanguage: tracks.setSelectedAudioLanguage,
    setIsLiveState: videoState.setIsLiveState,
    setSeekRange: videoState.setSeekRange,
    setChapters,
    setIsBuffering: videoState.setIsBuffering,
    loadVttStoryboard,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const getStats = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current.getStats();
    }
    return null;
  }, []);

  const goToLive = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.goToLive();
    }
  }, []);

  const initializePlayerWrapper = useCallback(async (props: AdvancedVideoPlayerProps) => {
    propsRef.current = props;
    await initializePlayer(props);
    
    if (playerRef.current) {
      try {
        const parsedChapters = await playerRef.current.getChaptersAsync('english');
        if (parsedChapters && parsedChapters.length > 0) {
          setChapters(parsedChapters);
        } else if (props.chapters) {
          setChapters(props.chapters);
        }
      } catch {
        if (props.chapters) setChapters(props.chapters);
      }
    }
  }, [initializePlayer]);

  const contextValue: AdvancedPlayerContextType = {
    videoRef,
    containerRef,
    
    // State
    isPlaying: videoState.isPlaying,
    currentTime: videoState.currentTime,
    duration: videoState.duration,
    volume: videoState.volume,
    isMuted: videoState.isMuted,
    isFullscreen: videoState.isFullscreen,
    isBuffering: videoState.isBuffering,
    playbackRate: videoState.playbackRate,
    isPiP: videoState.isPiP,
    isLiveState: videoState.isLiveState,
    seekRange: videoState.seekRange,
    
    // Quality / Tracks
    videoTracks: tracks.videoTracks,
    selectedTrackId: tracks.selectedTrackId,
    activeTrackHeight: tracks.activeTrackHeight,
    
    // Subtitles / Captions
    textTracks: tracks.textTracks,
    selectedTextTrackId: tracks.selectedTextTrackId,
    isTextTrackVisible: tracks.isTextTrackVisible,
    
    // Audio Languages
    audioLanguages: tracks.audioLanguages,
    selectedAudioLanguage: tracks.selectedAudioLanguage,
    
    // Chapters
    chapters,
    
    // Ad State
    isAdPlaying,
    canSkipAd,
    adTimeRemaining,
    adTimeUntilSkippable,
    adTitle,
    adCurrentTime,
    adDuration,
    
    // Actions
    togglePlay: controls.togglePlay,
    seek: controls.seek,
    setVolume: controls.setVolume,
    toggleMute: controls.toggleMute,
    toggleFullscreen: controls.toggleFullscreen,
    togglePiP: controls.togglePiP,
    setPlaybackRate: controls.setPlaybackRate,
    selectTrack: tracks.selectTrack,
    skipAd,
    initializePlayer: initializePlayerWrapper,
    getThumbnail,
    loadVttStoryboard,
    getStats,
    setCurrentTime: videoState.setCurrentTime,
    toggleTextTrackVisibility: tracks.toggleTextTrackVisibility,
    selectTextTrack: tracks.selectTextTrack,
    selectAudioLanguage: tracks.selectAudioLanguage,
    goToLive,
  };

  return (
    <AdvancedPlayerContext.Provider value={contextValue}>
      {children}
    </AdvancedPlayerContext.Provider>
  );
};

export const useAdvancedPlayer = () => {
  const context = useContext(AdvancedPlayerContext);
  if (!context) {
    throw new Error("useAdvancedPlayer must be used within an AdvancedPlayerProvider");
  }
  return context;
};
