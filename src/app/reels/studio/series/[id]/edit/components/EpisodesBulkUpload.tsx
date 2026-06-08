"use client";

import React, { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/app/reels/studio/components/UploadDropzone";
import { EpisodeSortableItem } from "@/app/reels/studio/components/EpisodeSortableItem";


interface EpisodesBulkUploadProps {
  seriesId: string;
  isPremium: boolean;
  coinPrice: number;
  onUploadComplete: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024;

export function EpisodesBulkUpload({ seriesId, isPremium, coinPrice, onUploadComplete }: EpisodesBulkUploadProps) {
  const [episodesMeta, setEpisodesMeta] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentPercent: 0 });
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleFilesDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let newFiles: File[] = [];
    if ('dataTransfer' in e) {
      newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    } else if (e.target && 'files' in e.target && e.target.files) {
      newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
    }
    newFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const newMeta = newFiles.map(f => ({
      caption: f.name.replace(/\.[^/.]+$/, ""),
      isPremium,
      unlockPrice: coinPrice,
      file: f
    }));
    setEpisodesMeta([...episodesMeta, ...newMeta]);
  };

  const uploadVideo = async (file: File) => {
    const partsCount = Math.ceil(file.size / CHUNK_SIZE);
    const initRes = await fetch("/api/upload/multipart/init", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType: file.type, parts: partsCount }),
    });
    const initData = await initRes.json();
    if (!initData.uploadId) throw new Error("Failed to init upload");

    const { uploadId, key, urls } = initData;
    const uploadedParts = [];
    for (let i = 0; i < partsCount; i++) {
      const start = i * CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
      const uploadRes = await fetch(urls[i], { method: "PUT", body: chunk });
      const etag = uploadRes.headers.get("ETag");
      if (!etag) throw new Error("No ETag received");
      uploadedParts.push({ PartNumber: i + 1, ETag: etag.replace(/"/g, "") });
      setUploadProgress(prev => ({ ...prev, currentPercent: Math.round(((i + 1) / partsCount) * 100) }));
    }

    const completeRes = await fetch("/api/upload/multipart/complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, key, parts: uploadedParts }),
    });
    const completeData = await completeRes.json();
    if (!completeData.success) throw new Error("Failed to complete upload");
    return completeData.videoId;
  };

  const handleBulkSubmit = async () => {
    if (episodesMeta.length === 0) return;
    setUploading(true);
    try {
      const uploadedEpisodes = [];
      setUploadProgress({ current: 0, total: episodesMeta.length, currentPercent: 0 });
      
      for (let i = 0; i < episodesMeta.length; i++) {
        const meta = episodesMeta[i];
        setUploadProgress(prev => ({ ...prev, current: i + 1, currentPercent: 0 }));
        const videoId = await uploadVideo(meta.file);
        uploadedEpisodes.push({ videoId, caption: meta.caption, isPremium: meta.isPremium, unlockPrice: meta.unlockPrice });
      }

      const res = await fetch("/api/reels/bulk", {
         method: "POST", headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ seriesId, episodes: uploadedEpisodes })
      });
      const data = await res.json();
      if (data.success) {
         toast.success(`Successfully uploaded ${data.count} episodes!`);
         setEpisodesMeta([]);
         onUploadComplete();
      } else {
         toast.error("Failed to upload episodes");
      }
    } catch(e) {
      toast.error("Error uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-2xl p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <UploadCloud className="text-indigo-500" /> Upload More Episodes
      </h2>
      <UploadDropzone onFilesDrop={handleFilesDrop as any} />
      
      {episodesMeta.length > 0 && (
        <div className="mt-8 space-y-3">
          {episodesMeta.map((meta, i) => (
            <EpisodeSortableItem 
              key={i} index={i} meta={meta}
              draggedItemIndex={draggedItemIndex}
              onDragStart={(e) => { setDraggedItemIndex(i); e.dataTransfer.setData("text", i.toString()); }}
              onDragOver={(e) => { e.preventDefault(); if(draggedItemIndex !== null && draggedItemIndex !== i) { const items = [...episodesMeta]; items.splice(i, 0, items.splice(draggedItemIndex, 1)[0]); setDraggedItemIndex(i); setEpisodesMeta(items); } }}
              onDragEnd={() => setDraggedItemIndex(null)}
              onUpdateMeta={(idx, key, val) => { const updated = [...episodesMeta]; updated[idx][key] = val; setEpisodesMeta(updated); }}
              onRemove={(idx) => { const updated = [...episodesMeta]; updated.splice(idx, 1); setEpisodesMeta(updated); }}
            />
          ))}
          
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button 
              onClick={handleBulkSubmit}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Uploading {uploadProgress.current}/{uploadProgress.total} ({uploadProgress.currentPercent}%)</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Publish {episodesMeta.length} New Episodes</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
