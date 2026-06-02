"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

export type SeatCell = {
  id?: string;
  x: number;
  y: number;
  level: number;
  type: "seat" | "sleeper" | "empty" | "door";
  row: string;
  seatNumber: number;
  isActive: boolean;
  isAccessible: boolean;
};

export type SeatBuilderContextType = {
  slug: string;
  loading: boolean;
  syncing: boolean;
  bus: any;
  busType: any;
  matrix: Record<string, SeatCell>;
  setMatrix: React.Dispatch<React.SetStateAction<Record<string, SeatCell>>>;
  customRows: number;
  setCustomRows: React.Dispatch<React.SetStateAction<number>>;
  customCols: number;
  setCustomCols: React.Dispatch<React.SetStateAction<number>>;
  activeLevel: number;
  setActiveLevel: React.Dispatch<React.SetStateAction<number>>;
  drawMode: "none" | "seat" | "sleeper" | "door" | "empty";
  setDrawMode: React.Dispatch<
    React.SetStateAction<"none" | "seat" | "sleeper" | "door" | "empty">
  >;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  numDirection: "front-to-back" | "back-to-front";
  setNumDirection: React.Dispatch<
    React.SetStateAction<"front-to-back" | "back-to-front">
  >;
  numConvention: "row-based" | "continuous";
  setNumConvention: React.Dispatch<
    React.SetStateAction<"row-based" | "continuous">
  >;
  numOpen: boolean;
  setNumOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingCell: SeatCell | null;
  setEditingCell: React.Dispatch<React.SetStateAction<SeatCell | null>>;
  editForm: Partial<SeatCell>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<SeatCell>>>;
  popoverOpen: boolean;
  setPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  load: () => Promise<void>;
  applyTemplate: (
    layout: string,
    r?: number,
    c?: number,
    level?: number,
  ) => void;
  applyDraw: (x: number, y: number) => void;
  handleSave: () => Promise<void>;
  handleCellClick: (cell: SeatCell) => void;
  handleSaveEdit: () => void;
  handlePointerDown: (x: number, y: number) => void;
  handlePointerEnter: (x: number, y: number) => void;
};

const SeatBuilderContext = createContext<SeatBuilderContextType | undefined>(
  undefined,
);

