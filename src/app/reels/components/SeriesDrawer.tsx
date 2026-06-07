"use client";

import React, { useEffect, useState } from "react";
import { X, PlayCircle, Lock } from "lucide-react";
import Link from "next/link";

interface SeriesDrawerProps {
  seriesId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentReelId?: string;
}

export const SeriesDrawer: React.FC<SeriesDrawerProps> = ({ seriesId, isOpen, onOpenChange, currentReelId }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && seriesId) {
      fetchSeriesData();
    }
  }, [isOpen, seriesId]);

  const fetchSeriesData = async () => {
    setLoading(true);
    try {
      const [epRes, seriesRes] = await Promise.all([
        fetch(`/api/reels/series/${seriesId}/episodes`),
        fetch(`/api/reels/series/${seriesId}`)
      ]);
      const epData = await epRes.json();
      const seriesData = await seriesRes.json();
      
      if (epData.success) setEpisodes(epData.episodes);
      if (seriesData.success) setSeries(seriesData.series);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[400px] bg-[#1a1a1a] rounded-t-2xl z-50 transition-transform duration-300 shadow-2xl border-t border-white/10 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '70vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                 🎬 {series?.title || "Loading..."}
              </h3>
              <p className="text-xs text-white/50 mt-1">{episodes.length} Episodes • {series?.status || "ONGOING"}</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
            ) : (
              episodes.map((ep, i) => {
                const isCurrent = ep.id === currentReelId;
                return (
                  <Link 
                     key={ep.id}
                     href={`/reels/${ep.id}?seriesId=${seriesId}`}
                     onClick={() => onOpenChange(false)}
                     className={`flex gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 group ${isCurrent ? 'bg-indigo-900/30 border-indigo-500/50' : 'border-white/5 bg-white/5'}`}
                  >
                    <div className="w-20 h-28 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                       {ep.isPremium ? (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                             <Lock className="w-5 h-5 text-yellow-400" />
                          </div>
                       ) : (
                          <PlayCircle className={`w-8 h-8 ${isCurrent ? 'text-indigo-400' : 'text-white/50 group-hover:text-white/80'} transition-colors`} />
                       )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                         <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-300' : 'text-white'}`}>
                           Episode {ep.episodeNumber || i + 1}
                         </span>
                         {isCurrent && <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">Playing</span>}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2">{ep.episodeTitle || ep.caption || "No description"}</p>
                      
                      {ep.isPremium && (
                         <div className="mt-2 inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-semibold w-fit">
                            <Lock className="w-3 h-3" /> {ep.unlockPrice || series?.defaultPricePerEpisode || 10} Coins
                         </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
