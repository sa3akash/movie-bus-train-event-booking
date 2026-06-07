"use client";

import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Music, Tag, Bookmark, MoreVertical, Trash } from "lucide-react";
import { CommentsDrawer } from "./CommentsDrawer";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Auto-play prevented", e));
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  if (isDeleted) {
    return <div className="w-full h-full snap-start bg-gray-900 flex items-center justify-center text-white">Reel deleted.</div>;
  }

  const handleVideoClick = () => {
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
    } catch (error) {
      setSaved(saved);
      setSavesCount(saved ? savesCount : Math.max(savesCount - 1, 0));
    }
  };

  const handleFollow = async () => {
    if (!reel.user?.id) return;
    setFollowing(!following);
    try {
      await fetch(`/api/reels/users/${reel.user.id}/follow`, { method: "POST" });
    } catch (error) {
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
    <div className="relative w-full h-full flex justify-center items-center bg-black overflow-hidden group/player">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        onClick={handleVideoClick}
      />

      {/* Play/Pause Overlay Indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
          </div>
        </div>
      )}

      {/* Top Menu (Three Dots) */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition">
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
        <button className="flex flex-col items-center gap-1 group" onClick={handleLike}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{likesCount}</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 group" 
          onClick={() => reel.allowComments && setCommentsOpen(true)}
        >
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <MessageCircle className={`w-7 h-7 ${reel.allowComments ? "text-white" : "text-white/30"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{reel.allowComments ? commentsCount : 'Off'}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={handleSave}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Bookmark className={`w-7 h-7 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{savesCount}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={handleShare}>
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover:bg-black/40 transition">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{sharesCount}</span>
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-gray-500 border border-white/50 flex-shrink-0 overflow-hidden cursor-pointer">
            {reel.user?.avatarId ? (
              <img src={`/api/images/${reel.user.avatarId}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
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
        
        {reel.caption && (
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

      <CommentsDrawer reelId={reel.id} isOpen={commentsOpen} onOpenChange={setCommentsOpen} />
    </div>
  );
};

export default ReelPlayer;
