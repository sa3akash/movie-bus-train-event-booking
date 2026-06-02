'use client'

import React from 'react'
import { BusSeat } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface PublicSeatCellProps {
  seat: BusSeat;
  isSelected: boolean;
  onToggle: (seat: BusSeat) => void;
}

export function PublicSeatCell({ seat, isSelected, onToggle }: PublicSeatCellProps) {
  const isAvailable = seat.isActive

  return (
    <button
      onClick={() => isAvailable && onToggle(seat)}
      disabled={!isAvailable}
      style={{
        gridColumn: seat.x + 1, // +1 because CSS grid is 1-indexed
        gridRow: seat.y + 1
      }}
      className={cn(
        "relative w-12 h-14 md:w-14 md:h-16 rounded-xl transition-all duration-200 flex flex-col items-center justify-center border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Base styling for valid seats
        "shadow-sm",
        
        // State: Selected
        isSelected 
          ? "bg-primary text-primary-foreground border-primary/20 scale-105 shadow-md shadow-primary/20"
          : "",
          
        // State: Available (Not selected)
        isAvailable && !isSelected 
          ? "bg-background text-foreground border-muted-foreground/30 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md cursor-pointer" 
          : "",
          
        // State: Unavailable / Booked
        !isAvailable 
          ? "bg-muted text-muted-foreground border-muted-foreground/10 opacity-60 cursor-not-allowed" 
          : ""
      )}
      aria-label={`${seat.row}${seat.seatNumber} - ${isSelected ? 'Selected' : isAvailable ? 'Available' : 'Unavailable'}`}
    >
      {/* Top of seat cushion visual */}
      <div className={cn(
        "absolute top-1 inset-x-1.5 h-2.5 rounded-t-lg opacity-50",
        isSelected ? "bg-primary-foreground/30" : isAvailable ? "bg-muted-foreground/20" : "bg-muted-foreground/10"
      )} />
      
      {/* Seat Identifier */}
      <div className="z-10 mt-2 flex flex-col items-center justify-center font-bold text-xs md:text-sm">
        {isSelected ? (
          <Check className="w-5 h-5 animate-in zoom-in duration-200" />
        ) : (
          <span>{seat.row}{seat.seatNumber}</span>
        )}
      </div>

      {/* Accessible Badge */}
      {seat.isAccessible && (
        <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[8px] md:text-[10px] shadow-sm z-20">
          ♿
        </span>
      )}
    </button>
  )
}
