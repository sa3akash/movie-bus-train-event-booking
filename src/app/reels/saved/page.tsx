import React from "react";
import ReelFeed from "../components/ReelFeed";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";

export default function SavedReelsPage() {
  return (
    <div className="w-full h-[calc(100vh-80px)] bg-black relative flex flex-col">
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <Link href="/reels" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h1 className="text-white font-bold text-lg">Saved Reels</h1>
        </div>
      </div>
      
      <div className="flex-1">
        <ReelFeed apiEndpoint={`/api/reels/saved`} />
      </div>
    </div>
  );
}
