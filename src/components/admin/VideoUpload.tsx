"use client";

import React, { useEffect, useState } from "react";
import { UploadCloud, Video, X } from "lucide-react";
import { useUpload } from "@/providers/UploadProvider";

interface VideoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function VideoUpload({ value, onChange, className = "" }: VideoUploadProps) {
  const { startUpload, getUploadById } = useUpload();
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const activeUpload = activeUploadId ? getUploadById(activeUploadId) : undefined;

  useEffect(() => {
    // If the global upload completes successfully, trigger onChange with the final URL
    if (activeUpload?.status === "SUCCESS" && activeUpload.fileUrl && activeUpload.fileUrl !== value) {
      onChange(activeUpload.fileUrl);
    }
    // If the global upload is cancelled or errors, we don't automatically clear the value
    // unless they actively click "Cancel". The global widget handles the errors.
  }, [activeUpload?.status, activeUpload?.fileUrl, onChange, value]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Start background upload via the provider
    const id = startUpload(file);
    setActiveUploadId(id);

    e.target.value = "";
  };

  const handleRemove = () => {
    // If we have an active session for this component, we don't necessarily abort the global upload
    // But if we want to, we could call `cancelUpload(activeUploadId)`.
    // The user might just want to remove the video from this movie form.
    onChange(null);
    setActiveUploadId(null);
  };

  const isUploading = activeUpload?.status === "UPLOADING";
  const progress = activeUpload?.progress || 0;

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
                Video Selected
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
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <span className="text-sm font-medium text-indigo-600">
                Uploading in background: {progress}%
              </span>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You can safely navigate away. The upload will continue.
              </p>
            </div>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Click or drag video to upload (20GB+ supported)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Background Multipart Upload Engine
              </p>
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
