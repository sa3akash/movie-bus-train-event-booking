"use client";

import React, { useState, useRef } from "react";
import { Loader2, UploadCloud, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface VideoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function VideoUpload({
  value,
  onChange,
  className = "",
}: VideoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      // 1. Get Presigned URL
      const presignedRes = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedRes.ok) {
        throw new Error("Failed to get secure upload URL");
      }

      const { presignedUrl, fileUrl } = await presignedRes.json();

      // 2. Upload file directly to S3 using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            setProgress(percentage);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setSessionUrl(fileUrl);
      onChange(fileUrl);
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      if (error.message !== "Upload cancelled") {
        toast.error(error.message || "Failed to upload video");
      }
    } finally {
      setLoading(false);
      setProgress(0);
      xhrRef.current = null;
      e.target.value = "";
    }
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  const handleRemove = () => {
    if (value && value === sessionUrl) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      }).catch((err) => console.error("Failed to cleanup video", err));
    }
    onChange(null);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {value ? (
        <div className="relative inline-block border rounded-md p-1 bg-muted/20 w-max max-w-full">
          <div className="flex items-center gap-3 p-2 pr-8 truncate">
            <div className="h-10 w-10 shrink-0 bg-indigo-100 rounded-md flex items-center justify-center">
              <Video className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate max-w-[200px]">
                Video Uploaded
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline truncate max-w-[200px]"
              >
                {value}
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors">
          {loading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <span className="text-sm font-medium text-indigo-600">
                Uploading: {progress}%
              </span>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
                className="h-8 mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Cancel Upload
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Click or drag video to upload directly
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WEBM, OGG (Scalable Direct-to-Storage)
              </p>
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
                disabled={loading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
