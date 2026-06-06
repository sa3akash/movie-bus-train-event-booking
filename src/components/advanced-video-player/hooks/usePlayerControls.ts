import { useCallback, RefObject } from "react";

export function usePlayerControls({
  videoRef,
  containerRef,
  isAdPlaying,
  isMuted,
  setIsMuted,
  setVolumeState,
  setPlaybackRateState,
  setCurrentTime,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  isAdPlaying: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  setVolumeState: (vol: number) => void;
  setPlaybackRateState: (rate: number) => void;
  setCurrentTime: (time: number) => void;
}) {
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [videoRef]);

  const seek = useCallback((time: number) => {
    if (videoRef.current && !isAdPlaying) {
      setCurrentTime(time);
      videoRef.current.currentTime = time;
    }
  }, [videoRef, isAdPlaying, setCurrentTime]);

  const setVolume = useCallback((vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolumeState(vol);
      if (vol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, [videoRef, isMuted, setVolumeState, setIsMuted]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [videoRef, setIsMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, [containerRef]);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP toggle failed:", err);
    }
  }, [videoRef]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, [videoRef, setPlaybackRateState]);

  return {
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    setPlaybackRate,
  };
}
