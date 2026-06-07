"use client";

import React, { useEffect, useState, useRef } from "react";
import ReelPlayer from "./ReelPlayer";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface ReelFeedProps {
  apiEndpoint?: string;
  initialReelId?: string;
}

const ReelFeed: React.FC<ReelFeedProps> = ({ apiEndpoint = "/api/reels?limit=10", initialReelId }) => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = async (currentCursor: string | null) => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const separator = apiEndpoint.includes("?") ? "&" : "?";
      const cursorParam = currentCursor ? `&cursor=${encodeURIComponent(currentCursor)}` : "";
      const initialReelParam = (initialReelId && !currentCursor) ? `&initialReelId=${encodeURIComponent(initialReelId)}` : "";
      const res = await fetch(`${apiEndpoint}${separator}limit=10${cursorParam}${initialReelParam}`);
      const data = await res.json();
      if (data.success && data.reels) {
        if (data.reels.length === 0) {
          setHasMore(false);
        } else {
          setReels(prev => !currentCursor ? data.reels : [...prev, ...data.reels]);
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
      setIsFetching(false);
    }
  };

  useEffect(() => {
    setReels([]);
    setHasMore(true);
    setLoading(true);
    setCursor(null);
    fetchReels(null);
  }, [apiEndpoint]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      // Calculate which reel is currently most visible
      const index = Math.round(scrollPosition / clientHeight);
      
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
        
        // Update URL to match current reel ID
        const currentReel = reels[index];
        if (currentReel) {
          window.history.replaceState(null, '', `/reels/${currentReel.id}`);
        }
        
        // Fetch more if we're near the end
        if (index >= reels.length - 3 && hasMore && !isFetching) {
          // If cursor is somehow missing but hasMore is true (e.g. Redis feed fallback) we just trigger fetch
          // But usually we pass cursor for Hashtag/Saved feeds
          fetchReels(cursor);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [activeIndex, reels.length]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <p>No reels available.</p>
      </div>
    );
  }

  const scrollUp = () => {
    if (containerRef.current && activeIndex > 0) {
      containerRef.current.scrollBy({ top: -containerRef.current.clientHeight, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (containerRef.current && activeIndex < reels.length - 1) {
      containerRef.current.scrollBy({ top: containerRef.current.clientHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef}
        className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black sm:bg-[#121212] flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        style={{ scrollBehavior: "smooth" }}
      >
        {reels.map((reel, index) => {
          // Virtualization: Only render the video player if it's within 2 indexes of the active reel.
          // This prevents the browser from crashing when there are hundreds of reels.
          const isNear = Math.abs(index - activeIndex) <= 2;
          
          return (
            <div key={reel.id} className="w-full h-full shrink-0 snap-start sm:snap-center sm:py-6 flex justify-center items-center relative">
              <div className="w-full h-full sm:h-full sm:max-w-[400px] sm:rounded-2xl sm:overflow-hidden relative bg-black sm:shadow-2xl sm:border sm:border-white/10">
                {isNear ? (
                  <ReelPlayer reel={reel} isActive={index === activeIndex} />
                ) : (
                  <div className="w-full h-full bg-gray-900" />
                )}
              </div>
            </div>
          );
        })}
        
        {isFetching && (
          <div className="w-full h-[200px] shrink-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden sm:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        <button 
          onClick={scrollUp}
          disabled={activeIndex === 0}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition disabled:opacity-30 disabled:hover:bg-white/10"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button 
          onClick={scrollDown}
          disabled={activeIndex === reels.length - 1 && !hasMore}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition disabled:opacity-30 disabled:hover:bg-white/10"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ReelFeed;
