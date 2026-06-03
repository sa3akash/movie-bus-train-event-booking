"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Clapperboard, Activity } from "lucide-react";

interface Video {
  id: string;
  status: string;
  resolutions: string[] | null;
  duration: string | null;
  createdAt: string;
}

const VideoPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/video")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVideos(data.videos);
        }
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
        <h1 className="mb-8 text-3xl font-bold tracking-tight flex items-center gap-3">
          <Clapperboard className="text-primary h-8 w-8" />
          My Video Library
        </h1>

        {videos.length === 0 ? (
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
              <Link key={video.id} href={`/video/${video.id}`} className="group relative block">
                {/* Custom Gradient Thumbnail */}
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-border shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:border-primary/50 relative">
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-primary/90 rounded-full p-4 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0 shadow-lg">
                      <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-medium text-white rounded shadow-sm backdrop-blur-md">
                      {Math.floor(parseFloat(video.duration) / 60)}:
                      {Math.floor(parseFloat(video.duration) % 60).toString().padStart(2, "0")}
                    </div>
                  )}
                  
                  {/* Resolution Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {video.resolutions?.map((res) => (
                      <span key={res} className="bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white rounded uppercase tracking-wider backdrop-blur-md border border-white/10">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex-shrink-0" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;