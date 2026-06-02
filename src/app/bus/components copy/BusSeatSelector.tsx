'use client'

import React, { useState } from 'react'
import { BusLayout, BusSeat } from '@/lib/data'
import { PublicBusGrid } from './PublicBusGrid'
import { Button } from '@/components/ui/button'
import { Check, ShieldAlert } from 'lucide-react'

interface BusSeatSelectorProps {
  layout: BusLayout;
  maxSeats?: number;
}

export function BusSeatSelector({ layout, maxSeats = 4 }: BusSeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<BusSeat[]>([])

  const handleToggleSeat = (seat: BusSeat) => {
    setSelectedSeats(prev => {
      const isAlreadySelected = prev.some(s => s.x === seat.x && s.y === seat.y)
      
      if (isAlreadySelected) {
        return prev.filter(s => !(s.x === seat.x && s.y === seat.y))
      } else {
        if (prev.length >= maxSeats) {
          // Could replace with a toast error
          return prev
        }
        return [...prev, seat]
      }
    })
  }

  const totalPrice = selectedSeats.length * 25 // Dummy price calculation

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-6xl mx-auto items-start">
      
      {/* Left Column: Legend & Seat Map */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
        
        {/* Legend */}
        <div className="flex items-center gap-6 mb-8 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-muted-foreground/30 bg-background shadow-sm" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-primary/20 bg-primary shadow-sm flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted border border-muted-foreground/10 opacity-60" />
            <span>Booked</span>
          </div>
        </div>

        {/* Seat Map */}
        <PublicBusGrid 
          layout={layout} 
          selectedSeats={selectedSeats} 
          onToggleSeat={handleToggleSeat} 
        />
      </div>

      {/* Right Column: Booking Summary */}
      <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
        <div className="bg-card border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Booking Summary</h2>
            <p className="text-muted-foreground text-sm mt-1">Select up to {maxSeats} seats for your journey.</p>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end pb-4 border-b">
               <div>
                 <span className="text-sm font-medium text-muted-foreground block mb-1">Seats Selected</span>
                 <div className="flex flex-wrap gap-2">
                   {selectedSeats.length === 0 ? (
                     <span className="text-sm text-muted-foreground italic">None selected</span>
                   ) : (
                     selectedSeats.map(s => (
                       <span key={`${s.x}-${s.y}`} className="px-2 py-1 bg-primary/10 text-primary font-bold text-sm rounded-md border border-primary/20">
                         {s.row}{s.seatNumber}
                       </span>
                     ))
                   )}
                 </div>
               </div>
               <span className="text-sm font-medium">{selectedSeats.length} / {maxSeats}</span>
             </div>

             <div className="flex justify-between items-center pb-4 border-b">
               <span className="text-muted-foreground">Price per seat</span>
               <span className="font-medium">$25.00</span>
             </div>

             <div className="flex justify-between items-center text-lg font-bold">
               <span>Total Price</span>
               <span className="text-primary">${totalPrice.toFixed(2)}</span>
             </div>
          </div>

          <Button 
            size="lg" 
            className="w-full h-12 text-base font-semibold mt-4" 
            disabled={selectedSeats.length === 0}
          >
            Continue to Payment
          </Button>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg">
             <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
             <p>Your seats will be reserved for 5 minutes after clicking continue.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