export function SeatBuilderProvider({
  children,
  slug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [bus, setBus] = useState<any>(null);
  const [busType, setBusType] = useState<any>(null);
  const [originalPhysicalSeats, setOriginalPhysicalSeats] = useState<any[]>([]);

  const [matrix, setMatrix] = useState<Record<string, SeatCell>>({});
  const [customRows, setCustomRows] = useState(10);
  const [customCols, setCustomCols] = useState(5);
  const [activeLevel, setActiveLevel] = useState(1);
  const [drawMode, setDrawMode] = useState<
    "none" | "seat" | "sleeper" | "door" | "empty"
  >("none");
  const [isDrawing, setIsDrawing] = useState(false);

  const [numDirection, setNumDirection] = useState<
    "front-to-back" | "back-to-front"
  >("front-to-back");
  const [numConvention, setNumConvention] = useState<
    "row-based" | "continuous"
  >("row-based");
  const [numOpen, setNumOpen] = useState(false);

  const [editingCell, setEditingCell] = useState<SeatCell | null>(null);
  const [editForm, setEditForm] = useState<Partial<SeatCell>>({});
  const [popoverOpen, setPopoverOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const busRes = await fetch(`/api/bus/buses/slug/${slug}`);
      if (!busRes.ok) throw new Error("Bus not found");
      const busData = await busRes.json();
      setBus(busData);

      const [typeRes, seatsRes] = await Promise.all([
        fetch(`/api/bus/types/${busData.typeId}`),
        fetch(`/api/bus/seats?busId=${busData.id}&limit=500`),
      ]);

      const typeData = await typeRes.json();
      setBusType(typeData);

      const physicalSeats = await seatsRes.json();
      setOriginalPhysicalSeats(physicalSeats.items || []);

      let maxR = typeData.seatLayout?.rows || 10;
      let maxC = typeData.seatLayout?.columns || 5;
      const newMatrix: Record<string, SeatCell> = {};

      if (physicalSeats.items?.length > 0) {
        physicalSeats.items.forEach((s: any) => {
          const y = parseInt(s.posY);
          const x = parseInt(s.posX);
          if (y >= maxR) maxR = y + 1;
          if (x >= maxC) maxC = x + 1;

          newMatrix[`${s.level}-${y}-${x}`] = {
            id: s.id,
            x,
            y,
            level: s.level,
            type: s.seatType?.slug === "sleeper" ? "sleeper" : "seat",
            row: s.row || "",
            seatNumber: s.seatNumber || 0,
            isActive: s.isActive,
            isAccessible: s.isAccessible,
          };
        });
        setMatrix(newMatrix);
      } else {
        // Apply default inline since we don't want to call applyTemplate which might rely on stale state
        const layoutMap: Record<string, string[]> = {
          "2x2": ["seat", "seat", "empty", "seat", "seat"],
        };
        const pattern = layoutMap["2x2"];
        let counter = 1;
        const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

        for (let y = 0; y < maxR; y++) {
          let seatInRowCounter = 1;
          for (let x = 0; x < pattern.length; x++) {
            const type = pattern[x] as any;
            const key = `1-${y}-${x}`;
            if (type === "empty") {
              newMatrix[key] = {
                x,
                y,
                level: 1,
                type,
                row: "",
                seatNumber: 0,
                isActive: true,
                isAccessible: false,
              };
            } else {
              newMatrix[key] = {
                x,
                y,
                level: 1,
                type,
                row: rowLabels[y] || `R${y}`,
                seatNumber: seatInRowCounter,
                isActive: true,
                isAccessible: false,
              };
              seatInRowCounter++;
            }
          }
        }
      }

      setCustomRows(maxR);
      setCustomCols(maxC);
    } catch (err: any) {
      toast.error(err.message || "Error loading seat map");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const getAutoNumberedMatrix = (
    currentMatrix: Record<string, SeatCell>,
    direction: string,
    convention: string,
    rows: number,
    cols: number,
    level: number,
  ) => {
    const next = { ...currentMatrix };
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let continuousCounter = 1;

    const yStart = direction === "front-to-back" ? 0 : rows - 1;
    const yEnd = direction === "front-to-back" ? rows : -1;
    const yStep = direction === "front-to-back" ? 1 : -1;

    let visualRowIdx = 0;

    for (let y = yStart; y !== yEnd; y += yStep) {
      let hasSeatsInRow = false;
      let seatInRowCounter = 1;

      for (let x = 0; x < cols; x++) {
        const key = `${level}-${y}-${x}`;
        const cell = next[key];

        if (!cell || cell.type === "empty" || cell.type === "door") {
          if (cell) next[key] = { ...cell, row: "", seatNumber: 0 };
          continue;
        }

        hasSeatsInRow = true;

        if (convention === "row-based") {
          next[key] = {
            ...cell,
            row: rowLabels[visualRowIdx] || `R${visualRowIdx}`,
            seatNumber: seatInRowCounter,
          };
          seatInRowCounter++;
        } else {
          next[key] = { ...cell, row: "", seatNumber: continuousCounter };
          continuousCounter++;
        }
      }
      if (hasSeatsInRow) visualRowIdx++;
    }
    return next;
  };

  const applyTemplate = (
    layout: string,
    r: number = customRows,
    c: number = customCols,
    level: number = activeLevel,
  ) => {
    const layoutMap: Record<string, string[]> = {
      "2x2": ["seat", "seat", "empty", "seat", "seat"],
      "2x1": ["seat", "seat", "empty", "seat"],
      "1x1": ["seat", "empty", "seat"],
      sleeper2x1: ["sleeper", "sleeper", "empty", "sleeper"],
    };
    const pattern = layoutMap[layout] || layoutMap["2x2"];

    const newCols = pattern.length;
    setCustomCols(newCols);
    setCustomRows(r);

    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    setMatrix((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${level}-`)) delete next[k];
      });

      for (let y = 0; y < r; y++) {
        let seatInRowCounter = 1;
        for (let x = 0; x < newCols; x++) {
          const type = pattern[x] as any;
          const key = `${level}-${y}-${x}`;

          if (type === "empty") {
            next[key] = {
              x,
              y,
              level,
              type,
              row: "",
              seatNumber: 0,
              isActive: true,
              isAccessible: false,
            };
          } else {
            next[key] = {
              x,
              y,
              level,
              type,
              row: rowLabels[y] || `R${y}`,
              seatNumber: seatInRowCounter,
              isActive: true,
              isAccessible: false,
            };
            seatInRowCounter++;
          }
        }
      }
      return next;
    });
    toast.success(`${layout} template applied!`);
  };

  const applyDraw = (x: number, y: number) => {
    setMatrix((prev) => {
      const next = { ...prev };
      const key = `${activeLevel}-${y}-${x}`;
      const current = next[key] || {
        x,
        y,
        level: activeLevel,
        type: "seat",
        row: "",
        seatNumber: 0,
        isActive: true,
        isAccessible: false,
      };

      next[key] = { ...current, type: drawMode, row: "", seatNumber: 0 };

      return getAutoNumberedMatrix(
        next,
        numDirection,
        numConvention,
        customRows,
        customCols,
        activeLevel,
      );
    });
  };

  const handlePointerDown = (x: number, y: number) => {
    if (drawMode !== "none") {
      setIsDrawing(true);
      applyDraw(x, y);
    }
  };

  const handlePointerEnter = (x: number, y: number) => {
    if (isDrawing && drawMode !== "none") {
      applyDraw(x, y);
    }
  };

  const handleGlobalPointerUp = () => setIsDrawing(false);

  useEffect(() => {
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, []);

  const handleCellClick = (cell: SeatCell) => {
    if (drawMode !== "none") return;
    setEditingCell(cell);
    setEditForm({ ...cell });
    setPopoverOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    setMatrix((prev) => ({
      ...prev,
      [`${editingCell.level}-${editingCell.y}-${editingCell.x}`]: {
        ...editingCell,
        ...editForm,
      } as SeatCell,
    }));
    setPopoverOpen(false);
  };

  const handleSave = async () => {
    setSyncing(true);
    try {
      const currentLevelSeats = Object.values(matrix).filter(
        (s) => s.level === activeLevel,
      );
      const existingLevelSeats = originalPhysicalSeats.filter(
        (s) => s.level === activeLevel,
      );

      const toDelete = existingLevelSeats.filter((es) => {
        const matchingCell = matrix[`${activeLevel}-${es.posY}-${es.posX}`];
        return (
          !matchingCell ||
          matchingCell.type === "empty" ||
          matchingCell.type === "door"
        );
      });

      const toUpsert = currentLevelSeats.filter(
        (s) => s.type === "seat" || s.type === "sleeper",
      );

      navigator.clipboard.writeText(
        JSON.stringify(
          {
            rows: customRows,
            columns: customCols,
            seats: toUpsert.map(seat => ({
              row: seat.row,
              seatNumber: seat.seatNumber,
              x: seat.x,
              y: seat.y,
              type: seat.type, // Added type just in case
              isActive: seat.isActive,
              isAccessible: seat.isAccessible
            })),
          },
          null,
          2
        )
      );

/*
      for (const seat of toDelete) {
        await fetch(`/api/bus/seats/${seat.id}`, { method: "DELETE" });
      }

      for (const seat of toUpsert) {
        if (seat.id) {
          await fetch(`/api/bus/seats/${seat.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              row: seat.row,
              seatNumber: seat.seatNumber,
              isActive: seat.isActive,
              isAccessible: seat.isAccessible,
            }),
          });
        } else {
          await fetch(`/api/bus/seats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              busId: bus.id,
              row: seat.row,
              seatNumber: seat.seatNumber,
              level: seat.level,
              posX: String(seat.x),
              posY: String(seat.y),
              isAccessible: seat.isAccessible,
              isActive: seat.isActive,
            }),
          });
        }
      }
*/
      toast.success("Layout saved successfully!");
      load();
    } catch (err: any) {
      toast.error("Failed to save layout");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SeatBuilderContext.Provider
      value={{
        slug,
        loading,
        syncing,
        bus,
        busType,
        matrix,
        setMatrix,
        customRows,
        setCustomRows,
        customCols,
        setCustomCols,
        activeLevel,
        setActiveLevel,
        drawMode,
        setDrawMode,
        isDrawing,
        setIsDrawing,
        numDirection,
        setNumDirection,
        numConvention,
        setNumConvention,
        numOpen,
        setNumOpen,
        editingCell,
        setEditingCell,
        editForm,
        setEditForm,
        popoverOpen,
        setPopoverOpen,
        load,
        applyTemplate,
        applyDraw,
        handleSave,
        handleCellClick,
        handleSaveEdit,
        handlePointerDown,
        handlePointerEnter,
      }}
    >
      {children}
    </SeatBuilderContext.Provider>
  );
}

export function useSeatBuilder() {
  const context = useContext(SeatBuilderContext);
  if (context === undefined) {
    throw new Error("useSeatBuilder must be used within a SeatBuilderProvider");
  }
  return context;
}
