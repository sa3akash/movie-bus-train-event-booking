"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";

interface VideoData {
  id: string;
  createdAt: string;
  resolutions: string[] | null;
}

interface VideoInfoProps {
  video: VideoData;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-foreground">
        Transcoded Video #{video.id}
      </h1>
      
      <div className="mt-4 flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-full bg-linear-to-tr from-primary to-blue-600 shadow-md" />
        <div>
          <h3 className="font-semibold text-foreground text-lg leading-none">Antigravity Studio</h3>
          <p className="text-sm text-muted-foreground mt-1">1.2M subscribers</p>
        </div>
        <button className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-full font-semibold transition-colors shadow-sm">
          Subscribe
        </button>
      </div>
      
      <div className="mt-6 bg-muted/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground flex gap-2">
          <span>124,532 views</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This is a beautifully transcoded adaptive bitrate video powered by FFmpeg, Shaka Packager, and BullMQ. 
          It automatically switches between the following resolutions based on your network speed: 
          <strong className="text-foreground ml-1">
            {video.resolutions?.join(", ") || "Unknown"}
          </strong>.
        </p>
      </div>
    </div>
  );
};
