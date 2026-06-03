/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";

export interface OfflineVideo {
  offlineUri: string;
  originalManifestUri: string;
  duration: number;
  size: number;
  appMetadata: any;
}

interface ShakaOfflineContextType {
  downloads: OfflineVideo[];
  downloadProgress: Record<string, number>;
  isSupported: boolean;
  refreshDownloads: () => Promise<void>;
  downloadContent: (manifestUri: string, videoId: string) => Promise<void>;
  removeContent: (offlineUri: string) => Promise<void>;
}

const ShakaOfflineContext = createContext<ShakaOfflineContextType | null>(null);

export const ShakaOfflineProvider = ({ children }: { children: ReactNode }) => {
  const [isSupported, setIsSupported] = useState(false);
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

      refreshDownloads();
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

  const refreshDownloads = async () => {
    if (!storageRef.current) return;
    try {
      const list = await storageRef.current.list();
      setDownloads(list);
    } catch (err) {
      console.error("Failed to list downloaded content", err);
    }
  };

  const downloadContent = async (manifestUri: string, videoId: string) => {
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
  };

  const removeContent = async (offlineUri: string) => {
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
  };

  return (
    <ShakaOfflineContext.Provider
      value={{
        downloads,
        downloadProgress,
        isSupported,
        refreshDownloads,
        downloadContent,
        removeContent,
      }}
    >
      {children}
    </ShakaOfflineContext.Provider>
  );
};

export const useShakaOffline = () => {
  const context = useContext(ShakaOfflineContext);
  if (!context) {
    throw new Error("useShakaOffline must be used within a ShakaOfflineProvider");
  }
  return context;
};
