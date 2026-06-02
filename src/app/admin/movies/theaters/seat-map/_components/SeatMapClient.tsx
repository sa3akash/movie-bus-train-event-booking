/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import {
  buildGrid,
  COLOR_PALETTE,
  renumberGrid,
  rowLabel,
  ScreenInfo,
  SeatCell,
  SeatType,
  TYPE_ICONS,
} from "./utils";
import React, { use, useCallback, useEffect, useState } from "react";
import {
  Armchair,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid3X3,
  Monitor,
  Paintbrush,
  RefreshCw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScreen, getSeatTypes } from "./fetch";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const [isGenerated, setIsGenerated] = useState(false);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [zoneStart, setZoneStart] = useState<{ r: number; c: number } | null>(
    null,
  );

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
          26,
        );
        const c = Math.min(Math.ceil(screendata.totalSeats / r), 40);
        setRows(r);
        setCols(c);
      }
    }
    fetch();
  }, [screenId]);

  // ── Generate grid ──────────────────────────────────────────────────────────
  const generateGrid = useCallback(() => {
    const defaultTypeId = seatTypes[0]?.id ?? null;
    setGrid(renumberGrid(buildGrid(rows, cols, defaultTypeId)));
    setIsGenerated(true);
    toast.success(
      `Generated ${rows} × ${cols} seat grid (${rows * cols} seats)`,
    );
  }, [rows, cols, seatTypes]);

  // ── Paint ──────────────────────────────────────────────────────────────────
  const paintCell = useCallback(
    (ri: number, ci: number) => {
      if (!activeTool) return;
      setGrid((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (activeTool === "__aisle__") {
          next[ri][ci] = { ...next[ri][ci], seatTypeId: null, label: "" };
        } else {
          next[ri][ci] = { ...next[ri][ci], seatTypeId: activeTool };
        }
        return renumberGrid(next);
      });
    },
    [activeTool],
  );

  const applyZoneRange = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      if (!activeTool) return;
      const minR = Math.min(r1, r2),
        maxR = Math.max(r1, r2);
      const minC = Math.min(c1, c2),
        maxC = Math.max(c1, c2);
      setGrid((prev) => {
        const next = prev.map((row) => row.map((c) => ({ ...c })));
        for (let ri = minR; ri <= maxR; ri++) {
          for (let ci = minC; ci <= maxC; ci++) {
            if (activeTool === "__aisle__") {
              next[ri][ci] = { ...next[ri][ci], seatTypeId: null, label: "" };
            } else {
              next[ri][ci] = { ...next[ri][ci], seatTypeId: activeTool };
            }
          }
        }
        return renumberGrid(next);
      });
    },
    [activeTool],
  );

  const toggleAccessible = useCallback(
    (ri: number, ci: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setGrid((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (next[ri][ci].seatTypeId !== null) {
          next[ri][ci].isAccessible = !next[ri][ci].isAccessible;
        }
        return next;
      });
    },
    [],
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

     await navigator.clipboard.writeText(JSON.stringify({ rows, columns: cols, seats }))
      toast.success("Seat map copied to clipboard");

    //   const res = await fetch(`/api/cinema/screens/${screenId}`, {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       seatLayout: { rows, columns: cols, seats },
    //       totalSeats: stats.total,
    //     }),
    //   });

    //   if (!res.ok) {
    //     const err = await res.json();
    //     throw new Error(err.message || "Failed to save layout");
    //   }

      toast.success(`Seat map saved — ${stats.total} seats configured.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cell style ─────────────────────────────────────────────────────────────
  const getCellStyle = (cell: SeatCell) => {
    if (cell.seatTypeId === null) {
      return "bg-transparent border-transparent opacity-30 hover:opacity-60 hover:bg-slate-800/30";
    }
    const style = colorMap[cell.seatTypeId];
    if (!style) return "bg-slate-700 border-slate-500 text-slate-200";
    const ring = cell.isAccessible
      ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950"
      : "";
    return `${style.bg} ${style.border} ${style.text} ${ring}`;
  };

  const CELL_SIZE = "w-7 h-7";
  const CELL_FONT = "text-[8px]";

  // ─────────────────────────────────────────────────────────────────────────
  // Loading / empty states
  // ─────────────────────────────────────────────────────────────────────────

  if (loadingScreen) {
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

  if (!screenId || !screen) {
    return (
      <div className="flex items-center justify-center min-h-screen  text-slate-400 flex-col gap-4">
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

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left Panel ───────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-0  border-r  overflow-y-auto">
        <Button onClick={saveLayout}>Save</Button>
        {/* Config Panel */}
        <div className="border-b ">
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
                    max={26}
                    value={rows}
                    onChange={(e) =>
                      setRows(
                        Math.min(
                          26,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="h-8 text-xs  text-white focus:border-indigo-500"
                  />
                  <p className="text-[10px] ">Max 26 (A–Z)</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Columns
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={cols}
                    onChange={(e) =>
                      setCols(
                        Math.min(
                          40,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="h-8 text-xs  focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-600">Max 40</p>
                </div>
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

        {/* Paint Tools */}
        <div className="border-b ">
          <div className="px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Paintbrush className="h-3.5 w-3.5 text-indigo-400" /> Paint Tools
          </div>
          <div className="px-4 pb-4 space-y-2">
            {/* Aisle tool */}
            <button
              onClick={() =>
                setActiveTool(activeTool === "__aisle__" ? null : "__aisle__")
              }
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                activeTool === "__aisle__"
                  ? "bg-slate-700 border-slate-400 text-white ring-1 ring-slate-400"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="h-5 w-5 rounded border-2 border-dashed border-slate-500 flex items-center justify-center shrink-0">
                <span className="text-[8px] text-slate-500">−</span>
              </div>
              <span>Aisle / Block</span>
              {activeTool === "__aisle__" && (
                <span className="ml-auto text-[10px] text-emerald-400">
                  ● Active
                </span>
              )}
            </button>

            {/* Seat type tools */}
            {seatTypes.length === 0 ? (
              <div className="text-[11px] text-slate-600 text-center py-3 space-y-1">
                <p>No seat types in database.</p>
                <p className="text-indigo-400">
                  You can still use the Aisle tool to design the grid layout.
                </p>
              </div>
            ) : (
              seatTypes.map((st) => {
                const style = colorMap[st.id];
                const Icon = style?.icon || Armchair;
                const isActive = activeTool === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveTool(isActive ? null : st.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      isActive
                        ? `${style?.bg || "bg-indigo-700"} ${style?.border || "border-indigo-400"} ${style?.text || "text-white"} ring-1 ${style?.border || "ring-indigo-400"}`
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${isActive ? "bg-white/20" : style?.bg || "bg-slate-700"}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{st.name}</span>
                      <span
                        className={`text-[9px] ${isActive ? "opacity-70" : "text-slate-600"}`}
                      >
                        ×{st.priceMultiplier} price
                      </span>
                    </div>
                    {isActive && (
                      <span className="ml-auto text-[10px] text-emerald-300">
                        ● Active
                      </span>
                    )}
                  </button>
                );
              })
            )}

            {activeTool && (
              <p className="text-[10px] text-slate-500 text-center pt-1">
                Click or drag seats to paint · Right-click to toggle
                accessibility
              </p>
            )}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="border-b ">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest transition-colors"
            onClick={() => setShowLegend(!showLegend)}
          >
            <span className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-indigo-400" /> Legend & Stats
            </span>
            {showLegend ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {showLegend && isGenerated && (
            <div className="px-4 pb-4 space-y-2">
              {seatTypes.map((st) => {
                const style = colorMap[st.id];
                const count = stats.counts[st.id] || 0;
                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-sm ${style?.bg || "bg-slate-700"} border ${style?.border || "border-slate-500"} shrink-0`}
                      />
                      <span className="text-[11px] text-slate-300">
                        {st.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {count}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-sm bg-transparent border border-dashed border-slate-600 shrink-0" />
                  <span className="text-[11px] text-slate-300">Aisle</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {stats.aisles}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-sm ring-2 ring-emerald-400 bg-slate-700 shrink-0" />
                  <span className="text-[11px] text-slate-300">Accessible</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {stats.accessible}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Total Seats</span>
                  <span className="text-white font-bold">{stats.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-4 py-4 space-y-2 mt-auto">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Tips
          </p>
          <ul className="space-y-1.5 text-[10px] text-slate-600">
            <li className="flex gap-1.5">
              <span className="text-indigo-500">→</span> Select a tool then
              click / drag to paint
            </li>
            <li className="flex gap-1.5">
              <span className="text-indigo-500">→</span> Right-click any seat to
              toggle ♿ access
            </li>
            <li className="flex gap-1.5">
              <span className="text-indigo-500">→</span> Aisles split seat
              numbering per row
            </li>
            <li className="flex gap-1.5">
              <span className="text-indigo-500">→</span> Seat types are loaded
              from the database
            </li>
          </ul>
        </div>
      </div>

      {/* ── Main Canvas ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto ">
        {!isGenerated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-slate-600">
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-2xl  border border-slate-800 flex items-center justify-center">
                <Grid3X3 className="h-10 w-10 " />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                No seat layout generated yet
              </p>
              <p className="text-xs  text-center max-w-xs">
                Configure rows and columns in the left panel, then click{" "}
                <strong className="text-slate-500">Generate Grid</strong> to
                start designing.
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
        ) : (
          <div className="flex flex-col items-center py-8 px-4 gap-6 min-w-max">
            {/* Screen bar */}
            <div className="flex flex-col items-center gap-2 w-full max-w-full">
              <div className="w-full max-w-[min(80%,600px)] h-2 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full opacity-80 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-semibold">
                SCREEN
              </p>
            </div>

            {/* Grid */}
            <div
              className="select-none"
              onMouseLeave={() => {
                setIsPainting(false);
                setZoneStart(null);
              }}
              onMouseUp={() => {
                setIsPainting(false);
                setZoneStart(null);
              }}
            >
              {grid.map((rowArr, ri) => (
                <div key={ri} className="flex items-center gap-1 mb-1">
                  <span className="text-[11px] text-slate-600 font-mono w-5 text-right shrink-0">
                    {rowLabel(ri)}
                  </span>
                  <div className="flex gap-1">
                    {rowArr.map((cell, ci) => {
                      const isEmpty = cell.seatTypeId === null;
                      return (
                        <button
                          key={ci}
                          title={
                            isEmpty
                              ? "Aisle"
                              : `${cell.row}${cell.label}${cell.isAccessible ? " ♿" : ""}`
                          }
                          className={`
                              ${CELL_SIZE} rounded-sm border transition-all duration-75 flex items-end justify-center pb-0.5
                              ${getCellStyle(cell)}
                              ${activeTool ? "cursor-crosshair" : "cursor-default"}
                              ${!isEmpty ? "hover:brightness-125 hover:scale-110" : ""}
                            `}
                          onMouseDown={(e) => {
                            if (e.button === 2) return;
                            setIsPainting(true);
                            setZoneStart({ r: ri, c: ci });
                            paintCell(ri, ci);
                          }}
                          onMouseEnter={() => {
                            if (isPainting && activeTool) paintCell(ri, ci);
                          }}
                          onMouseUp={(e) => {
                            if (e.button === 2) return;
                            if (
                              zoneStart &&
                              (zoneStart.r !== ri || zoneStart.c !== ci)
                            ) {
                              applyZoneRange(zoneStart.r, zoneStart.c, ri, ci);
                            }
                            setIsPainting(false);
                            setZoneStart(null);
                          }}
                          onContextMenu={(e) => toggleAccessible(ri, ci, e)}
                        >
                          {!isEmpty && (
                            <span
                              className={`${CELL_FONT} font-bold leading-none select-none`}
                            >
                              {cell.isAccessible ? "♿" : cell.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono w-5 shrink-0">
                    {rowLabel(ri)}
                  </span>
                </div>
              ))}

              {/* Column numbers */}
              <div className="flex items-center gap-1 mt-2 ml-6">
                {Array.from({ length: cols }, (_, ci) => (
                  <span
                    key={ci}
                    className={`${CELL_SIZE} text-center text-[8px] text-slate-700 font-mono`}
                  >
                    {ci + 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 px-6 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px]">
              <span className="text-slate-500">
                Grid:{" "}
                <strong className="text-white">
                  {rows}R × {cols}C
                </strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                Seats:{" "}
                <strong className="text-indigo-400">{stats.total}</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                Aisles:{" "}
                <strong className="text-slate-400">{stats.aisles}</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                Accessible:{" "}
                <strong className="text-emerald-400">{stats.accessible}</strong>
              </span>
              {seatTypes.map((st) => {
                const count = stats.counts[st.id] || 0;
                if (!count) return null;
                const style = colorMap[st.id];
                return (
                  <React.Fragment key={st.id}>
                    <span className="text-slate-700">|</span>
                    <span className={style?.text || "text-slate-400"}>
                      {st.name}: <strong>{count}</strong>
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapClient;
