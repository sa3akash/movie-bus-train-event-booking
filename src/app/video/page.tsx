"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Clapperboard, Activity } from "lucide-react";
import Image from "next/image";
import { HoverVideoPlayer } from "@/components/video/HoverVideoPlayer";

interface Video {
  id: string;
  status: string;
  resolutions: string[] | null;
  thumbnails: string[] | null;
  blurDataUrls: string[] | null;
  duration: string | null;
  dashUrl: string | null;
  hlsUrl: string | null;
  createdAt: string;
}

const VideoCard = ({ video }: { video: Video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered) {
      timer = setTimeout(() => setShowVideo(true), 400); // 400ms delay like YouTube
    } else {
      setShowVideo(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  return (
    <Link 
      href={`/video/${video.id}`} 
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Custom Gradient Thumbnail */}
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-linear-to-br from-zinc-800 to-zinc-950 border border-border shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:border-primary/50 relative">
        
        {/* Poster Image */}
        {video.thumbnails && video.thumbnails.length > 0 && (
          <Image 
            src={video.thumbnails[0]} 
            alt="Video Poster" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? "opacity-0" : "opacity-100"}`}
            fill
            blurDataURL={video.blurDataUrls?.[0]}
            placeholder="blur"
          />
        )}

        {/* Video Player */}
        {showVideo && (video.dashUrl || video.hlsUrl) && (
          <div className="absolute inset-0 z-10 animate-in fade-in duration-300">
            <HoverVideoPlayer manifestUrl={(video.dashUrl || video.hlsUrl) as string} />
          </div>
        )}

        {/* Play Button Overlay */}
        {!showVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] z-20">
            <div className="bg-primary/90 rounded-full p-4 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0 shadow-lg">
              <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && !showVideo && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-medium text-white rounded shadow-sm backdrop-blur-md z-20">
            {Math.floor(parseFloat(video.duration) / 60)}:
            {Math.floor(parseFloat(video.duration) % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-primary to-blue-600 shrink-0" />
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            Transcoded Video #{video.id.slice(0, 8)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Antigravity Studio
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  );
};

const VideoPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineError, setIsOfflineError] = useState(false);

  useEffect(() => {
    fetch("/api/video")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setVideos(data.videos);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch videos. You might be offline.", err);
        setIsOfflineError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <Activity className="h-10 w-10 animate-spin" />
          <p>Loading your amazing videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Clapperboard className="text-primary h-8 w-8" />
            My Video Library
          </h1>
          <Link href="/downloads" className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border border-border/50">
            <Activity className="h-4 w-4" />
            Downloads
          </Link>
        </div>

        {isOfflineError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-red-500/10 p-6 rounded-full mb-4">
              <Activity className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">You are offline</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Connect to the internet to browse new videos.
            </p>
            <Link href="/downloads" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors">
              Go to My Downloads
            </Link>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Clapperboard className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Upload a video in the admin panel and wait for the transcoder to finish processing it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;