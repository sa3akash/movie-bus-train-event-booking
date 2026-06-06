import React from "react";

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

  // Comprehensive Shaka Player Configuration
  // This allows overriding ABR algorithms, streaming buffer sizes, DRM, offline, etc.
  shakaConfig?: any; // shaka.extern.PlayerConfiguration
  
  // Custom Interstitial Ads Configuration
  ads?: {
    customAds?: any[]; // Pass an array of ad objects directly
    requestUrl?: string; // OR provide an API endpoint to fetch them automatically
    adTagUrl?: string; // OR provide a standard VAST/VMAP tag
  };
  
  // Event Callbacks
  onPlayerReady?: (player: any) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onAdStart?: (adInfo: any) => void;
  onAdEnd?: () => void;
  onError?: (error: any) => void;
}
