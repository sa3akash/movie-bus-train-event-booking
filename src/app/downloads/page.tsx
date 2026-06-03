"use client";

import React from "react";
import Link from "next/link";
import { Download, Play, Trash2, ArrowLeft } from "lucide-react";
import { useShakaOffline } from "@/context/ShakaOfflineContext";

const DownloadsPage = () => {
  const { downloads, removeContent, isSupported } = useShakaOffline();

  const handleDelete = async (offlineUri: string) => {
    try {
      await removeContent(offlineUri);
    } catch (err) {
      console.error("Failed to remove offline video", err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/video" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Download className="text-primary h-8 w-8" />
            My Downloads
          </h1>
        </div>

        {!isSupported ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            Initializing Offline Storage...
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 rounded-2xl border border-border/50">
            <div className="bg-muted p-6 rounded-full mb-4">
              <Download className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No downloaded videos</h2>
            <p className="text-muted-foreground max-w-sm">
              Videos you download will securely appear here for offline viewing. You don't need an internet connection to watch them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloads.map((video) => {
              const videoId = video.appMetadata?.videoId || "Unknown";
              const sizeMB = (video.size / (1024 * 1024)).toFixed(1);

              return (
                <div key={video.offlineUri} className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all shadow-sm group relative">
                  
                  {/* Thumbnail */}
                  <Link href={`/video/${videoId}`} className="relative h-28 w-48 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 block">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px]">
                      <div className="bg-primary/90 rounded-full p-2 transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col justify-between flex-1 py-1 overflow-hidden">
                    <div>
                      <Link href={`/video/${videoId}`} className="hover:text-primary transition-colors">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                          Transcoded Video #{videoId.slice(0, 8)}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">Antigravity Studio</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                        <span>{sizeMB} MB</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-green-500">Available Offline</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(video.offlineUri)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Delete Download"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;
