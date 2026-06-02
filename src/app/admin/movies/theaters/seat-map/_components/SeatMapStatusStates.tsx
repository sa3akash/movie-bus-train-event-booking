import React from "react";
import { ArrowLeft, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">
          Loading seat map…
        </p>
      </div>
    </div>
  );
}

export function NoScreenState({ router }: { router: AppRouterInstance }) {
  return (
    <div className="flex items-center justify-center min-h-screen text-slate-400 flex-col gap-4">
      <Monitor className="h-12 w-12 opacity-40" />
      <p>No screen selected. Please navigate from the Halls page.</p>
      <Button
        variant="outline"
        onClick={() => router.push("/admin/movies/theaters/halls")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Halls
      </Button>
    </div>
  );
}
