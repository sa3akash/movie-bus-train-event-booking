import { useState, useEffect, RefObject } from "react";
import { AdvancedVideoPlayerProps } from "../types";

export function useVideoState({
  videoRef,
  playerRef,
  propsRef,
  isAdPlayingRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  playerRef: RefObject<any>;
  propsRef: RefObject<AdvancedVideoPlayerProps | null>;
  isAdPlayingRef: RefObject<boolean>;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isPiP, setIsPiP] = useState(false);
  const [isLiveState, setIsLiveState] = useState(false);
  const [seekRange, setSeekRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isAdPlayingRef.current) return;
      setCurrentTime(video.currentTime || 0);

      if (propsRef.current?.isLive || (playerRef.current && playerRef.current.isLive())) {
        if (playerRef.current && playerRef.current.isLive()) {
          const range = playerRef.current.seekRange();
          setSeekRange({ start: range.start, end: range.end });
        } else {
          // Mock seek range for testing live UI with VOD streams
          setSeekRange({ start: 0, end: video.duration || 0 });
        }
      }
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handleRateChange = () => setPlaybackRateState(video.playbackRate);
    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);
    const handleEnded = () => propsRef.current?.onEnded?.();
    const handlePlay = () => {
      if (isAdPlayingRef.current) {
        // Prevent main video from playing during an ad
        video.pause();
      } else {
        setIsPlaying(true);
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolumeState(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoRef, playerRef, propsRef, isAdPlayingRef]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolumeState,
    isMuted,
    setIsMuted,
    isFullscreen,
    isBuffering,
    setIsBuffering,
    playbackRate,
    setPlaybackRateState,
    isPiP,
    isLiveState,
    setIsLiveState,
    seekRange,
    setSeekRange,
  };
}
