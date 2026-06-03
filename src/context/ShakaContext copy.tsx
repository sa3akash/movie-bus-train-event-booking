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
  }, []);

  const refreshDownloads = useCallback(async () => {
    if (!storageRef.current) return;
    try {
      const list = await storageRef.current.list();
      setDownloads(list);
    } catch (err) {
      console.error("Failed to list downloaded content", err);
    }
  }, []);

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
      // Must await the .promise of the IAbortableOperation
      const operation = storageRef.current.store(manifestUri, metadata);
      await operation.promise;
      
      // Clear progress after success
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });

      await refreshDownloads();
    } catch (error) {
      // Clear progress on error
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
         await operation; // in case older shaka version directly returns promise
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
      
      // Global Player Configuration can go here!
      // player.configure({ ... });

      const controls = ui.getControls();

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
        // Note: Because we are using Shaka UI, we DO NOT need to manually call setContainers(), 
        // initClientSide(), or initInterstitial(). The UI handles it automatically.


        // Fetch custom ads from our self-hosted Ad Server API route
        const adRequestUrl = videoId ? `/api/ads?videoId=${videoId}` : `/api/ads`;
        const res = await fetch(adRequestUrl);
        const data = await res.json();
        
        if (data.success && data.ads) {
          data.ads.forEach((ad: any) => {
            adManager.addCustomInterstitial({
              id: ad.id,
              groupId: null,
              startTime: ad.startTime,
              endTime: ad.endTime,
              uri: ad.uri,
              mimeType: null,
              isSkippable: ad.isSkippable,
              skipOffset: ad.skipOffset,
              skipFor: null,
              canJump: false,
              resumeOffset: null,
              playoutLimit: null,
              once: true,
              pre: false,
              post: false,
              timelineRange: false,
              loop: false,
              overlay: null,
              displayOnBackground: false,
              currentVideo: null,
              background: null,
              clickThroughUrl: null,
              tracking: ad.tracking,
            });
            console.log(`Injected custom ad: ${ad.id} at ${ad.startTime}s`);
          });
        }
      } catch (adErr) {
        console.warn("Failed to load custom ads", adErr);
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
