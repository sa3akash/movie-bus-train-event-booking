"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB per chunk
const MAX_CONCURRENCY = 3;

export type UploadStatus = "UPLOADING" | "SUCCESS" | "ERROR" | "CANCELLED";

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  fileUrl?: string;
  error?: string;
  abortController?: AbortController;
}

interface UploadContextType {
  uploads: UploadItem[];
  startUpload: (file: File) => string;
  cancelUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  getUploadById: (id: string) => UploadItem | undefined;
}

const UploadContext = createContext<UploadContextType | null>(null);

export const useUpload = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
};

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const updateUpload = (id: string, data: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const startUpload = (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const abortController = new AbortController();

    setUploads((prev) => [
      ...prev,
      { id, file, progress: 0, status: "UPLOADING", abortController },
    ]);

    // Start background process
    performMultipartUpload(id, file, abortController)
      .then((fileUrl) => {
        updateUpload(id, { status: "SUCCESS", progress: 100, fileUrl });
        toast.success(`Upload complete: ${file.name}`);
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.message === "Aborted") {
          updateUpload(id, { status: "CANCELLED" });
        } else {
          updateUpload(id, { status: "ERROR", error: err.message });
          toast.error(`Upload failed: ${err.message}`);
        }
      });

    return id;
  };

  const cancelUpload = (id: string) => {
    const upload = uploads.find((u) => u.id === id);
    if (upload && upload.abortController && upload.status === "UPLOADING") {
      upload.abortController.abort();
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const getUploadById = (id: string) => {
    return uploads.find((u) => u.id === id);
  };

  const performMultipartUpload = async (id: string, file: File, abortController: AbortController) => {
    // 1. Initialize Multipart Upload
    const totalParts = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
    
    const initRes = await fetch("/api/upload/multipart/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        parts: totalParts,
      }),
      signal: abortController.signal,
    });

    if (!initRes.ok) throw new Error("Failed to initialize upload");
    const { uploadId, key, urls, fileUrl } = await initRes.json();

    const partsResult: { PartNumber: number; ETag: string }[] = [];
    const partProgress: Record<number, number> = {};

    // Helper to upload a single part
    const uploadPart = async (partIndex: number) => {
      const start = partIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const url = urls[partIndex];
      const partNumber = partIndex + 1;

      return new Promise<{ PartNumber: number; ETag: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        const handleAbort = () => {
          xhr.abort();
          reject(new DOMException("Aborted", "AbortError"));
        };
        abortController.signal.addEventListener("abort", handleAbort);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            partProgress[partNumber] = e.loaded;
            const totalUploaded = Object.values(partProgress).reduce((a, b) => a + b, 0);
            const percentage = Math.round((totalUploaded * 100) / file.size);
            updateUpload(id, { progress: percentage });
          }
        };

        xhr.onload = () => {
          abortController.signal.removeEventListener("abort", handleAbort);
          if (xhr.status >= 200 && xhr.status < 300) {
            let eTag = xhr.getResponseHeader("ETag");
            if (!eTag) {
               // Sometimes CORS hides ETag. Must expose it in S3 CORS config!
               return reject(new Error("No ETag received. Check Minio CORS ExposeHeaders for 'ETag'"));
            }
            eTag = eTag.replace(/"/g, "");
            resolve({ PartNumber: partNumber, ETag: eTag });
          } else {
            reject(new Error(`Upload part ${partNumber} failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error(`Network error on part ${partNumber}`));
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(chunk);
      });
    };

    // 2. Concurrency Queue
    let activeUploads = 0;
    let nextPart = 0;
    
    await new Promise<void>((resolve, reject) => {
      const next = () => {
        if (abortController.signal.aborted) {
          return reject(new DOMException("Aborted", "AbortError"));
        }
        
        if (partsResult.length === totalParts) {
          return resolve();
        }

        while (activeUploads < MAX_CONCURRENCY && nextPart < totalParts) {
          const partIndex = nextPart++;
          activeUploads++;
          
          uploadPart(partIndex)
            .then((result) => {
              partsResult.push(result);
              activeUploads--;
              next();
            })
            .catch((err) => {
              // If one fails, we abort everything
              reject(err);
              fetch("/api/upload/multipart/abort", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uploadId, key }),
              }).catch(console.error);
            });
        }
      };
      next();
    });

    // 3. Complete Multipart Upload
    const completeRes = await fetch("/api/upload/multipart/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        uploadId, 
        key, 
        parts: partsResult.sort((a, b) => a.PartNumber - b.PartNumber) 
      }),
      signal: abortController.signal,
    });

    if (!completeRes.ok) throw new Error("Failed to complete multipart upload on backend");

    return fileUrl;
  };

  return (
    <UploadContext.Provider value={{ uploads, startUpload, cancelUpload, removeUpload, getUploadById }}>
      {children}
      {/* Global Progress Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {uploads.map((u) => (
          <div key={u.id} className="bg-background border rounded-lg shadow-lg p-4 flex flex-col gap-2 relative pointer-events-auto">
            <button onClick={() => removeUpload(u.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 pr-6">
              <UploadCloud className="h-5 w-5 text-indigo-500" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{u.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {u.status === "UPLOADING" ? `${u.progress}% • ${(u.file.size / (1024 * 1024)).toFixed(1)} MB` : u.status}
                </span>
              </div>
            </div>
            
            {u.status === "UPLOADING" && (
              <>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${u.progress}%` }} />
                </div>
                <button 
                  onClick={() => cancelUpload(u.id)} 
                  className="text-xs text-red-500 hover:text-red-600 font-medium self-start mt-1"
                >
                  Cancel Upload
                </button>
              </>
            )}

            {u.status === "SUCCESS" && (
              <div className="flex items-center gap-2 text-emerald-600 mt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">Completed</span>
              </div>
            )}

            {u.status === "ERROR" && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Failed</span>
                </div>
                <span className="text-xs text-red-500 line-clamp-2">{u.error}</span>
              </div>
            )}
            
            {u.status === "CANCELLED" && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Cancelled</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </UploadContext.Provider>
  );
}
