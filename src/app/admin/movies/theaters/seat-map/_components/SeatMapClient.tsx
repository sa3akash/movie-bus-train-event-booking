/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import {
  buildGrid,
  COLOR_PALETTE,
  renumberGrid,
  renumberRow,
  rowLabel,
  ScreenInfo,
  SeatCell,
  SeatType,
  TYPE_ICONS,
  LayoutMode,
} from "./utils";
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScreen, getSeatTypes } from "./fetch";
import { toast } from "sonner";
import { ConfigPanel } from "./ConfigPanel";
import { ToolsPanel } from "./ToolsPanel";
import { LegendPanel } from "./LegendPanel";
import { CanvasStatsBar } from "./CanvasStatsBar";
import { SeatGrid } from "./SeatGrid";
import { EmptyGridState } from "./EmptyGridState";
import { LoadingState, NoScreenState } from "./SeatMapStatusStates";
import { TipsPanel } from "./TipsPanel";

interface SeatMapClientProps {
  screenId: string;
}

const SeatMapClient = ({ screenId }: SeatMapClientProps) => {
  const router = useRouter();

  const [screen, setScreen] = useState<ScreenInfo | null>(null);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [grid, setGrid] = useState<SeatCell[][]>([]);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(15);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("standard");
  const [isGenerated, setIsGenerated] = useState(false);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showConfig, setShowConfig] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const [colorMap, setColorMap] = useState<
    Record<
      string,
      (typeof COLOR_PALETTE)[0] & {
        label: string;
        icon: React.ComponentType<any>;
      }
    >
  >({});

  useEffect(() => {
    console.log("running");
    async function fetch() {
      const [seatTypesdata, screendata] = await Promise.all([
        getSeatTypes(),
        getScreen(screenId),
      ]);
      setSeatTypes(seatTypesdata);
      setScreen(screendata);
      setLoadingScreen(false);

      // Build dynamic color map
      const cm: typeof colorMap = {};
      (seatTypesdata as SeatType[]).forEach((t, i) => {
        cm[t.id] = {
          ...COLOR_PALETTE[i % COLOR_PALETTE.length],
          label: t.name,
          icon: TYPE_ICONS[i % TYPE_ICONS.length],
        };
      });
      setColorMap(cm);

      // Restore existing layout if present
      if (screendata.seatLayout && screendata.seatLayout.seats?.length > 0) {
        const layout = screendata.seatLayout;
        const r = layout.rows;
        const c = layout.columns;
        setRows(r);
        setCols(c);
        const baseGrid = buildGrid(r, c, seatTypes[0]?.id ?? null);
        const occupiedKeys = new Set(
          layout.seats.map((s: any) => `${s.row}:${s.seatNumber}`),
        );
        const restored = baseGrid.map((rowArr, ri) =>
          rowArr.map((cell, ci) => {
            const key = `${rowLabel(ri)}:${ci + 1}`;
            if (!occupiedKeys.has(key))
              return { ...cell, seatTypeId: null, label: "" };
            return cell;
          }),
        );
        setGrid(renumberGrid(restored));
        setIsGenerated(true);
      } else if (screendata.totalSeats > 0) {
        const r = Math.min(
          Math.ceil(Math.sqrt(screendata.totalSeats * 1.5)),
          100,
        );
        const c = Math.min(Math.ceil(screendata.totalSeats / r), 100);
        setRows(r);
        setCols(c);
      }
    }
    fetch();
  }, [screenId]);

  // ── Generate grid ──────────────────────────────────────────────────────────
  const generateGrid = useCallback(() => {
    const defaultTypeId = seatTypes[0]?.id ?? null;
    setGrid(renumberGrid(buildGrid(rows, cols, defaultTypeId, layoutMode)));
    setIsGenerated(true);
    toast.success(
      `Generated ${rows} × ${cols} seat grid (${rows * cols} seats)`,
    );
  }, [rows, cols, seatTypes, layoutMode]);

  // ── Paint ──────────────────────────────────────────────────────────────────
  const paintCell = useCallback(
    (ri: number, ci: number) => {
      if (!activeTool) return;
      setGrid((prev) => {
        const next = [...prev];
        const row = [...next[ri]];
        
        const applyToCell = (cIdx: number) => {
          if (activeTool === "__aisle__") {
            row[cIdx] = { ...row[cIdx], seatTypeId: null, label: "" };
          } else {
            row[cIdx] = { ...row[cIdx], seatTypeId: activeTool };
          }
        };

        applyToCell(ci);
        if (mirrorMode) {
          const mirroredCi = cols - 1 - ci;
          if (mirroredCi !== ci) applyToCell(mirroredCi);
        }

        next[ri] = renumberRow(row);
        return next;
      });
    },
    [activeTool, mirrorMode, cols],
  );

  const applyZoneRange = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      if (!activeTool) return;
      const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
      const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
      
      setGrid((prev) => {
        const next = [...prev];
        for (let ri = minR; ri <= maxR; ri++) {
          const row = [...next[ri]];
          
          const applyToCell = (cIdx: number) => {
            if (activeTool === "__aisle__") {
              row[cIdx] = { ...row[cIdx], seatTypeId: null, label: "" };
            } else {
              row[cIdx] = { ...row[cIdx], seatTypeId: activeTool };
            }
          };

          for (let ci = minC; ci <= maxC; ci++) {
            applyToCell(ci);
            if (mirrorMode) {
              const mirroredCi = cols - 1 - ci;
              if (mirroredCi !== ci) applyToCell(mirroredCi);
            }
          }
          next[ri] = renumberRow(row);
        }
        return next;
      });
    },
    [activeTool, mirrorMode, cols],
  );

  const toggleAccessible = useCallback(
    (ri: number, ci: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setGrid((prev) => {
        const next = [...prev];
        const row = [...next[ri]];
        
        const applyToCell = (cIdx: number) => {
          if (row[cIdx].seatTypeId !== null) {
            row[cIdx] = { ...row[cIdx], isAccessible: !row[cIdx].isAccessible };
          }
        };

        applyToCell(ci);
        if (mirrorMode) {
          const mirroredCi = cols - 1 - ci;
          if (mirroredCi !== ci) applyToCell(mirroredCi);
        }
        
        next[ri] = row;
        return next;
      });
    },
    [mirrorMode, cols],
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let aisles = 0,
      accessible = 0;
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.seatTypeId === null) {
          aisles++;
          return;
        }
        counts[cell.seatTypeId] = (counts[cell.seatTypeId] || 0) + 1;
        if (cell.isAccessible) accessible++;
      }),
    );
    return {
      counts,
      aisles,
      accessible,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  }, [grid]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveLayout = async () => {
    if (!screen) return;
    setIsSaving(true);
    try {
      const seats: { row: string; seatNumber: number; x: number; y: number }[] =
        [];
      grid.forEach((rowArr, ri) => {
        rowArr.forEach((cell, ci) => {
          if (cell.seatTypeId !== null) {
            seats.push({ row: cell.row, seatNumber: ci + 1, x: ci, y: ri });
          }
        });
      });

      await navigator.clipboard.writeText(
        JSON.stringify({ rows, columns: cols, seats }),
      );
      toast.success("Seat map copied to clipboard");

      toast.success(`Seat map saved — ${stats.total} seats configured.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cell style ─────────────────────────────────────────────────────────────
  const getCellStyle = useCallback(
    (cell: SeatCell) => {
      if (cell.seatTypeId === null) {
        return "bg-transparent border-transparent opacity-30 hover:opacity-60 hover:bg-slate-800/30";
      }
      const style = colorMap[cell.seatTypeId];
      if (!style) return "bg-slate-700 border-slate-500 text-slate-200";
      const ring = cell.isAccessible
        ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950"
        : "";
      return `${style.bg} ${style.border} ${style.text} ${ring}`;
    },
    [colorMap],
  );

  if (loadingScreen) {
    return <LoadingState />;
  }

  if (!screenId || !screen) {
    return <NoScreenState router={router} />;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-6rem)] min-h-[600px] min-w-0 border rounded-xl overflow-hidden shadow-2xl bg-slate-950/30">
      {/* ── Left Panel ───────────────────────────────────────────────── */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-0 border-b lg:border-b-0 lg:border-r overflow-y-auto bg-slate-900/40">
        <Button
          onClick={saveLayout}
          disabled={isSaving}
          className="rounded-none h-12 shrink-0 font-bold tracking-wider"
        >
          Save Layout
        </Button>

        <ConfigPanel
          showConfig={showConfig}
          setShowConfig={setShowConfig}
          rows={rows}
          setRows={setRows}
          cols={cols}
          setCols={setCols}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          screen={screen}
          isGenerated={isGenerated}
          generateGrid={generateGrid}
        />

        <ToolsPanel
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          seatTypes={seatTypes}
          colorMap={colorMap}
          mirrorMode={mirrorMode}
          setMirrorMode={setMirrorMode}
        />

        <LegendPanel
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          isGenerated={isGenerated}
          seatTypes={seatTypes}
          colorMap={colorMap}
          stats={stats}
        />

        <TipsPanel />
      </div>

      {/* ── Main Canvas ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto min-w-0 min-h-0 relative">
        {!isGenerated ? (
          <EmptyGridState rows={rows} cols={cols} generateGrid={generateGrid} />
        ) : (
          <div className="flex flex-col items-center py-8 px-4 gap-6 min-w-max relative">
            {/* Zoom Controls */}
            <div className="sticky top-0 right-4 ml-auto flex items-center bg-slate-800/80 backdrop-blur-md rounded-md border border-slate-700/50 p-1 shadow-xl z-10 mb-[-2rem]">
              <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.25))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Screen bar */}
            <div className="flex flex-col items-center gap-2 w-full max-w-full">
              <div className="w-full max-w-[min(80%,600px)] h-2 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full opacity-80 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-semibold">
                SCREEN
              </p>
            </div>

            <SeatGrid
              grid={grid}
              cols={cols}
              zoomLevel={zoomLevel}
              activeTool={activeTool}
              paintCell={paintCell}
              applyZoneRange={applyZoneRange}
              toggleAccessible={toggleAccessible}
              getCellStyle={getCellStyle}
            />

            <CanvasStatsBar
              rows={rows}
              cols={cols}
              stats={stats}
              seatTypes={seatTypes}
              colorMap={colorMap}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapClient;
