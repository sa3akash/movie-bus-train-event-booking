"use client";

import React, { useState, useEffect } from "react";
import { Film, PlusCircle, CheckCircle2, ListVideo, Loader2 } from "lucide-react";
import { SeriesForm } from "./components/SeriesForm";
import { SeriesList } from "./components/SeriesList";
import { UploadDropzone } from "./components/UploadDropzone";
import { EpisodeSortableItem } from "./components/EpisodeSortableItem";

export default function SeriesStudio() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Bulk Upload State
  const [episodesMeta, setEpisodesMeta] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentPercent: 0 });
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/reels/series");
      const data = await res.json();
      if (data.success) {
        setSeriesList(data.series);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilesDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let newFiles: File[] = [];
    if ('dataTransfer' in e) {
      newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    } else if (e.target && 'files' in e.target && e.target.files) {
      newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
    }

    // Sort by name naturally to automatically attempt episode ordering ("10.mp4" after "9.mp4")
    newFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const newMeta = newFiles.map(f => ({
      caption: f.name.replace(/\.[^/.]+$/, ""), // filename without extension
      isPremium: false,
      unlockPrice: 0,
      file: f
    }));
    setEpisodesMeta([...episodesMeta, ...newMeta]);
  };

  const updateEpisodeMeta = (index: number, key: string, value: any) => {
    const updated = [...episodesMeta];
    updated[index][key] = value;
    setEpisodesMeta(updated);
  };

  const removeEpisode = (index: number) => {
    const updated = [...episodesMeta];
    updated.splice(index, 1);
    setEpisodesMeta(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOverList = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newItems = [...episodesMeta];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    setEpisodesMeta(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const uploadVideo = async (file: File) => {
    const partsCount = Math.ceil(file.size / CHUNK_SIZE);
    
    const initRes = await fetch("/api/upload/multipart/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        parts: partsCount,
      }),
    });
    const initData = await initRes.json();
    if (!initData.uploadId) throw new Error("Failed to init upload");

    const { uploadId, key, urls } = initData;
    const uploadedParts = [];

    for (let i = 0; i < partsCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const uploadRes = await fetch(urls[i], {
        method: "PUT",
        body: chunk,
      });

      const etag = uploadRes.headers.get("ETag");
      if (!etag) throw new Error("No ETag received from S3");

      uploadedParts.push({
        PartNumber: i + 1,
        ETag: etag.replace(/"/g, ""),
      });

      setUploadProgress(prev => ({ ...prev, currentPercent: Math.round(((i + 1) / partsCount) * 100) }));
    }

    const completeRes = await fetch("/api/upload/multipart/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        key,
        parts: uploadedParts,
      }),
    });
    const completeData = await completeRes.json();
    
    if (!completeData.success || !completeData.videoId) {
      throw new Error("Failed to complete upload");
    }

    return completeData.videoId;
  };

  const handleBulkSubmit = async () => {
    if (!selectedSeriesId || episodesMeta.length === 0) return;
    setUploading(true);
    
    try {
      const uploadedEpisodes = [];
      setUploadProgress({ current: 0, total: episodesMeta.length, currentPercent: 0 });
      
      for (let i = 0; i < episodesMeta.length; i++) {
        const meta = episodesMeta[i];
        setUploadProgress(prev => ({ ...prev, current: i + 1, currentPercent: 0 }));
        
        // Upload video first
        const videoId = await uploadVideo(meta.file);
        
        uploadedEpisodes.push({
           videoId,
           caption: meta.caption,
           isPremium: meta.isPremium,
           unlockPrice: meta.unlockPrice
        });
      }

      // Submit to bulk API
      const res = await fetch("/api/reels/bulk", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            seriesId: selectedSeriesId,
            episodes: uploadedEpisodes
         })
      });
      const data = await res.json();
      if (data.success) {
         alert(`Successfully uploaded ${data.count} episodes!`);
         setEpisodesMeta([]);
      } else {
         alert("Failed to upload episodes");
      }
    } catch(e) {
      console.error(e);
      alert("Error uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Film className="w-8 h-8 text-indigo-600" />
              Series Studio
            </h1>
            <p className="text-neutral-500 mt-2">Manage your Mini-Dramas and upload episodes in bulk.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Series Management */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">Your Series</h2>
                 <button onClick={() => setIsCreating(!isCreating)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors">
                   <PlusCircle className="w-5 h-5" />
                 </button>
              </div>

              {isCreating && (
                <SeriesForm 
                  onSuccess={(newSeries) => {
                    setSeriesList([newSeries, ...seriesList]);
                    setSelectedSeriesId(newSeries.id);
                    setIsCreating(false);
                  }}
                  onCancel={() => setIsCreating(false)}
                />
              )}

              <SeriesList 
                seriesList={seriesList} 
                selectedSeriesId={selectedSeriesId} 
                onSelectSeries={setSelectedSeriesId} 
                isCreating={isCreating} 
              />
            </div>
          </div>

          {/* Right Column: Bulk Upload Studio */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-card rounded-2xl shadow-sm border border-card p-8 min-h-[600px] flex flex-col">
                {selectedSeriesId ? (
                   <>
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                           <ListVideo className="w-6 h-6 text-indigo-600" />
                           Episodes Upload Pipeline
                        </h2>
                        <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300">
                           {episodesMeta.length} Episodes queued
                        </span>
                     </div>

                     <UploadDropzone onFilesDrop={handleFilesDrop} />

                     {episodesMeta.length > 0 && (
                       <div className="mt-8 flex-1">
                         <div className="space-y-3">
                           {episodesMeta.map((meta, i) => (
                             <EpisodeSortableItem 
                               key={i}
                               index={i}
                               meta={meta}
                               draggedItemIndex={draggedItemIndex}
                               onDragStart={handleDragStart}
                               onDragOver={handleDragOverList}
                               onDragEnd={handleDragEnd}
                               onUpdateMeta={updateEpisodeMeta}
                               onRemove={removeEpisode}
                             />
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Footer Actions */}
                     <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                       <button 
                         onClick={handleBulkSubmit}
                         disabled={uploading || episodesMeta.length === 0}
                         className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm transition-all"
                       >
                         {uploading ? (
                           <div className="flex items-center gap-2">
                             <Loader2 className="w-5 h-5 animate-spin" />
                             Uploading {uploadProgress.current}/{uploadProgress.total} ({uploadProgress.currentPercent}%)
                           </div>
                         ) : (
                           <>
                             <CheckCircle2 className="w-5 h-5" />
                             Publish {episodesMeta.length} Episodes
                           </>
                         )}
                       </button>
                     </div>
                   </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400">
                     <Film className="w-16 h-16 mb-4 opacity-20" />
                     <h3 className="text-xl font-medium text-neutral-600 dark:text-neutral-300">No Series Selected</h3>
                     <p className="mt-2 text-neutral-400 max-w-sm">Select a series from the left panel or create a new one to start uploading episodes.</p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
