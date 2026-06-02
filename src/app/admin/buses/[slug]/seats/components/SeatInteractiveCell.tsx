'use client'

import React from 'react'
import { Popover, PopoverContent, PopoverTrigger, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DoorOpen } from 'lucide-react'
import { useSeatBuilder, SeatCell } from './SeatBuilderContext'

export function SeatInteractiveCell({ cell, x, y }: { cell: SeatCell; x: number; y: number }) {
  const { 
    drawMode, 
    handlePointerDown, 
    handlePointerEnter, 
    handleCellClick, 
    popoverOpen, 
    setPopoverOpen,
    editingCell,
    editForm,
    setEditForm,
    handleSaveEdit
  } = useSeatBuilder()

  const isOpen = popoverOpen && editingCell?.x === x && editingCell?.y === y

  return (
    <Popover 
      open={isOpen}
      onOpenChange={(open) => {
         if (!open) setPopoverOpen(false)
      }}
    >
      <PopoverTrigger>
        <div
          onPointerDown={() => handlePointerDown(x, y)}
          onPointerEnter={() => handlePointerEnter(x, y)}
          onClick={() => {
            if (drawMode === 'none' && cell.type !== 'empty' && cell.type !== 'door') {
              handleCellClick(cell)
            }
          }}
          className={`
            w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all relative
            border-2 
            ${cell.type === 'seat' ? 'bg-primary text-primary-foreground border-primary/20 shadow-md hover:-translate-y-0.5' : ''}
            ${cell.type === 'sleeper' ? 'bg-indigo-500 text-white border-indigo-600/20 h-24 shadow-md hover:-translate-y-0.5' : ''}
            ${cell.type === 'door' ? 'bg-amber-100 text-amber-700 border-amber-300 border-dashed' : ''}
            ${cell.type === 'empty' ? 'bg-transparent border-transparent' : ''}
            ${!cell.isActive && cell.type !== 'empty' && cell.type !== 'door' ? 'opacity-40 grayscale' : ''}
          `}
        >
          {cell.type !== 'empty' && cell.type !== 'door' && (
            <>
              <span>{cell.row}{cell.seatNumber || ''}</span>
              {cell.type === 'sleeper' && <span className="text-[9px] font-normal mt-0.5 opacity-80 uppercase tracking-wider">Bed</span>}
              {cell.isAccessible && <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm">♿</span>}
            </>
          )}
          {cell.type === 'door' && <DoorOpen className="w-6 h-6 opacity-60" />}
        </div>
      </PopoverTrigger>
      
      <PopoverContent side="right" className="w-64 p-4">
        <PopoverHeader className="mb-4">
          <PopoverTitle>Edit Seat {editForm.row}{editForm.seatNumber}</PopoverTitle>
        </PopoverHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Row</Label>
              <Input value={editForm.row || ''} onChange={(e) => setEditForm(f => ({ ...f, row: e.target.value }))} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Number</Label>
              <Input type="number" value={editForm.seatNumber || ''} onChange={(e) => setEditForm(f => ({ ...f, seatNumber: parseInt(e.target.value) || 0 }))} className="h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={editForm.type} onValueChange={(v: any) => setEditForm(f => ({ ...f, type: v }))}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seat">Standard Seat</SelectItem>
                <SelectItem value="sleeper">Sleeper Bed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <Label className="text-xs">Active (Bookable)</Label>
            <Switch checked={editForm.isActive} onCheckedChange={(v) => setEditForm(f => ({ ...f, isActive: v }))} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <Label className="text-xs">Accessible Seat ♿</Label>
            <Switch checked={editForm.isAccessible} onCheckedChange={(v) => setEditForm(f => ({ ...f, isAccessible: v }))} />
          </div>
          <Button className="w-full mt-2 h-8" onClick={handleSaveEdit}>Apply Changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
