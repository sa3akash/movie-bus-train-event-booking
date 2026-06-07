"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, Play, Heart, Eye, Film, Layers } from "lucide-react";

export default function ReelsGridPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'reels' | 'series'>('reels');
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastReelElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchReels(cursor);
      }
    }, { rootMargin: '200px' });
    
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasMore, cursor]);

  const fetchReels = async (currentCursor: string | null) => {
    try {
      if (currentCursor) setFetchingMore(true);
      else setLoading(true);

      const url = new URL(window.location.origin + "/api/reels");
      url.searchParams.append("limit", "18");
      if (currentCursor && currentCursor !== "has_more") {
         url.searchParams.append("cursor", currentCursor);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success && data.reels) {
        if (data.reels.length === 0) {
          setHasMore(false);
        } else {
          setReels(prev => currentCursor ? [...prev, ...data.reels] : data.reels);
          if (data.nextCursor) {
            setCursor(data.nextCursor);
          } else {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch reels", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchReels(null);
  }, []);

  useEffect(() => {
    if (activeTab === 'series' && seriesList.length === 0) {
      setLoadingSeries(true);
      fetch("/api/reels/series")
        .then(res => res.json())
        .then(data => {
          if (data.success) setSeriesList(data.series);
        })
        .finally(() => setLoadingSeries(false));
    }
  }, [activeTab]);

  if (loading && reels.length === 0) {
    return (
      <div className="w-full min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Discover Reels</h1>
            <p className="text-neutral-400 mt-1">Explore the latest short videos and mini-dramas.</p>
          </div>
          
          <div className="flex bg-neutral-900 rounded-lg p-1 w-fit border border-white/10">
            <button 
              onClick={() => setActiveTab('reels')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'reels' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              <Film className="w-4 h-4" /> For You
            </button>
            <button 
              onClick={() => setActiveTab('series')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'series' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              <Layers className="w-4 h-4" /> Mini-Dramas
            </button>
          </div>
        </div>

        {activeTab === 'series' && (
          loadingSeries ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : seriesList.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">No series found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seriesList.map(series => (
                <Link 
                  key={series.id} 
                  href={`/reels/series/${series.id}`}
                  className="group bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="aspect-video bg-neutral-800 relative">
                     {/* Placeholder cover image if we don't have an actual image rendered */}
                     <div className="absolute inset-0 bg-linear-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                        <Layers className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
                     </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{series.title}</h3>
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{series.description || "No description provided."}</p>
                    <div className="mt-4 flex items-center gap-3">
                       <span className="text-xs font-semibold bg-white/10 text-white px-2 py-1 rounded">
                         {series.totalEpisodes || '?'} Episodes
                       </span>
                       {series.isPremium && (
                         <span className="text-xs font-semibold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                           Premium
                         </span>
                       )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'reels' && (reels.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">No reels found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {reels.map((reel, index) => {
              const isLast = index === reels.length - 1;
              return (
                <Link 
                  key={reel.id} 
                  href={`/reels/${reel.id}`}
                  ref={isLast ? lastReelElementRef : null}
                  className="group relative aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300"
                >
                  <video
                    src={reel.video?.originalUrl}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    muted
                    loop
                    playsInline
                    onMouseOver={e => e.currentTarget.play().catch(()=>{})}
                    onMouseOut={e => {
                       e.currentTarget.pause();
                       e.currentTarget.currentTime = 0;
                    }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                     <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Play className="w-5 h-5 text-white ml-1" />
                     </div>
                  </div>

                  {/* Badges / Stats */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                     {reel.series && (
                        <div className="bg-indigo-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                           🎬 {reel.series.title}
                        </div>
                     )}
                     {reel.isPremium && (
                        <div className="bg-yellow-500/90 backdrop-blur text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm w-fit">
                           PREMIUM
                        </div>
                     )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                     <div className="flex items-center gap-2 text-white/90 text-xs font-semibold drop-shadow-md">
                        <div className="flex items-center gap-1">
                           <Play className="w-3.5 h-3.5" />
                           {reel.viewsCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                           <Heart className="w-3.5 h-3.5" />
                           {reel.likesCount || 0}
                        </div>
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
          )
        )}

        {activeTab === 'reels' && fetchingMore && (
          <div className="w-full flex justify-center mt-12 mb-8">
            <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}