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
  playbackRate: number;
  isPiP: boolean;
  
  // Quality / Tracks
  videoTracks: any[];
  selectedTrackId: string | null;
  activeTrackHeight: number | null;
  
  // Ad State
  isAdPlaying: boolean;
  canSkipAd: boolean;
  adTimeRemaining: number;
  adTimeUntilSkippable: number;
  adTitle: string;
  adCurrentTime: number;
  adDuration: number;
  
  // Actions
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  togglePiP: () => Promise<void>;
  setPlaybackRate: (rate: number) => void;
  selectTrack: (trackId: string | null) => void;
  skipAd: () => void;
  initializePlayer: (manifestUrl: string, videoId: string, storyboardUrl?: string) => Promise<void>;
  getThumbnail: (time: number) => Promise<any | null>;
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
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isPiP, setIsPiP] = useState(false);

  // Quality / Tracks state
  const [videoTracks, setVideoTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeTrackHeight, setActiveTrackHeight] = useState<number | null>(null);

  // Ad state
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const isAdPlayingRef = useRef(false);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [adTimeUntilSkippable, setAdTimeUntilSkippable] = useState(0);
  const [adTitle, setAdTitle] = useState("");
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const [adDuration, setAdDuration] = useState(0);
  const currentAdRef = useRef<any>(null);

  interface ParsedThumbnail {
    startTime: number;
    endTime: number;
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }
  const thumbnailsRef = useRef<ParsedThumbnail[]>([]);

  // VTT Time Parser (HH:MM:SS.mmm to seconds)
  const parseVttTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    }
    return 0;
  };

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
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const selectTrack = useCallback((trackId: string | null) => {
    if (!playerRef.current) return;
    if (trackId === null) {
      // Enable auto ABR
      playerRef.current.configure({ abr: { enabled: true } });
      setSelectedTrackId(null);
    } else {
      // Find the track and select it
      const track = playerRef.current.getVariantTracks().find((t: any) => t.id.toString() === trackId);
      if (track) {
        playerRef.current.configure({ abr: { enabled: false } });
        playerRef.current.selectVariantTrack(track, true); // true = clear buffer
        setSelectedTrackId(trackId);
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const initializePlayer = useCallback(async (manifestUrl: string, videoId: string, storyboardUrl?: string) => {
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

    const syncActiveTrack = () => {
      const activeTrack = player.getVariantTracks().find((t: any) => t.active);
      if (activeTrack) setActiveTrackHeight(activeTrack.height);
    };
    player.addEventListener('adaptation', syncActiveTrack);
    player.addEventListener('variantchanged', syncActiveTrack);

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
      isAdPlayingRef.current = true;
      
      // Explicitly pause the main video so it doesn't advance in the background
      if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
      }
      
      let title = "Advertisement";
      if (typeof ad.getTitle === 'function' && ad.getTitle()) {
        title = ad.getTitle();
      } else {
        let metadata: { title?: string } | undefined;
        const id1 = typeof ad.getAdId === 'function' ? ad.getAdId() : null;
        if (id1 && adMetadataMapRef.current.has(id1)) {
          metadata = adMetadataMapRef.current.get(id1);
        }
        if (!metadata) {
          for (const key in ad) {
            const val = ad[key];
            if (val && typeof val === 'object' && val.id && adMetadataMapRef.current.has(val.id)) {
              metadata = adMetadataMapRef.current.get(val.id);
              break;
            }
          }
        }
        if (!metadata && adMetadataMapRef.current.size === 1) {
          metadata = Array.from(adMetadataMapRef.current.values())[0];
        }
        if (metadata?.title) {
          title = metadata.title;
        }
      }
      
      setAdTitle(title);
      
      // isSkippable means "is it a skippable type of ad". canSkipNow means "has the countdown finished".
      setCanSkipAd(ad.canSkipNow ? ad.canSkipNow() : false);
      adContainer.style.pointerEvents = 'auto'; // Block clicks to main video
    });

    adManager.addEventListener('ad-stopped', () => {
      currentAdRef.current = null;
      setIsAdPlaying(false);
      isAdPlayingRef.current = false;
      setCanSkipAd(false);
      setAdTimeRemaining(0);
      setAdTimeUntilSkippable(0);
      setAdCurrentTime(0);
      setAdDuration(0);
      adContainer.style.pointerEvents = 'none';
      
      // Sync back UI to the main video explicitly
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
            skipOffset: ad.skipOffset ?? 5,
            title: ad.title
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
            resumeOffset: ad.category === "PRE_ROLL" ? 0 : (ad.resumeOffset ?? null),
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
      
      // Load available tracks
      const tracks = player.getVariantTracks();
      setVideoTracks(tracks);
      
      const activeTrack = tracks.find((t: any) => t.active);
      if (activeTrack) setActiveTrackHeight(activeTrack.height);
      
      if (storyboardUrl) {
        if (storyboardUrl.endsWith('.vtt')) {
          try {
            const vttRes = await fetch(storyboardUrl);
            const vttText = await vttRes.text();
            
            const baseUrl = storyboardUrl.substring(0, storyboardUrl.lastIndexOf('/') + 1);
            const blocks = vttText.split('\n\n');
            const parsedThumbnails: ParsedThumbnail[] = [];
            
            for (const block of blocks) {
              const lines = block.split('\n').filter(l => l.trim() !== '' && !l.includes('WEBVTT'));
              if (lines.length >= 2) {
                const timeMatch = lines[0].match(/(.*) --> (.*)/);
                if (timeMatch) {
                  const startTime = parseVttTime(timeMatch[1]);
                  const endTime = parseVttTime(timeMatch[2]);
                  
                  const urlLine = lines[1];
                  const [filename, hash] = urlLine.split('#xywh=');
                  if (hash) {
                    const [x, y, w, h] = hash.split(',').map(Number);
                    parsedThumbnails.push({
                      startTime,
                      endTime,
                      url: baseUrl + filename,
                      x, y, w, h
                    });
                  }
                }
              }
            }
            thumbnailsRef.current = parsedThumbnails;
          } catch (e) {
            console.warn("Failed to fetch and parse storyboard VTT", e);
          }
        } else {
          console.warn("Skipping legacy storyboard URL (not a VTT file):", storyboardUrl);
        }
      }
    } catch (err: any) {
      if (err.code === 7000) {
        console.warn("Load interrupted (likely due to fast re-mounting).");
      } else {
        console.error("Error loading manifest:", err.code, err.message, err);
      }
    }

  }, [shaka, isSupported]);

  const getThumbnail = useCallback(async (time: number) => {
    if (thumbnailsRef.current.length > 0) {
      const thumb = thumbnailsRef.current.find(t => time >= t.startTime && time <= t.endTime);
      if (thumb) {
        return {
          uris: [thumb.url],
          imageWidth: thumb.w,
          imageHeight: thumb.h,
          positionX: thumb.x,
          positionY: thumb.y,
        };
      }
    }
    return null;
  }, []);

  // Video Element Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isAdPlayingRef.current) {
        setCurrentTime(video.currentTime);
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleRateChange = () => setPlaybackRateState(video.playbackRate);
    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);
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

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, []);

  // Ad metadata lookup map for bulletproof timing
  const adMetadataMapRef = useRef<Map<string, { isSkippable: boolean, skipOffset: number, title?: string }>>(new Map());

  // Handle ad time updates separately by polling if an ad is playing
  useEffect(() => {
    let interval: any;
    if (isAdPlaying) {
      interval = setInterval(() => {
        const ad = currentAdRef.current;
        if (ad && containerRef.current) {
          // Shaka might create its own video element or use the main video.
          // Let's find the active video that is playing the ad.
          const adVideos = Array.from(containerRef.current.querySelectorAll('.shaka-custom-ad-container video')) as HTMLVideoElement[];
          const activeAdVideo = adVideos.find(v => v.currentTime > 0 && !v.paused) || adVideos.find(v => v.src || v.currentSrc);
          
          const activeVideo = activeAdVideo || videoRef.current;
          
          let currentAdTime = 0;
          let currentAdDuration = 0;
          
          if (activeAdVideo) {
            currentAdTime = activeAdVideo.currentTime;
            currentAdDuration = activeAdVideo.duration || 0;
          } else if (videoRef.current) {
            currentAdTime = videoRef.current.currentTime;
            currentAdDuration = videoRef.current.duration || 0;
          }

          setAdCurrentTime(currentAdTime);
          setAdDuration(currentAdDuration);

          if (typeof ad.getRemainingTime === 'function') {
            const r = ad.getRemainingTime();
            setAdTimeRemaining(isNaN(r) ? 0 : Math.max(0, r));
          } else {
            const remaining = currentAdDuration - currentAdTime;
            setAdTimeRemaining(isNaN(remaining) ? 0 : Math.max(0, remaining));
          }

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

          // Determine skippability prioritizing our DB metadata over Shaka Player's defaults
          let timeUntil = 0;
          let canSkip = false;

          if (metadata && !metadata.isSkippable) {
            // Strictly enforce non-skippable
            timeUntil = 0;
            canSkip = false;
          } else if (metadata && metadata.isSkippable) {
            // Strictly enforce our skip offset
            timeUntil = metadata.skipOffset - currentAdTime;
            canSkip = timeUntil <= 0;
          } else if (typeof ad.getTimeUntilSkippable === 'function') {
            // Fallback to Shaka native logic if no metadata found
            timeUntil = ad.getTimeUntilSkippable();
            canSkip = ad.canSkipNow ? ad.canSkipNow() : (timeUntil <= 0);
          }

          setAdTimeUntilSkippable(isNaN(timeUntil) ? 0 : Math.max(0, timeUntil));
          setCanSkipAd(canSkip);
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
        playbackRate,
        isPiP,
        videoTracks,
        selectedTrackId,
        activeTrackHeight,
        isAdPlaying,
        canSkipAd,
        adTimeRemaining,
        adTimeUntilSkippable,
        adTitle,
        adCurrentTime,
        adDuration,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleFullscreen,
        togglePiP,
        setPlaybackRate,
        selectTrack,
        skipAd,
        initializePlayer,
        getThumbnail,
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
