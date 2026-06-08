import ReelFeed from "@/app/reels/components/ReelFeed";
import React from "react";


interface PageProps {
  params: Promise<{ id: string; episodeId: string }>;
}

export default async function SeriesEpisodePage({ params }: PageProps) {
  const { id, episodeId } = await params;
  
  return (
    <div className="bg-black w-full min-h-screen">
      <ReelFeed initialReelId={episodeId} seriesId={id} />
    </div>
  );
}
