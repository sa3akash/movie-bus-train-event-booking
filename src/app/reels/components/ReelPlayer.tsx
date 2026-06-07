"use client";

import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Music, Tag, Bookmark, MoreVertical, Trash, Lock, ListVideo } from "lucide-react";
import { CommentsDrawer } from "./CommentsDrawer";
import { SeriesDrawer } from "./SeriesDrawer";
import { VideoProgressBar } from "./VideoProgressBar";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReelPlayerProps {
  reel: any;
  isActive: boolean;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ reel, isActive }) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // States from DB counters
  const [liked, setLiked] = useState(false); 
  const [saved, setSaved] = useState(false); 
  const [following, setFollowing] = useState(false);
  
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(reel.sharesCount || 0);
  const [savesCount, setSavesCount] = useState(reel.savesCount || 0);
  
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [seriesDrawerOpen, setSeriesDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // Cinematic UI Auto-Hide
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showUI && !commentsOpen && !seriesDrawerOpen && !menuOpen) {
      timeout = setTimeout(() => {
        setShowUI(false);
      }, 3500);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showUI, commentsOpen, seriesDrawerOpen, menuOpen]);

  const handleUserInteraction = () => {
    setShowUI(true);
  };

  useEffect(() => {
    if (isActive && videoRef.current && !reel.isPremium) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Auto-play prevented", e));
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, reel.isPremium]);

  if (isDeleted) {
    return <div className="w-full h-full snap-start bg-gray-900 flex items-center justify-center text-white">Reel deleted.</div>;
  }

  const handleVideoClick = () => {
    if (!showUI) {
      setShowUI(true);
      return; // Don't pause if they just wanted to see the UI
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? Math.max(likesCount - 1, 0) : likesCount + 1);
    try {
      await fetch(`/api/reels/${reel.id}/like`, { method: "POST" });
    } catch (error) {
      setLiked(liked);
      setLikesCount(liked ? likesCount : Math.max(likesCount - 1, 0));
    }
  };

  const handleSave = async () => {
    setSaved(!saved);
    setSavesCount(saved ? Math.max(savesCount - 1, 0) : savesCount + 1);
    try {
      await fetch(`/api/reels/${reel.id}/save`, { method: "POST" });
    } catch {
      setSaved(saved);
      setSavesCount(saved ? savesCount : Math.max(savesCount - 1, 0));
    }
  };

  const handleFollow = async () => {
    if (!reel.user?.id) return;
    setFollowing(!following);
    try {
      await fetch(`/api/reels/users/${reel.user.id}/follow`, { method: "POST" });
    } catch {
      setFollowing(following);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this reel?")) {
      try {
        const res = await fetch(`/api/reels/${reel.id}`, { method: "DELETE" });
        if (res.ok) setIsDeleted(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reel by ${reel.user?.name}`,
          text: reel.caption,
          url: `${window.location.origin}/reels/${reel.id}`,
        });
        await fetch(`/api/reels/${reel.id}/share`, { method: "POST" });
        setSharesCount(sharesCount + 1);
      } catch (e) {
        console.log("Share canceled or failed", e);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/reels/${reel.id}`);
      alert("Link copied to clipboard!");
      await fetch(`/api/reels/${reel.id}/share`, { method: "POST" });
      setSharesCount(sharesCount + 1);
    }
  };

  const videoUrl = reel.video?.originalUrl;

  return (
    <div 
      className="relative w-full h-full flex justify-center items-center bg-black overflow-hidden group/player"
      onMouseMove={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Video Element or Paywall */}
      {reel.isPremium ? (
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex flex-col items-center justify-center text-center p-6 z-20 backdrop-blur-xl">
           <Lock className="w-16 h-16 text-yellow-400 mb-4" />
           <h3 className="text-2xl font-bold text-white mb-2">Premium Episode</h3>
           <p className="text-white/70 mb-6">Unlock this episode to continue watching.</p>
           <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
             <Lock className="w-4 h-4" /> Unlock for {reel.unlockPrice || reel.series?.defaultPricePerEpisode || 10} Coins
           </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          onClick={handleVideoClick}
        />
      )}

      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-500 ease-in-out pointer-events-none ${showUI ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Play/Pause Overlay Indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-0 h-0 border-t-8 border-b-8 border-l-14 border-t-transparent border-b-transparent border-l-white ml-1"></div>
          </div>
        </div>
      )}

      {/* Top Menu (Three Dots) */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition pointer-events-auto">
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-1">
            <button 
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <Trash className="w-4 h-4" /> Delete Reel
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <button className="flex flex-col items-center gap-1 group pointer-events-auto" onClick={handleLike}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{likesCount}</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 group pointer-events-auto" 
          onClick={() => reel.allowComments && setCommentsOpen(true)}
        >
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <MessageCircle className={`w-7 h-7 ${reel.allowComments ? "text-white" : "text-white/30"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{reel.allowComments ? commentsCount : 'Off'}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group pointer-events-auto" onClick={handleSave}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Bookmark className={`w-7 h-7 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{savesCount}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group pointer-events-auto" onClick={handleShare}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{sharesCount}</span>
        </button>

        {reel.seriesId && (
          <button className="flex flex-col items-center gap-1 group pointer-events-auto" onClick={() => setSeriesDrawerOpen(true)}>
            <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
              <ListVideo className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-[10px] font-semibold drop-shadow-md">Episodes</span>
          </button>
        )}
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-6 bg-linear-to-t from-black/80 via-black/50 to-transparent z-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-gray-500 border border-white/50 shrink-0 overflow-hidden cursor-pointer">
            {reel.user?.avatarId ? (
              <img src={`/api/images/${reel.user.avatarId}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold drop-shadow-md cursor-pointer hover:underline">{reel.user?.name || "Unknown User"}</span>
              <button 
                onClick={handleFollow}
                className={`px-3 py-0.5 text-xs font-semibold text-white border border-white rounded-md backdrop-blur-sm transition ${following ? "bg-white/30 text-white" : "bg-transparent hover:bg-white/20"}`}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
            {reel.isSponsored && (
              <span className="text-xs font-semibold text-gray-300 drop-shadow flex items-center gap-1">
                <Tag className="w-3 h-3" /> Sponsored
              </span>
            )}
          </div>
        </div>
        
        {reel.series && (
          <button onClick={() => setSeriesDrawerOpen(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg mb-2 transition-colors pointer-events-auto">
            <span className="text-xs font-bold text-white tracking-wide">🎬 {reel.series.title}</span>
            <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded">EP {reel.episodeNumber}</span>
          </button>
        )}
        
        {reel.series && (
          <h4 className="text-white font-bold text-base drop-shadow-md mb-1 pointer-events-auto">
            Episode {reel.episodeNumber} {reel.caption ? `· ${reel.caption}` : ''}
          </h4>
        )}
        
        {!reel.series && reel.caption && (
          <p className="text-white text-sm w-[85%] mb-2 drop-shadow-md font-medium leading-tight pointer-events-auto">
            {reel.caption.split(' ').map((word: string, i: number) => 
              word.startsWith('#') ? (
                <Link href={`/reels/hashtag/${word.replace('#', '')}`} key={i} className="font-bold text-indigo-300 hover:text-indigo-200 hover:underline">
                  {word}{' '}
                </Link>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </p>
        )}

        <div className="flex items-center gap-2 text-white/90 text-sm mt-1 pointer-events-auto cursor-pointer group/audio">
          <Music className="w-4 h-4 animate-pulse group-hover/audio:text-indigo-300 transition" />
          <div className="w-48 overflow-hidden relative h-5">
            <p className="absolute whitespace-nowrap animate-[marquee_5s_linear_infinite] group-hover/audio:underline">
              Original Audio - {reel.user?.name || "Unknown"}
            </p>
          </div>
        </div>
      </div>

        <VideoProgressBar 
          videoRef={videoRef} 
          onSeek={(time) => {
            if (videoRef.current) {
              videoRef.current.currentTime = time;
            }
          }}
        />
      </div>

      <CommentsDrawer reelId={reel.id} isOpen={commentsOpen} onOpenChange={setCommentsOpen} />
      
      {reel.seriesId && (
        <SeriesDrawer seriesId={reel.seriesId} isOpen={seriesDrawerOpen} onOpenChange={setSeriesDrawerOpen} currentReelId={reel.id} />
      )}
    </div>
  );
};

export default ReelPlayer;
