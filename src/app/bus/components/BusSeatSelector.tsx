'use client'

import React, { useState } from 'react'
import { BusLayout, BusSeat } from '@/lib/data'
import { PublicBusGrid } from './PublicBusGrid'
import { Button } from '@/components/ui/button'
import { Check, ShieldAlert, AlertCircle, X } from 'lucide-react'
import { BookedSeatData, SelectedSeatWithGender } from './types'
import { TooltipProvider } from '@/components/ui/tooltip'

interface BusSeatSelectorProps {
  layout: BusLayout;
  maxSeats?: number;
}

export function BusSeatSelector({ layout, maxSeats = 4 }: BusSeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatWithGender[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSelectSeat = (seat: BusSeat, gender: 'male' | 'female') => {
    setErrorMsg(null)
    
    if (selectedSeats.length >= maxSeats) {
      setErrorMsg(`You can only select up to ${maxSeats} seats.`)
      return
    }

    // --- ADJACENCY LOGIC (The "Safe Seat" Rule) ---
    if (gender === 'male') {
      const isAdjacentToSoloFemale = layout.seats.some(s => {
        const isAdjacent = s.y === seat.y && Math.abs(s.x - seat.x) === 1;
        
        // If the adjacent seat is booked by a female in the system
        return isAdjacent && s.bookedGender === 'female';
      });

      if (isAdjacentToSoloFemale) {
        setErrorMsg(`For safety and comfort, male passengers cannot book a seat adjacent to a solo female passenger.`)
        return
      }
    }

    setSelectedSeats(prev => [...prev, { seat, gender }])
  }

  const handleDeselectSeat = (seat: BusSeat) => {
    setErrorMsg(null)
    setSelectedSeats(prev => prev.filter(s => !(s.seat.x === seat.x && s.seat.y === seat.y)))
  }

  const totalPrice = selectedSeats.length * 25

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-6xl mx-auto items-start">
      
      {/* Left Column: Legend & Seat Map */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
        
        {/* Validation Error Message */}
        {errorMsg && (
          <div className="mb-6 w-full max-w-md bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-destructive/70 hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-muted-foreground/30 bg-background shadow-sm" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-pink-600 bg-pink-500 text-white shadow-sm flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            <span>Selected (Female)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-blue-600 bg-blue-500 text-white shadow-sm flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            <span>Selected (Male)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-pink-100 border border-pink-200 text-pink-500 flex items-center justify-center text-[10px]">
              👩
            </div>
            <span>Female</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-100 border border-blue-200 text-blue-500 flex items-center justify-center text-[10px]">
              👨
            </div>
            <span>Male</span>
          </div>
        </div>

        {/* Seat Map */}
        <TooltipProvider>
          <PublicBusGrid 
            layout={layout} 
            selectedSeats={selectedSeats}
            onSelectSeat={handleSelectSeat}
            onDeselectSeat={handleDeselectSeat}
          />
        </TooltipProvider>
      </div>

      {/* Right Column: Booking Summary */}
      <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
        <div className="bg-card border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Booking Summary</h2>
            <p className="text-muted-foreground text-sm mt-1">Select up to {maxSeats} seats for your journey.</p>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-start pb-4 border-b">
               <div className="flex-1">
                 <span className="text-sm font-medium text-muted-foreground block mb-3">Seats Selected</span>
                 <div className="flex flex-col gap-2">
                   {selectedSeats.length === 0 ? (
                     <span className="text-sm text-muted-foreground italic">None selected</span>
                   ) : (
                     selectedSeats.map(s => (
                       <div key={`${s.seat.x}-${s.seat.y}`} className="flex items-center justify-between bg-muted/40 p-2 rounded-md border text-sm">
                         <span className="font-bold w-12">{s.seat.row}{s.seat.seatNumber}</span>
                         <span className="flex items-center gap-1.5 text-muted-foreground capitalize text-xs">
                           {s.gender === 'female' ? '👩 Female' : '👨 Male'}
                         </span>
                         <button 
                           onClick={() => handleDeselectSeat(s.seat)}
                           className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                         >
                           <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     ))
                   )}
                 </div>
               </div>
               <span className="text-sm font-medium ml-4 mt-1 bg-secondary px-2 py-1 rounded">{selectedSeats.length} / {maxSeats}</span>
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
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg border">
             <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
             <p>Your seats will be reserved for 5 minutes after clicking continue.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
