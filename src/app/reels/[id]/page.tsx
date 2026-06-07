import React from "react";
import { notFound } from "next/navigation";
import ReelFeed from "../components/ReelFeed";

const SingleReelPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  
  return (
    <div className="bg-black w-full min-h-screen">
      <ReelFeed initialReelId={id} />
    </div>
  );
};

export default SingleReelPage;