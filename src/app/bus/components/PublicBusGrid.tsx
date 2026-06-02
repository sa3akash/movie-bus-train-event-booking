'use client'

import React from 'react'
import { BusLayout, BusSeat } from '@/lib/data'
import { PublicSeatCell } from './PublicSeatCell'
import { SelectedSeatWithGender, BookedSeatData } from './types'

interface PublicBusGridProps {
  layout: BusLayout;
  selectedSeats: SelectedSeatWithGender[];
  onSelectSeat: (seat: BusSeat, gender: 'male' | 'female') => void;
  onDeselectSeat: (seat: BusSeat) => void;
}

export function PublicBusGrid({ layout, selectedSeats, onSelectSeat, onDeselectSeat }: PublicBusGridProps) {
  return (
    <div className="bg-muted/10 p-4 md:p-8 rounded-[40px] md:rounded-[60px] border-[6px] md:border-[10px] border-muted/50 flex flex-col items-center shadow-inner relative min-h-[500px] overflow-visible w-full max-w-sm mx-auto">
      
      {/* Steering Wheel / Front Dashboard Indicator */}
      <div className="absolute top-0 inset-x-0 h-16 md:h-20 bg-gradient-to-b from-muted-foreground/10 to-transparent flex justify-end pr-8 md:pr-12 items-start pt-4 z-0">
        <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-muted-foreground/30 rounded-full flex flex-col items-center justify-center shadow-sm bg-background/50 backdrop-blur-sm -rotate-45 relative">
          <div className="absolute inset-x-1 top-1/2 h-0.5 bg-muted-foreground/40 -translate-y-1/2" />
          <div className="absolute inset-y-1 left-1/2 w-0.5 bg-muted-foreground/40 -translate-x-1/2" />
        </div>
      </div>

      <div className="mt-16 md:mt-24 z-10 w-full flex justify-center pb-8">
        <div 
          className="grid gap-2 md:gap-3 touch-none select-none relative justify-items-center"
          style={{ 
             gridTemplateColumns: `repeat(${layout.columns}, minmax(40px, 1fr))`,
             gridTemplateRows: `repeat(${layout.rows}, auto)`
          }}
        >
          {layout.seats.map((seat, index) => {
            const selectedMatch = selectedSeats.find(s => s.seat.x === seat.x && s.seat.y === seat.y);

            // Check if male is disabled for this specific seat
            const isMaleDisabled = layout.seats.some(s => {
              const isAdjacent = s.y === seat.y && Math.abs(s.x - seat.x) === 1;
              return isAdjacent && s.bookedGender === 'female';
            });

            return (
              <PublicSeatCell 
                key={`${seat.x}-${seat.y}-${index}`} 
                seat={seat} 
                isSelected={!!selectedMatch}
                selectedGender={selectedMatch?.gender}
                isMaleDisabled={isMaleDisabled}
                onSelect={(gender) => onSelectSeat(seat, gender)}
                onDeselect={() => onDeselectSeat(seat)}
              />
            )
          })}
        </div>
      </div>
      
      {/* Back of bus visual */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-muted-foreground/10 to-transparent z-0"></div>
    </div>
  )
}
