import React from "react";
import type shaka from "shaka-player";
import { Chapter } from "./context";

export interface AdvancedVideoPlayerProps {
  // Core Media
  manifestUrl: string;
  videoId?: string; // Optional identifier for telemetry/ads tracking
  posterUrl?: string;
  blurDataUrl?: string;
  storyboardUrl?: string; // .vtt or image sprite

  // HTML5 Video Attributes
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  startTime?: number;
  className?: string;
  style?: React.CSSProperties;
  isLive?: boolean;

  // Comprehensive Shaka Player Configuration
  shakaConfig?: shaka.extern.PlayerConfiguration;

  // DRM Configuration
  drm?: Partial<shaka.extern.DrmConfiguration>;

  // Buffering Configuration
  buffering?: Partial<shaka.extern.StreamingConfiguration>;

  // Network Retry Configuration
  retryParameters?: {
    manifest?: Partial<shaka.extern.RetryParameters>;
    streaming?: Partial<shaka.extern.RetryParameters>;
    drm?: Partial<shaka.extern.RetryParameters>;
  };

  // Low Latency Mode
  lowLatencyMode?: boolean;

  // Network Filters (License Wrapping, Auth, etc.)
  licenseRequestFilter?: shaka.extern.RequestFilter;
  licenseResponseFilter?: shaka.extern.ResponseFilter;

  // Ads Configuration (IMA, MediaTailor, Interstitials)
  ads?: {
    // 1. Custom Interstitials
    customAds?: any[]; // Pass an array of ad objects directly
    requestUrl?: string; // OR provide an API endpoint to fetch them automatically

    // 2. Client Side Ad Insertion (IMA)
    adTagUrl?: string; // Simple VAST/VMAP ad tag url using IMA HTML5 SDK

    // 3. Server Side Ad Insertion (IMA DAI)
    imaServerSide?: {
      // VOD
      contentSourceId?: string;
      videoId?: string;
      // Live
      assetKey?: string;
    };

    // 4. AWS Elemental MediaTailor
    mediaTailor?: {
      url: string;
      type: "client" | "server";
      adsParams?: Record<string, any>;
    };
  };

  // Event Callbacks
  onPlayerReady?: (player: shaka.Player) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onAdStart?: (adInfo: any) => void;
  onAdEnd?: () => void;
  onError?: (error: shaka.util.Error) => void;

  // Fallback Chapters (if not provided by manifest/VTT)
  chapters?: Chapter[];
}

export interface ParsedThumbnail {
  startTime: number;
  endTime: number;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AdvancedPlayerContextType {
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

  // Subtitles / Captions
  textTracks: any[];
  selectedTextTrackId: string | null;
  isTextTrackVisible: boolean;

  // Audio Languages
  audioLanguages: any[];
  selectedAudioLanguage: string;

  // Chapters
  chapters: any[];

  // Live
  isLiveState: boolean;
  seekRange: { start: number; end: number };

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
  initializePlayer: (props: AdvancedVideoPlayerProps) => Promise<void>;
  getThumbnail: (time: number) => Promise<any | null>;
  loadVttStoryboard: (url: string) => Promise<void>;
  getStats: () => StatsType | null;
  setCurrentTime: (time: number) => void;
  toggleTextTrackVisibility: () => void;
  selectTextTrack: (trackId: string | null) => void;
  selectAudioLanguage: (language: string) => void;
  goToLive: () => void;
}

export interface StatsType {
  height: number;
  width: number;

  droppedFrames: number;
  estimatedBandwidth:number;
  streamBandwidth:number;
  liveLatency:number;

  loadLatency:number;
  playTime:number;
  bufferingTime:number;
  
  videoWidth: number;
  videoHeight: number;
  playerWidth: number;
  playerHeight: number;
  volume: number;
  muted: boolean;
  bufferHealth: number;
  videoCodec: string;
  audioCodec: string;
  isLive: boolean;
}
