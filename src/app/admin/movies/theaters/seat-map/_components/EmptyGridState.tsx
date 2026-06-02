import React from "react";
import { Grid3X3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyGridStateProps {
  rows: number;
  cols: number;
  generateGrid: () => void;
}

export function EmptyGridState({
  rows,
  cols,
  generateGrid,
}: EmptyGridStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-slate-600">
      <div className="flex flex-col items-center gap-3">
        <div className="h-20 w-20 rounded-2xl border border-slate-800 flex items-center justify-center">
          <Grid3X3 className="h-10 w-10" />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          No seat layout generated yet
        </p>
        <p className="text-xs text-center max-w-xs">
          Configure rows and columns in the left panel, then click{" "}
          <strong className="text-slate-500">Generate Grid</strong> to start
          designing.
        </p>
      </div>
      <Button
        onClick={generateGrid}
        className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate {rows} × {cols} Grid
      </Button>
    </div>
  );
}
