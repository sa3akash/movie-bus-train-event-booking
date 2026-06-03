"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useShakaContext } from "./ShakaContext";

interface AdvancedPlayerContextType {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  
  // Ad State
  isAdPlaying: boolean;
  canSkipAd: boolean;
  adTimeRemaining: number;
  adTimeUntilSkippable: number;
  adTitle: string;
  
  // Actions
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  skipAd: () => void;
  initializePlayer: (manifestUrl: string, videoId: string) => Promise<void>;
}

const AdvancedPlayerContext = createContext<AdvancedPlayerContextType | null>(null);

export const AdvancedPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { shaka, isSupported } = useShakaContext();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const adManagerRef = useRef<any>(null);
  const registeredAdsRef = useRef<Set<string>>(new Set());

  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Ad state
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [adTimeUntilSkippable, setAdTimeUntilSkippable] = useState(0);
  const [adTitle, setAdTitle] = useState("");
  const currentAdRef = useRef<any>(null);

  const skipAd = useCallback(() => {
    if (currentAdRef.current && isAdPlaying) {
      try {
        if (typeof currentAdRef.current.skip === 'function') {
          currentAdRef.current.skip();
        }
      } catch (e) {
        console.error("Failed to skip ad", e);
      }
    }
  }, [isAdPlaying]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current && !isAdPlaying) {
      videoRef.current.currentTime = time;
    }
  }, [isAdPlaying]);

  const setVolume = useCallback((vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolumeState(vol);
      if (vol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const initializePlayer = useCallback(async (manifestUrl: string, videoId: string) => {
    if (!shaka || !isSupported || !videoRef.current || !containerRef.current) return;

    // Destroy existing instance if present
    if (playerRef.current) {
      await playerRef.current.destroy();
    }

    const player = new shaka.Player(videoRef.current);
    playerRef.current = player;
    
    // Crucial: Tell Shaka Player to use the dedicated ad video element instead of hijacking the main video!
    player.configure('ads.supportsMultipleMediaElements', true);

    player.addEventListener('buffering', (event: any) => {
      setIsBuffering(event.buffering);
    });

    // Custom Interstitials AdManager Setup
    const adManager = player.getAdManager();
    adManagerRef.current = adManager;
    
    // We must manually create an ad container since we aren't using shaka.ui.Overlay
    let adContainer = containerRef.current.querySelector('.shaka-custom-ad-container') as HTMLDivElement;
    if (!adContainer) {
      adContainer = document.createElement('div');
      adContainer.className = 'shaka-custom-ad-container';
      adContainer.style.position = 'absolute';
      adContainer.style.top = '0';
      adContainer.style.left = '0';
      adContainer.style.width = '100%';
      adContainer.style.height = '100%';
      adContainer.style.pointerEvents = 'none'; // Let clicks pass through unless ad is playing
      containerRef.current.appendChild(adContainer);
    }

    adManager.setContainers(adContainer, adContainer);
    
    // We must manually initialize the AdManager since we aren't using Shaka UI!
    try {
      adManager.initClientSide(adContainer, videoRef.current);
    } catch (e) {
      console.warn("initClientSide failed", e);
    }
    
    try {
      // Create a dedicated video element for ads so they don't hijack the main video
      let adVideo = adContainer.querySelector('video') as HTMLVideoElement;
      if (!adVideo) {
        adVideo = document.createElement('video');
        adVideo.style.width = '100%';
        adVideo.style.height = '100%';
        adVideo.playsInline = true;
        adVideo.autoplay = true;
        adContainer.appendChild(adVideo);
      }
      
      if (typeof adManager.initInterstitial === "function") {
        adManager.initInterstitial(adContainer, videoRef.current, adVideo);
      }
    } catch (e) {
      console.warn("initInterstitial failed", e);
    }

    // Setup Ad Listeners
    adManager.addEventListener('ad-started', (e: any) => {
      const ad = e.ad;
      currentAdRef.current = ad;
      setIsAdPlaying(true);
      setAdTitle(ad.getTitle ? ad.getTitle() : "Advertisement");
      
      // isSkippable means "is it a skippable type of ad". canSkipNow means "has the countdown finished".
      setCanSkipAd(ad.canSkipNow ? ad.canSkipNow() : false);
      adContainer.style.pointerEvents = 'auto'; // Block clicks to main video
    });

    adManager.addEventListener('ad-stopped', () => {
      currentAdRef.current = null;
      setIsAdPlaying(false);
      setCanSkipAd(false);
      setAdTimeRemaining(0);
      setAdTimeUntilSkippable(0);
      adContainer.style.pointerEvents = 'none';
      
      // Force UI to sync back to main video instantly
      if (videoRef.current) {
        setDuration(videoRef.current.duration || 0);
        setCurrentTime(videoRef.current.currentTime || 0);
      }
    });

    adManager.addEventListener('ad-skip-state-changed', (e: any) => {
      setCanSkipAd(e.ad.canSkipNow ? e.ad.canSkipNow() : true);
    });

    // Fetch and inject Ads
    try {
      const adRequestUrl = `/api/ads?videoId=${videoId}`;
      const res = await fetch(adRequestUrl);
      const data = await res.json();
      
      if (data.success && data.ads) {
        data.ads.forEach((ad: any) => {
          if (registeredAdsRef.current.has(ad.id)) return;
          
          adMetadataMapRef.current.set(ad.id, {
            isSkippable: ad.isSkippable ?? true,
            skipOffset: ad.skipOffset ?? 5
          });

          const safeTracking: Record<string, string[]> = {};
          if (ad.tracking) {
            for (const [event, urls] of Object.entries(ad.tracking)) {
              safeTracking[event] = (urls as string[]).map((url: string) => 
                url.startsWith('/') ? `${window.location.origin}${url}` : url
              );
            }
          }

          adManager.addCustomInterstitial({
            id: ad.id,
            groupId: ad.groupId || null,
            startTime: ad.startTime === 0 ? null : ad.startTime,
            endTime: ad.endTime ?? null,
            uri: ad.uri,
            mimeType: ad.mimeType || null,
            isSkippable: ad.isSkippable ?? true,
            skipOffset: ad.skipOffset ?? 5,
            skipFor: ad.skipFor || null,
            canJump: false,
            resumeOffset: ad.resumeOffset ?? null,
            playoutLimit: ad.playoutLimit ?? null,
            once: true,
            pre: ad.category === "PRE_ROLL",
            post: ad.category === "POST_ROLL",
            timelineRange: false,
            loop: false,
            overlay: null,
            displayOnBackground: false,
            currentVideo: null,
            background: null,
            clickThroughUrl: ad.clickThroughUrl || null,
            tracking: Object.keys(safeTracking).length > 0 ? safeTracking : null,
          });

          registeredAdsRef.current.add(ad.id);
        });
      }
    } catch (e) {
      console.warn("Failed to setup ads in custom player", e);
    }

    try {
      await player.load(manifestUrl);
    } catch (err: any) {
      if (err.code === 7000) {
        console.warn("Load interrupted (likely due to fast re-mounting).");
      } else {
        console.error("Error loading manifest:", err.code, err.message, err);
      }
    }

  }, [shaka, isSupported]);

  // Video Element Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isAdPlaying) {
        // Unfortunately standard video.currentTime doesn't always reflect ad time easily 
        // if it's a media tailor or overlay ad, but for custom interstitials, it plays in the ad video element.
        // We will just estimate or read from adManager if possible. But for simplicity, we just use the active video.
      } else {
        setCurrentTime(video.currentTime);
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
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

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [isAdPlaying]);

  // Ad metadata lookup map for bulletproof timing
  const adMetadataMapRef = useRef<Map<string, { isSkippable: boolean, skipOffset: number }>>(new Map());

  // Handle ad time updates separately by polling if an ad is playing
  useEffect(() => {
    let interval: any;
    if (isAdPlaying) {
      interval = setInterval(() => {
        const ad = currentAdRef.current;
        if (ad && containerRef.current) {
          const adVideo = containerRef.current.querySelector('.shaka-custom-ad-container video') as HTMLVideoElement;
          if (adVideo) {
            setCurrentTime(adVideo.currentTime);
            setDuration(adVideo.duration || 0);
            
            const remaining = (adVideo.duration || 0) - adVideo.currentTime;
            setAdTimeRemaining(isNaN(remaining) ? 0 : Math.max(0, remaining));

            // Safely retrieve the ad metadata by searching the ad object for the original config
            let metadata: { isSkippable: boolean, skipOffset: number } | undefined;
            
            // 1. Try getAdId()
            const id1 = typeof ad.getAdId === 'function' ? ad.getAdId() : null;
            if (id1 && adMetadataMapRef.current.has(id1)) {
              metadata = adMetadataMapRef.current.get(id1);
            }

            // 2. Rigorously search all properties for the config object
            if (!metadata) {
              for (const key in ad) {
                const val = ad[key];
                if (val && typeof val === 'object' && val.id && adMetadataMapRef.current.has(val.id)) {
                  metadata = adMetadataMapRef.current.get(val.id);
                  break;
                }
              }
            }

            // 3. Last resort fallback
            if (!metadata && adMetadataMapRef.current.size === 1) {
              metadata = Array.from(adMetadataMapRef.current.values())[0];
            }

            if (metadata?.isSkippable) {
              const timeUntil = metadata.skipOffset - adVideo.currentTime;
              setAdTimeUntilSkippable(isNaN(timeUntil) ? 0 : Math.max(0, timeUntil));
              
              if (timeUntil <= 0) {
                setCanSkipAd(true);
              } else {
                setCanSkipAd(false);
              }
            } else {
              setAdTimeUntilSkippable(0);
              setCanSkipAd(false);
            }
          }
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isAdPlaying]);

  return (
    <AdvancedPlayerContext.Provider
      value={{
        videoRef,
        containerRef,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isFullscreen,
        isBuffering,
        isAdPlaying,
        canSkipAd,
        adTimeRemaining,
        adTimeUntilSkippable,
        adTitle,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleFullscreen,
        skipAd,
        initializePlayer,
      }}
    >
      {children}
    </AdvancedPlayerContext.Provider>
  );
};

export const useAdvancedPlayer = () => {
  const context = useContext(AdvancedPlayerContext);
  if (!context) {
    throw new Error("useAdvancedPlayer must be used within AdvancedPlayerProvider");
  }
  return context;
};
