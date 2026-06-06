/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import type shaka from "shaka-player/dist/shaka-player.ui";

export interface OfflineVideo {
  offlineUri: string;
  originalManifestUri: string;
  duration: number;
  size: number;
  appMetadata: {
    videoId?: string;
    downloadedAt?: string;
    [key: string]: unknown;
  };
}

export interface PlayerInstance {
  player: shaka.Player;
  ui: shaka.ui.Overlay;
}

interface ShakaContextType {
  shaka: typeof shaka | null; // the loaded shaka module
  isSupported: boolean;
  isInitialized: boolean;
  downloads: OfflineVideo[];
  downloadProgress: Record<string, number>;
  refreshDownloads: () => Promise<void>;
  downloadContent: (manifestUri: string, videoId: string, resolution?: string) => Promise<void>;
  removeContent: (offlineUri: string) => Promise<void>;
  initPlayer: (
    videoElement: HTMLVideoElement,
    containerElement: HTMLDivElement,
    manifestUrl: string,
    videoId?: string,
    onPlayerReady?: (player: shaka.Player) => void
  ) => Promise<PlayerInstance | null>;
}

const ShakaContext = createContext<ShakaContextType | null>(null);

export const ShakaProvider = ({ children }: { children: ReactNode }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloads, setDownloads] = useState<OfflineVideo[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [shakaInstance, setShakaInstance] = useState<typeof shaka | null>(null);
  
  const storageRef = useRef<shaka.offline.Storage | null>(null);
  const shakaRef = useRef<typeof shaka | null>(null);
  // Keep track of dynamically registered ads to prevent duplicate configuration loops
  const registeredAdsRef = useRef<Set<string>>(new Set());

  const refreshDownloads = useCallback(async () => {
    if (!storageRef.current) return;
    try {
      const list = await storageRef.current.list();
      setDownloads(list.map(item => ({
        offlineUri: item.offlineUri || "",
        originalManifestUri: item.originalManifestUri,
        duration: item.duration,
        size: item.size,
        appMetadata: item.appMetadata as OfflineVideo["appMetadata"]
      })));
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
      // Initialize Storage
      const storage = new shaka.offline.Storage();
      storageRef.current = storage;

      refreshDownloads().then(() => {
        setIsSupported(true);
        setIsInitialized(true);
        setShakaInstance(shaka);
      });
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

  const downloadContent = useCallback(async (manifestUri: string, videoId: string, resolution?: string) => {
    if (!storageRef.current) throw new Error("Storage not initialized");

    const storage = storageRef.current;
    
    // @ts-expect-error - defaultTrackSelect is not typed in shaka.extern
    let trackSelectionCallback = shakaRef.current?.offline?.Storage?.defaultTrackSelect;

    if (resolution) {
      const heightMatch = resolution.match(/(\d+)p/);
      const height = heightMatch ? parseInt(heightMatch[1], 10) : parseInt(resolution, 10);
      
      if (!isNaN(height)) {
        trackSelectionCallback = (tracks: shaka.extern.Track[]) => {
          const hasExactMatch = tracks.some(t => t.type === 'video' && t.height === height);
          if (hasExactMatch) {
            return tracks.filter((t) =>
              t.type === 'audio' ||
              t.type === 'text' ||
              (t.type === 'video' && t.height === height)
            );
          }
          // @ts-expect-error - defaultTrackSelect is not typed
          if (shakaRef.current?.offline?.Storage?.defaultTrackSelect) {
            // @ts-expect-error - defaultTrackSelect is not typed
            return shakaRef.current.offline.Storage.defaultTrackSelect(tracks);
          }
          return tracks;
        };
      }
    }

    // Configure storage for this specific download to track progress
    storage.configure({
      offline: {
        progressCallback: (content: shaka.extern.StoredContent, progress: number) => {
          setDownloadProgress((prev) => ({
            ...prev,
            [videoId]: progress,
          }));
        },
        ...(trackSelectionCallback && { trackSelectionCallback }),
      },
    });

    const metadata = {
      videoId,
      downloadedAt: new Date().toISOString(),
    };

    try {
      const operation = storageRef.current.store(manifestUri, metadata);
      if (operation && typeof (operation as any).promise !== 'undefined') {
        await (operation as any).promise;
      } else {
        await operation;
      }
      
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
      if (operation && typeof (operation as any).promise !== 'undefined') {
        await (operation as any).promise;
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
    onPlayerReady?: (player: shaka.Player) => void
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

      controls?.addEventListener("error", (event: any) => {
        console.error("Shaka UI Error", event?.detail);
      });

      // Initialize Custom AdManager Logic
      try {
        const adManager = player.getAdManager();

        // Fetch custom ads from our self-hosted Ad Server API route
        const adRequestUrl = videoId ? `/api/ads?videoId=${videoId}` : `/api/ads`;
        const res = await fetch(adRequestUrl);
        const data = await res.json();
        
        if (data.success && data.ads) {
          data.ads.forEach((ad: {
            id: string;
            groupId?: string;
            startTime: number;
            endTime?: number;
            uri: string;
            mimeType?: string;
            isSkippable?: boolean;
            skipOffset?: number;
            skipFor?: number;
            resumeOffset?: number;
            playoutLimit?: number;
            category: string;
            clickThroughUrl?: string;
            tracking?: Record<string, string[]>;
          }) => {
            // Safety check: skip adding if this specific ad ID has already been assigned 
            if (registeredAdsRef.current.has(ad.id)) return;

            const safeTracking: Record<string, string[]> = {};
            if (ad.tracking) {
              for (const [event, urls] of Object.entries(ad.tracking)) {
                safeTracking[event] = (urls as string[]).map((url: string) => 
                  url.startsWith('/') ? `${window.location.origin}${url}` : url
                );
              }
            }

            adManager?.addCustomInterstitial({
              id: ad.id,
              groupId: ad.groupId || null,
              startTime: ad.startTime,
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
              tracking: Object.keys(safeTracking).length > 0 ? (safeTracking as any) : null,
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
        shaka: shakaInstance,
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