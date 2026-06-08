"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SeriesHeader } from "./components/SeriesHeader";
import { SeriesMetadataForm } from "./components/SeriesMetadataForm";
import { EpisodesManager } from "./components/EpisodesManager";
import { EpisodesBulkUpload } from "./components/EpisodesBulkUpload";

export default function EditSeriesPage() {
  const params = useParams();
  const seriesId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"metadata" | "episodes">("metadata");
  const [initialLoading, setInitialLoading] = useState(true);
  const [seriesData, setSeriesData] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    fetchSeriesAndEpisodes();
  }, [seriesId]);

  const fetchSeriesAndEpisodes = async () => {
    try {
      // Fetch Series Meta
      const res = await fetch(`/api/reels/series/${seriesId}`);
      const data = await res.json();
      if (data.success) {
        setSeriesData(data.series);
      } else {
        toast.error("Failed to load series metadata");
      }

      // Fetch Episodes
      const epRes = await fetch(`/api/reels/series/${seriesId}/episodes`);
      const epData = await epRes.json();
      if (epData.success) {
        setEpisodes(epData.episodes);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading series data");
    } finally {
      setInitialLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <SeriesHeader title={seriesData?.title || ""} />

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10">
          <button 
            onClick={() => setActiveTab("metadata")}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "metadata" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Series Metadata
          </button>
          <button 
            onClick={() => setActiveTab("episodes")}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "episodes" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Episode Management
          </button>
        </div>

        {/* Tab Content: Metadata */}
        {activeTab === "metadata" && (
          <SeriesMetadataForm 
            seriesId={seriesId} 
            initialData={seriesData} 
            onSuccess={fetchSeriesAndEpisodes} 
          />
        )}

        {/* Tab Content: Episodes */}
        {activeTab === "episodes" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <EpisodesManager 
              seriesId={seriesId} 
              initialEpisodes={episodes} 
              onRefresh={fetchSeriesAndEpisodes} 
            />
            
            <EpisodesBulkUpload 
              seriesId={seriesId} 
              isPremium={seriesData?.isPremium || false} 
              coinPrice={seriesData?.defaultPricePerEpisode || 10} 
              onUploadComplete={fetchSeriesAndEpisodes} 
            />
          </div>
        )}

      </div>
    </div>
  );
}
