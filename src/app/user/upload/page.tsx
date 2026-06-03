"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoUpload } from "@/components/admin/VideoUpload";
import { Film, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UserUploadPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleCopy = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center py-12 px-4 md:px-8">
      <div className="max-w-3xl w-full space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Upload a Movie
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your massive 4K or 8K movies effortlessly.
          </p>
        </div>

        <Card className="shadow-lg border-muted">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Film className="h-6 w-6 text-indigo-500" />
              Movie File
            </CardTitle>
            <CardDescription className="text-base">
              Upload your video file here. The background uploader will handle chunks up to 5TB safely. You can navigate around the app while it uploads.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VideoUpload 
              value={videoUrl} 
              onChange={(url) => setVideoUrl(url)} 
              className="w-full"
            />

            {videoUrl && (
              <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Upload Complete!</h3>
                </div>
                <p className="text-sm text-emerald-600/80">
                  Your video has been securely uploaded to the cloud and is ready to be shared or embedded.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-white border border-emerald-200 rounded-md px-3 py-2 text-sm text-muted-foreground truncate">
                    {videoUrl}
                  </div>
                  <Button onClick={handleCopy} variant="outline" className="shrink-0 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
