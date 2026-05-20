"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Armchair, Star, Eraser, Save, MonitorPlay } from "lucide-react";

type SeatType = "available" | "vip" | "empty";

interface SeatNode {
  id: string;
  rowIndex: number;
  colIndex: number;
  type: SeatType;
  label: string; // Dynamic label like "A1"
}

export default function AddScreenPage() {
  const [screenName, setScreenName] = useState("Screen 1 - IMAX");
  // Helper to generate alphabet labels (A, B, C... Z, AA, AB)
  const getRowLabel = (index: number) => {
    let label = "";
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode(65 + (i % 26)) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  // Pure function to generate grid
  const createInitialGrid = (rCount: number, cCount: number) => {
    const newGrid: SeatNode[][] = [];
    for (let r = 0; r < rCount; r++) {
      const rowArr: SeatNode[] = [];
      const rowLabel = getRowLabel(r);
      for (let c = 0; c < cCount; c++) {
        rowArr.push({
          id: r + "-" + c,
          rowIndex: r,
          colIndex: c,
          type: "available",
          label: rowLabel + (c + 1),
        });
      }
      newGrid.push(rowArr);
    }
    return newGrid;
  };

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(12);
  const [grid, setGrid] = useState<SeatNode[][]>(() => createInitialGrid(10, 12));
  const [activeTool, setActiveTool] = useState<SeatType>("available");

  const handleGenerateGrid = useCallback(() => {
    setGrid(createInitialGrid(rows, cols));
  }, [rows, cols]);

  // Recalculate labels based on non-empty seats
  const recalculateLabels = useCallback((currentGrid: SeatNode[][]) => {
    const newGrid = [...currentGrid];
    let effectiveRow = 0;

    for (let r = 0; r < newGrid.length; r++) {
      // Check if row is entirely empty
      const isRowEmpty = newGrid[r].every((seat) => seat.type === "empty");
      
      if (isRowEmpty) continue; // Skip labeling this row entirely

      const rowLabel = getRowLabel(effectiveRow);
      let effectiveCol = 1;

      for (let c = 0; c < newGrid[r].length; c++) {
        if (newGrid[r][c].type !== "empty") {
          newGrid[r][c].label = rowLabel + effectiveCol;
          effectiveCol++;
        } else {
          newGrid[r][c].label = "";
        }
      }
      effectiveRow++;
    }
    return newGrid;
  }, []);

  // Handle clicking a seat
  const handleSeatClick = (rowIndex: number, colIndex: number) => {
    setGrid((prev) => {
      const newGrid = [...prev];
      newGrid[rowIndex] = [...newGrid[rowIndex]];
      newGrid[rowIndex][colIndex] = {
        ...newGrid[rowIndex][colIndex],
        type: activeTool,
      };
      
      // Recalculate labels automatically after a change
      return recalculateLabels(newGrid);
    });
  };

  // Calculate stats
  const stats = grid.flat().reduce(
    (acc, seat) => {
      if (seat.type === "available") acc.standard++;
      if (seat.type === "vip") acc.vip++;
      if (seat.type === "empty") acc.empty++;
      return acc;
    },
    { standard: 0, vip: 0, empty: 0 }
  );
  const totalCapacity = stats.standard + stats.vip;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Screen</h1>
          <p className="text-muted-foreground mt-1">
            Design and configure the seating layout for a new cinema screen.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Save className="mr-2 h-4 w-4" /> Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
              <CardDescription>Set the maximum grid size.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Screen Name</Label>
                <Input
                  id="name"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g. Screen 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Rows</Label>
                  <Input
                    id="rows"
                    type="number"
                    min={1}
                    max={50}
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cols">Columns</Label>
                  <Input
                    id="cols"
                    type="number"
                    min={1}
                    max={50}
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <Button onClick={handleGenerateGrid} variant="secondary" className="w-full">
                Generate Grid
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drawing Tools</CardTitle>
              <CardDescription>Select a tool and click on seats.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant={activeTool === "available" ? "default" : "outline"}
                className={"justify-start " + (activeTool === "available" ? "bg-blue-600 hover:bg-blue-700" : "")}
                onClick={() => setActiveTool("available")}
              >
                <Armchair className="mr-2 h-4 w-4" /> Standard Seat
              </Button>
              <Button
                variant={activeTool === "vip" ? "default" : "outline"}
                className={"justify-start " + (activeTool === "vip" ? "bg-amber-500 hover:bg-amber-600 text-white" : "")}
                onClick={() => setActiveTool("vip")}
              >
                <Star className="mr-2 h-4 w-4" /> VIP Seat
              </Button>
              <Button
                variant={activeTool === "empty" ? "default" : "outline"}
                className={"justify-start " + (activeTool === "empty" ? "bg-slate-700 hover:bg-slate-800" : "")}
                onClick={() => setActiveTool("empty")}
              >
                <Eraser className="mr-2 h-4 w-4" /> Blank / Aisle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Total Capacity</span>
                <span className="font-bold text-lg">{totalCapacity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Armchair className="h-4 w-4" /> Standard
                </span>
                <span className="font-semibold">{stats.standard}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <Star className="h-4 w-4" /> VIP
                </span>
                <span className="font-semibold">{stats.vip}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Area - Canvas */}
        <Card className="lg:col-span-3 flex flex-col items-center bg-muted/30 border-dashed border-2">
          <CardHeader className="text-center pb-0">
            <Badge variant="outline" className="px-4 py-1 text-sm bg-background">
              Interactive Editor
            </Badge>
          </CardHeader>
          <CardContent className="w-full flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
            {/* Screen Indicator */}
            <div className="w-3/4 max-w-2xl h-12 border-t-8 border-indigo-500 rounded-t-[100%] mb-12 flex items-center justify-center shadow-[0_-10px_20px_rgba(99,102,241,0.1)]">
              <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <MonitorPlay className="h-4 w-4" /> Screen
              </span>
            </div>

            {/* Grid Container */}
            <div 
              className="inline-grid gap-2 p-6 bg-background rounded-2xl shadow-sm border"
              style={{ gridTemplateColumns: "repeat(" + cols + ", minmax(0, 1fr))" }}
            >
              {grid.flat().map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.rowIndex, seat.colIndex)}
                  className={
                    "relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-t-lg rounded-b-sm text-xs font-semibold transition-all duration-200 " +
                    (seat.type === "available"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 shadow-sm"
                      : seat.type === "vip"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 shadow-md transform -translate-y-1"
                      : "bg-transparent text-transparent hover:bg-slate-100 dark:hover:bg-slate-800")
                  }
                  title={seat.type !== "empty" ? "Seat " + seat.label : "Blank"}
                >
                  {seat.type !== "empty" && seat.label}
                  
                  {/* Visual armrests for seats */}
                  {seat.type !== "empty" && (
                    <>
                      <div className={"absolute -left-1 top-2 bottom-1 w-1 rounded-l-sm opacity-50 " + (seat.type === 'vip' ? 'bg-amber-500' : 'bg-blue-400')} />
                      <div className={"absolute -right-1 top-2 bottom-1 w-1 rounded-r-sm opacity-50 " + (seat.type === 'vip' ? 'bg-amber-500' : 'bg-blue-400')} />
                    </>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-t-sm bg-blue-100 ring-1 ring-blue-200 dark:bg-blue-900/40" /> Standard
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-t-sm bg-amber-100 ring-1 ring-amber-200 dark:bg-amber-900/40" /> VIP
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div></div>
  );
}