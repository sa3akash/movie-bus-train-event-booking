import React, { Suspense } from "react";
import SeatMapClient from "./_components/SeatMapClient";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const SeatMap = async ({
  searchParams,
}: {
  searchParams: Promise<{ screenId?: string }>;
}) => {
  const { screenId = "" } = await searchParams;

  if (!screenId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Screen ID Found</h1>
          <p className="text-gray-600 mb-6">
            Please provide a valid screen ID in the URL.
          </p>
          <Link
            href="/admin/movies/theaters/halls"
            className={buttonVariants({ variant: "outline" })}
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SeatMapClient screenId={screenId} />
    </Suspense>
  );
};

export default SeatMap;
