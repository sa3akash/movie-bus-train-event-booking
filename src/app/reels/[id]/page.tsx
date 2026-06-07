import React from "react";
import { notFound } from "next/navigation";
import ReelFeed from "../components/ReelFeed";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seriesId?: string }>;
}

export default async function SingleReelPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { seriesId } = await searchParams;
  
  return (
    <div className="bg-black w-full min-h-screen">
      <ReelFeed initialReelId={id} seriesId={seriesId} />
    </div>
  );
}