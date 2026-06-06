import React from "react";
import type shaka from "shaka-player";

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
      type: 'client' | 'server';
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
}

