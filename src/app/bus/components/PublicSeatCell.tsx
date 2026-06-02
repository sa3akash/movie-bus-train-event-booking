"use client";

import React, { useState } from "react";
import { BusSeat } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, Lock, Ban } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BookedSeatData } from "./types";

interface PublicSeatCellProps {
  seat: BusSeat;
  isSelected: boolean;
  selectedGender?: "male" | "female";
  isMaleDisabled?: boolean;
  onSelect: (gender: "male" | "female") => void;
  onDeselect: () => void;
}

export function PublicSeatCell({
  seat,
  isSelected,
  selectedGender,
  isMaleDisabled,
  onSelect,
  onDeselect,
}: PublicSeatCellProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isAvailable = seat.isActive && !seat.bookedGender;
  const isBookedFemale = seat.bookedGender === "female";
  const isBookedMale = seat.bookedGender === "male";
  const isBlocked = !seat.isActive && !seat.bookedGender; // Like a physical obstacle or maintenance

  const handleGenderPick = (gender: "male" | "female") => {
    setPopoverOpen(false);
    onSelect(gender);
  };

  const tooltipText = isSelected
    ? `Seat ${seat.row}${seat.seatNumber} - Selected (${selectedGender})`
    : isBookedFemale
      ? `Seat ${seat.row}${seat.seatNumber} - Booked (Female)`
      : isBookedMale
        ? `Seat ${seat.row}${seat.seatNumber} - Booked (Male)`
        : !isAvailable
          ? `Seat ${seat.row}${seat.seatNumber} - Unavailable`
          : `Seat ${seat.row}${seat.seatNumber} - Available for $25`;

  // Grid wrapper for structural placement (fixes Radix Tooltip/Popover ref collisions)
  const wrapperStyle = {
    gridColumn: seat.x + 1,
    gridRow: seat.y + 1,
  };

  const buttonElement = (
    <button
      onClick={() => {
        if (isSelected) {
          onDeselect();
        }
      }}
      disabled={!isAvailable && !isSelected}
      className={cn(
        "relative w-full h-full rounded-xl transition-all duration-300 flex flex-col items-center justify-center border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden",
        "shadow-sm group",

        // State: Selected
        isSelected && selectedGender === "female"
          ? "bg-pink-500 text-white border-pink-600 scale-[1.03] shadow-md shadow-pink-500/30"
          : isSelected && selectedGender === "male"
            ? "bg-blue-500 text-white border-blue-600 scale-[1.03] shadow-md shadow-blue-500/30"
            : "",

        // State: Available
        isAvailable && !isSelected
          ? "bg-background text-foreground border-muted-foreground/30 hover:border-primary hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          : "",

        // State: Booked Female
        isBookedFemale && !isSelected
          ? "bg-pink-50 text-pink-500 border-pink-200 opacity-90 cursor-not-allowed shadow-none"
          : "",

        // State: Booked Male
        isBookedMale && !isSelected
          ? "bg-blue-50 text-blue-500 border-blue-200 opacity-90 cursor-not-allowed shadow-none"
          : "",

        // State: Completely Blocked/Inactive
        isBlocked && !isSelected
          ? "bg-muted/50 text-muted-foreground/50 border-muted-foreground/10 opacity-50 cursor-not-allowed shadow-none "
          : "",
      )}
      aria-label={tooltipText}
    >
      {/* Top of seat cushion visual */}
      <div
        className={cn(
          "absolute top-1 inset-x-1.5 h-2.5 rounded-t-lg transition-colors duration-300",
          isSelected && selectedGender === "female"
            ? "bg-pink-400"
            : isSelected && selectedGender === "male"
              ? "bg-blue-400"
              : isBookedFemale
                ? "bg-pink-300"
                : isBookedMale
                  ? "bg-blue-300"
                  : isAvailable
                    ? "bg-muted-foreground/20 group-hover:bg-primary/20"
                    : "bg-muted-foreground/10",
        )}
      />

      {/* Center Icon / Identifier */}
      <div className="z-10 mt-2 flex flex-col items-center justify-center font-bold text-xs md:text-sm">
        {isSelected ? (
          <span className="animate-in zoom-in duration-200 flex items-center justify-center gap-0.5 drop-shadow-sm">
            {selectedGender === "female" ? "👩" : "👨"}
          </span>
        ) : isBookedFemale ? (
          <span className="text-pink-500 text-[10px] md:text-xs drop-shadow-sm">
            👩
          </span>
        ) : isBookedMale ? (
          <span className="text-blue-500 text-[10px] md:text-xs drop-shadow-sm">
            👨
          </span>
        ) : isBlocked ? (
          <Ban className="w-4 h-4 text-muted-foreground/40" />
        ) : (
          <span
            className={cn(
              "transition-colors",
              isAvailable ? "group-hover:text-primary" : "",
            )}
          >
            {seat.row}
            {seat.seatNumber}
          </span>
        )}
      </div>

      {/* Accessible Badge */}
      {seat.isAccessible && (
        <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[8px] md:text-[10px] shadow-sm z-20">
          ♿
        </span>
      )}

      {/* Lock icon overlay on hover if booked */}
      {!isAvailable && !isBlocked && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Lock className="w-5 h-5 text-foreground/50" />
        </div>
      )}
    </button>
  );

  return (
    <div style={wrapperStyle} className="w-12 h-14 md:w-14 md:h-16 relative">
      <Tooltip>
        <TooltipTrigger>
          {/* We must wrap the button in a simple div because TooltipTrigger asChild needs a DOM element, 
              but we don't want it stripping the grid placement style of the outer div. */}
          <div className="w-full h-full">
            {isAvailable && !isSelected ? (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger>{buttonElement}</PopoverTrigger>
                <PopoverContent
                  className="w-48 p-3 flex flex-col gap-3 rounded-xl shadow-xl z-[100] border-2"
                  side="top"
                  sideOffset={12}
                >
                  <div className="text-sm font-bold text-center border-b pb-2">
                    Passenger Gender
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="h-full">
                          <Button
                            variant="outline"
                            className="flex flex-col gap-1.5 h-16 w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 shadow-sm disabled:opacity-50 disabled:bg-muted disabled:border-muted-foreground/20 disabled:text-muted-foreground"
                            onClick={() => handleGenderPick("male")}
                            disabled={isMaleDisabled}
                          >
                            <span className="text-lg">👨</span>
                            <span className="text-xs font-semibold">Male</span>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {isMaleDisabled && (
                        <TooltipContent
                          side="bottom"
                          sideOffset={5}
                          className="bg-destructive text-destructive-foreground font-medium text-xs max-w-[150px] text-center z-[110]"
                        >
                          Cannot sit next to solo female passenger
                        </TooltipContent>
                      )}
                    </Tooltip>

                    <Button
                      variant="outline"
                      className="flex flex-col gap-1.5 h-16 border-pink-200 hover:bg-pink-50 hover:border-pink-300 text-pink-600 shadow-sm"
                      onClick={() => handleGenderPick("female")}
                    >
                      <span className="text-lg">👩</span>
                      <span className="text-xs font-semibold">Female</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              buttonElement
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="font-medium text-xs z-100"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
