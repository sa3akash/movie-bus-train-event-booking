"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";
import { VideoInfo } from "@/components/video/VideoInfo";
import { VideoActions } from "@/components/video/VideoActions";
import { useShakaContext } from "@/context/ShakaContext";

// Dynamically import the ShakaPlayer with NO SSR because it relies on window/navigator.
const ShakaPlayer = dynamic(() => import("@/components/video/ShakaPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black flex items-center justify-center border border-border rounded-xl">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  ),
});

interface VideoData {
  id: string;
  status: string;
  dashUrl: string | null;
  hlsUrl: string | null;
  duration: string | null;
  createdAt: string;
  resolutions: string[] | null;
}

const VideoPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);

  const { downloads, isInitialized } = useShakaContext();

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`/api/video/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network offline");
        return res.json();
      })
      .then((data) => {
        if (data && data.video) {
          setVideo(data.video);
        } else if (data && data.id) {
          setVideo(data as any);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network fetch failed.", err);
        setLoading(false);
      });
  }, [params.id]);

  // Check if video is downloaded and resolve the manifestUrl
  useEffect(() => {
    if (!params.id || !isInitialized || loading) return;
    
    const found = downloads.find((item) => item.appMetadata?.videoId === params.id);
    
    // Set isDownloaded state for the UI
    setIsDownloaded(!!found);
    
    // If we haven't set the manifest URL yet, do it now. 
    // We only do this once to prevent the player from reloading if a download finishes while watching!
    if (!manifestUrl) {
      if (found) {
        console.log("Using offline cached video!");
        setManifestUrl(found.offlineUri);
        
        // If network fetch failed, mock a video object to allow offline playback UI
        if (!video) {
          setVideo({
            id: params.id as string,
            status: "COMPLETED",
            dashUrl: null,
            hlsUrl: null,
            duration: "0",
            createdAt: new Date().toISOString(),
            resolutions: ["OFFLINE"],
          });
        }
      } else {
        console.log("Using network video!");
        setManifestUrl(video?.dashUrl || video?.hlsUrl || null);
      }
    }
  }, [isInitialized, loading, video, params.id, downloads, manifestUrl]);

  if (loading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!video || video.status !== "COMPLETED") {
    // If we're offline and the video wasn't found in offline storage
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-muted p-6 rounded-full mb-4">
          <Loader2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isOffline ? "You are offline" : "Video Unavailable"}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          {isOffline 
            ? "This video is not saved to your device for offline viewing."
            : "This video may not exist or is still processing."}
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-full font-medium transition-colors"
          >
            Go back
          </button>
          {isOffline && (
            <button
              onClick={() => router.push("/downloads")}
              className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Go to Downloads
            </button>
          )}
        </div>
      </div>
    );
  }

  // Manifest URL is now securely managed in state!

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] py-6 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to library
        </button>

        {/* Player Container */}
        {manifestUrl ? (
          <div className="w-full shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50">
            <ShakaPlayer
              manifestUrl={manifestUrl}
              videoId={params.id as string}
              onPlayerReady={(p: any) => setPlayerInstance(p)}
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-xl border border-border">
            <p className="text-muted-foreground">
              No manifest URL found for this video.
            </p>
          </div>
        )}

        {/* Video Info Container */}
        <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <VideoInfo video={video} />
          <VideoActions
            video={video}
            playerInstance={playerInstance}
            isDownloaded={isDownloaded}
            setIsDownloaded={setIsDownloaded}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
