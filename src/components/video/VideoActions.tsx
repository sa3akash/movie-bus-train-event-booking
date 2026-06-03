"use client";

import React, { useEffect } from "react";
import { Share2, ThumbsUp, Download, CheckCircle2, Loader2 } from "lucide-react";
import { useShakaOffline } from "@/context/ShakaOfflineContext";

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
  const { downloads, downloadContent, downloadProgress, isSupported } = useShakaOffline();

  // Check offline storage synchronously from the context state
  useEffect(() => {
    const found = downloads.find((item) => item.appMetadata?.videoId === video.id);
    if (found) {
      setIsDownloaded(true);
      setOfflineUri(found.offlineUri);
    } else {
      setIsDownloaded(false);
      setOfflineUri(null);
    }
  }, [downloads, video.id, setIsDownloaded, setOfflineUri]);

  const handleDownload = async () => {
    const manifestUrl = video.dashUrl || video.hlsUrl;
    if (!manifestUrl) return;
    
    try {
      await downloadContent(manifestUrl, video.id);
      alert("Successfully stored in browser offline cache!");
    } catch (err: any) {
      console.error("Download failed", err);
      alert("Failed to download video: " + (err.message || "Unknown error"));
    }
  };

  const progressValue = downloadProgress[video.id] !== undefined
    ? Math.round(downloadProgress[video.id] * 100)
    : null;

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
          disabled={progressValue !== null || !isSupported}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-medium transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {progressValue !== null ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{progressValue}%</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>{isSupported ? "Download" : "Not Supported"}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
