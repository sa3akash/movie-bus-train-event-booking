import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SeriesHeaderProps {
  title: string;
}

export function SeriesHeader({ title }: SeriesHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/reels/studio" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight line-clamp-1">{title || "Loading..."}</h1>
          <p className="text-white/50 text-sm mt-1">Manage metadata and episodes for this series.</p>
        </div>
      </div>
    </div>
  );
}
