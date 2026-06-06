"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";
import { VideoInfo } from "@/components/video/VideoInfo";
import { VideoActions } from "@/components/video/VideoActions";
import { useShakaContext } from "@/context/ShakaContext";

const AdvancedVideoPlayer = dynamic(
  () =>
    import("@/components/advanced-video-player").then(
      (mod) => mod.AdvancedVideoPlayer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-black flex items-center justify-center border border-border rounded-xl shadow-2xl">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    ),
  },
);

interface VideoData {
  id: string;
  status: string;
  dashUrl: string | null;
  hlsUrl: string | null;
  duration: string | null;
  createdAt: string;
  resolutions: string[] | null;
  thumbnails: string[] | null;
  storyboardUrl: string | null;
  storyboards?: { high?: string; medium?: string; low?: string } | null;
  blurhashes: string[] | null;
  blurDataUrls: string[] | null;
}

const VideoPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [effectiveStoryboardUrl, setEffectiveStoryboardUrl] = useState<
    string | undefined
  >(undefined);

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

  useEffect(() => {
    if (!video) return;

    const updateStoryboard = () => {
      let url = video.storyboardUrl || undefined;

      if (video.storyboards) {
        // Modern browsers support navigator.connection
        const conn =
          (navigator as any).connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection;
        if (conn && conn.effectiveType) {
          if (conn.effectiveType === "5g" || conn.effectiveType === "4g") {
            url = video.storyboards.high || url;
          } else if (
            conn.effectiveType === "slow-4g" ||
            conn.effectiveType === "3g"
          ) {
            url = video.storyboards.medium || url;
          } else {
            url = video.storyboards.low || url;
          }
        } else {
          // Fallback if network info is not available
          url = video.storyboards.high || url;
        }
      }

      setEffectiveStoryboardUrl(url);
    };

    updateStoryboard();

    // Listen for network changes (e.g. toggling throttling in DevTools)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateStoryboard);
      return () => connection.removeEventListener("change", updateStoryboard);
    }
  }, [video]);

  // Check if video is downloaded and resolve the manifestUrl
  useEffect(() => {
    if (!params.id || !isInitialized || loading) return;

    const found = downloads.find(
      (item) => item.appMetadata?.videoId === params.id,
    );

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
            thumbnails: null,
            storyboardUrl: null,
            storyboards: null,
            blurhashes: null,
            blurDataUrls: null,
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
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

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
          <div className="w-full">
            <AdvancedVideoPlayer
              manifestUrl={manifestUrl}
              videoId={params.id as string}
              posterUrl={video.thumbnails?.[0]}
              blurDataUrl={video.blurDataUrls?.[0]}
              storyboardUrl={effectiveStoryboardUrl}
              ads={{ requestUrl: `/api/ads?videoId=${params.id}` }}
              // Robust Player Configurations (all optional, overriding Shaka defaults)
              buffering={{
                bufferingGoal: 60, // Buffer 60 seconds of video ahead
                rebufferingGoal: 15, // Require 15 seconds to resume playback if stalled
                bufferBehind: 30, // Keep 30 seconds of video behind in the buffer for smooth rewinding
                ignoreTextStreamFailures: true, // Don't fail playback if subtitles fail to load
              }}
              retryParameters={{
                manifest: {
                  maxAttempts: 5,
                  baseDelay: 1000,
                  backoffFactor: 2,
                  timeout: 30000,
                },
                streaming: {
                  maxAttempts: 5,
                  baseDelay: 1000,
                  backoffFactor: 2,
                  timeout: 30000,
                },
                drm: {
                  maxAttempts: 5,
                  baseDelay: 1000,
                  backoffFactor: 2,
                  timeout: 30000,
                },
              }}
              // lowLatencyMode={true} // Uncomment if this is a live stream
              chapters={[
                {
                  id: "1",
                  title: "helo",
                  startTime: 0,
                  endTime: 5,
                },
                {
                  id: "2",
                  title: "helo 2",
                  startTime: 5,
                  endTime: 10,
                },
                {
                  id: "3",
                  title: "helo 3",
                  startTime: 10,
                  endTime: 15,
                },
                {
                  id: "4",
                  title: "helo 4",
                  startTime: 15,
                  endTime: 20,
                },
                {
                  id: "5",
                  title: "helo 5",
                  startTime: 20,
                  endTime: 25,
                },
                {
                  id: "6",
                  title: "helo 6",
                  startTime: 25,
                  endTime: 30,
                },
                {
                  id: "7",
                  title: "helo 7",
                  startTime: 30,
                  endTime: 35,
                },
                {
                  id: "8",
                  title: "helo 8",
                  startTime: 35,
                  endTime: 40,
                },
                {
                  id: "9",
                  title: "helo 9",
                  startTime: 40,
                  endTime: 45,
                },
                {
                  id: "10",
                  title: "helo 10",
                  startTime: 45,
                  endTime: 56,
                },
              ]}
              isLive={true}
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
