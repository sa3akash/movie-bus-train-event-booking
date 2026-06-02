import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw, Settings2 } from "lucide-react";
import { ScreenInfo, LayoutMode } from "./utils";

interface ConfigPanelProps {
  showConfig: boolean;
  setShowConfig: (show: boolean) => void;
  rows: number;
  setRows: (rows: number) => void;
  cols: number;
  setCols: (cols: number) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  screen: ScreenInfo;
  isGenerated: boolean;
  generateGrid: () => void;
}

export function ConfigPanel({
  showConfig,
  setShowConfig,
  rows,
  setRows,
  cols,
  setCols,
  layoutMode,
  setLayoutMode,
  screen,
  isGenerated,
  generateGrid,
}: ConfigPanelProps) {
  return (
    <div className="border-b">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest transition-colors"
        onClick={() => setShowConfig(!showConfig)}
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5 text-indigo-400" /> Grid Config
        </span>
        {showConfig ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {showConfig && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
                Rows
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={rows}
                onChange={(e) =>
                  setRows(
                    Math.min(
                      100,
                      Math.max(1, parseInt(e.target.value) || 1),
                    ),
                  )
                }
                className="h-8 text-xs text-white focus:border-indigo-500"
              />
              <p className="text-[10px]">Max 100</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
                Columns
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={cols}
                onChange={(e) =>
                  setCols(
                    Math.min(
                      100,
                      Math.max(1, parseInt(e.target.value) || 1),
                    ),
                  )
                }
                className="h-8 text-xs focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-600">Max 100</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
              Layout Template
            </Label>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
              className="w-full h-8 px-2 text-xs text-white bg-slate-950 border border-slate-800 rounded-md focus:border-indigo-500 focus:outline-none"
            >
              <option value="standard">Standard Block</option>
              <option value="center_aisle">Center Aisle</option>
              <option value="double_aisle">Double Aisles</option>
            </select>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Estimated seats</span>
              <span className="text-white font-semibold">
                {rows * cols}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Screen capacity</span>
              <span className="text-indigo-400 font-semibold">
                {screen.totalSeats}
              </span>
            </div>
          </div>
          <Button
            onClick={generateGrid}
            className="w-full h-8 text-xs bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isGenerated ? "Regenerate Grid" : "Generate Grid"}
          </Button>
          {isGenerated && (
            <p className="text-[10px] text-amber-500/80 text-center">
              ⚠ Regenerating will reset your layout
            </p>
          )}
        </div>
      )}
    </div>
  );
}
