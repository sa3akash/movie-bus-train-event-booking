/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";

export interface OfflineVideo {
  offlineUri: string;
  originalManifestUri: string;
  duration: number;
  size: number;
  appMetadata: any;
}

export interface PlayerInstance {
  player: any;
  ui: any;
}

interface ShakaContextType {
  shaka: any | null; // the loaded shaka module
  isSupported: boolean;
  isInitialized: boolean;
  downloads: OfflineVideo[];
  downloadProgress: Record<string, number>;
  refreshDownloads: () => Promise<void>;
  downloadContent: (manifestUri: string, videoId: string) => Promise<void>;
  removeContent: (offlineUri: string) => Promise<void>;
  initPlayer: (
    videoElement: HTMLVideoElement,
    containerElement: HTMLDivElement,
    manifestUrl: string,
    videoId?: string,
    onPlayerReady?: (player: any) => void
  ) => Promise<PlayerInstance | null>;
}

const ShakaContext = createContext<ShakaContextType | null>(null);

export const ShakaProvider = ({ children }: { children: ReactNode }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloads, setDownloads] = useState<OfflineVideo[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  
  const storageRef = useRef<any>(null);
  const shakaRef = useRef<any>(null);
  // Keep track of dynamically registered ads to prevent duplicate configuration loops
  const registeredAdsRef = useRef<Set<string>>(new Set());

  const refreshDownloads = useCallback(async () => {
    if (!storageRef.current) return;
    try {
      const list = await storageRef.current.list();
      setDownloads(list);
    } catch (err) {
      console.error("Failed to list downloaded content", err);
    }
  }, []);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const shaka = require("shaka-player/dist/shaka-player.ui.js");
    shakaRef.current = shaka;

    shaka.polyfill.installAll();

    if (shaka.Player.isBrowserSupported()) {
      setIsSupported(true);
      
      // Initialize Storage
      const storage = new shaka.offline.Storage();
      storageRef.current = storage;

      refreshDownloads().then(() => setIsInitialized(true));
    } else {
      console.error("Browser not supported for Shaka Player");
    }

    return () => {
      if (storageRef.current) {
        storageRef.current.destroy();
        storageRef.current = null;
      }
    };
  }, [refreshDownloads]);

  const downloadContent = useCallback(async (manifestUri: string, videoId: string) => {
    if (!storageRef.current) throw new Error("Storage not initialized");

    // Configure storage for this specific download to track progress
    storageRef.current.configure({
      offline: {
        progressCallback: (content: any, progress: number) => {
          setDownloadProgress((prev) => ({
            ...prev,
            [videoId]: progress,
          }));
        },
      },
    });

    const metadata = {
      videoId,
      downloadedAt: new Date().toISOString(),
    };

    try {
      const operation = storageRef.current.store(manifestUri, metadata);
      await operation.promise;
      
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });

      await refreshDownloads();
    } catch (error) {
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });
      console.error("Failed to download content:", error);
      throw error;
    }
  }, [refreshDownloads]);

  const removeContent = useCallback(async (offlineUri: string) => {
    if (!storageRef.current) throw new Error("Storage not initialized");

    try {
      const operation = storageRef.current.remove(offlineUri);
      if (operation.promise) {
        await operation.promise;
      } else {
         await operation;
      }
      await refreshDownloads();
    } catch (error) {
      console.error("Failed to remove offline content:", error);
      throw error;
    }
  }, [refreshDownloads]);

  const initPlayer = useCallback(async (
    videoElement: HTMLVideoElement,
    containerElement: HTMLDivElement,
    manifestUrl: string,
    videoId?: string,
    onPlayerReady?: (player: any) => void
  ): Promise<PlayerInstance | null> => {
    if (!shakaRef.current) return null;
    const shaka = shakaRef.current;

    try {
      const player = new shaka.Player(videoElement);
      const ui = new shaka.ui.Overlay(player, containerElement, videoElement);
      const controls = ui.getControls();

      // Clear out previously tracked ads for a fresh instance initiation
      registeredAdsRef.current.clear();

      // Listen for error events
      player.addEventListener("error", (event: any) => {
        console.error("Shaka Player Error", event.detail);
      });

      controls.addEventListener("error", (event: any) => {
        console.error("Shaka UI Error", event.detail);
      });

      // Initialize Custom AdManager Logic
      try {
        const adManager = player.getAdManager();
        // const csContainer = controls.getClientSideAdContainer();
        // const ssContainer = controls.getServerSideAdContainer();
        // adManager.setContainers(csContainer, ssContainer);

        // Fetch custom ads from our self-hosted Ad Server API route
        const adRequestUrl = videoId ? `/api/ads?videoId=${videoId}` : `/api/ads`;
        const res = await fetch(adRequestUrl);
        const data = await res.json();
        
        if (data.success && data.ads) {
          data.ads.forEach((ad: any) => {
            // Safety check: skip adding if this specific ad ID has already been assigned 
            if (registeredAdsRef.current.has(ad.id)) return;

            // Fix Cross-Origin tracking issues:
            // Shaka Player resolves relative tracking URLs against the ad's manifest URI.
            // If the ad is hosted on a CDN, the tracking URL becomes cross-origin and fails/aborts the ad!
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
              resumeOffset: ad.category === "PRE_ROLL" ? 0 : (ad.resumeOffset ?? null), // 0 restarts video.
              playoutLimit: ad.playoutLimit ?? null, // Null is default, 1 might strictly limit duration in some edge cases
              once: true,
              pre: ad.category === "PRE_ROLL", // Use explicit DB category
              post: ad.category === "POST_ROLL", // Support post-roll
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
            console.log(`Injected custom ad safely: ${ad.id} at ${ad.startTime}s`);
          });
        }
      } catch (adErr) {
        console.warn("Failed to load custom ads cleanly", adErr);
      }

      if (onPlayerReady) {
        onPlayerReady(player);
      }

      await player.load(manifestUrl);
      
      return { player, ui };
    } catch (err) {
      console.error("Player failed to initialize or load", err);
      return null;
    }
  }, []);

  return (
    <ShakaContext.Provider
      value={{
        shaka: shakaRef.current,
        downloads,
        downloadProgress,
        isSupported,
        isInitialized,
        refreshDownloads,
        downloadContent,
        removeContent,
        initPlayer
      }}
    >
      {children}
    </ShakaContext.Provider>
  );
};

export const useShakaContext = () => {
  const context = useContext(ShakaContext);
  if (!context) {
    throw new Error("useShakaContext must be used within a ShakaProvider");
  }
  return context;
};