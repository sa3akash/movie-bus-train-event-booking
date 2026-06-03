"use client";

import React, { useEffect, useState } from "react";
import { Share2, ThumbsUp, Download, CheckCircle2, Loader2 } from "lucide-react";

interface VideoData {
  id: string;
  dashUrl: string | null;
  hlsUrl: string | null;
}

interface VideoActionsProps {
  video: VideoData;
  playerInstance: any;
  isDownloaded: boolean;
  setIsDownloaded: (val: boolean) => void;
  setOfflineUri: (val: string | null) => void;
}

export const VideoActions: React.FC<VideoActionsProps> = ({ 
  video, 
  playerInstance, 
  isDownloaded, 
  setIsDownloaded, 
  setOfflineUri 
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Check offline storage when player is ready
  useEffect(() => {
    if (!playerInstance || !video) return;

    const checkOfflineStatus = async () => {
      try {
        const shaka = require("shaka-player/dist/shaka-player.ui.js");
        
        const storage = new shaka.offline.Storage(playerInstance);
        const list = await storage.list();
        
        const found = list.find((item: any) => item.appMetadata?.videoId === video.id);
        if (found) {
          setIsDownloaded(true);
          setOfflineUri(found.offlineUri);
        }
        storage.destroy();
      } catch (err) {
        console.error("Failed to check offline status", err);
      }
    };

    checkOfflineStatus();
  }, [playerInstance, video, setIsDownloaded, setOfflineUri]);

  const handleDownload = async () => {
    if (!playerInstance || !video) return;
    
    try {
      const shaka = require("shaka-player/dist/shaka-player.ui.js");

      const storage = new shaka.offline.Storage(playerInstance);
      
      storage.configure({
        offline: {
          progressCallback: (content: any, progress: number) => {
            console.log("Download Progress:", progress);
            setDownloadProgress(Math.round(progress * 100));
          },
        },
      });

      const manifestUrl = video.dashUrl || video.hlsUrl;
      if (!manifestUrl) throw new Error("No manifest URL found");

      console.log("Starting download for manifest:", manifestUrl);
      setDownloadProgress(0);
      
      // Store the stream securely in IndexedDB!
      const content = await storage.store(manifestUrl, { videoId: video.id });
      
      console.log("Download complete! Offline URI:", content.offlineUri);
      setIsDownloaded(true);
      setOfflineUri(content.offlineUri);
      setDownloadProgress(null);
      storage.destroy();
      alert("Successfully stored in browser offline cache!");
    } catch (err: any) {
      console.error("Download failed", err);
      setDownloadProgress(null);
      alert("Failed to download video: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="flex gap-3 shrink-0 flex-wrap">
      <button className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-4 py-2 rounded-full font-medium transition-colors border border-border/50">
        <ThumbsUp className="h-5 w-5" />
        <span>Like</span>
      </button>
      <button className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-4 py-2 rounded-full font-medium transition-colors border border-border/50">
        <Share2 className="h-5 w-5" />
        <span>Share</span>
      </button>

      {/* DOWNLOAD BUTTON */}
      {isDownloaded ? (
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-medium border border-green-500/20">
          <CheckCircle2 className="h-5 w-5" />
          <span>Downloaded</span>
        </div>
      ) : (
        <button 
          onClick={handleDownload}
          disabled={downloadProgress !== null}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-medium transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {downloadProgress !== null ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{downloadProgress}%</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Download</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
