'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeySquare, DoorOpen, Plus, Minus, Trash2, Armchair, BedDouble } from 'lucide-react'
import { useSeatBuilder } from './SeatBuilderContext'

export function SeatBuilderSidebar() {
  const { 
    activeLevel, setActiveLevel, 
    customRows, setCustomRows, 
    customCols, setCustomCols, 
    drawMode, setDrawMode 
  } = useSeatBuilder()

  return (
    <div className="w-full lg:w-64 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Level & Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeLevel.toString()} onValueChange={(v) => setActiveLevel(parseInt(v))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1">Lower</TabsTrigger>
              <TabsTrigger value="2">Upper</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <Label className="text-xs">Rows</Label>
                <div className="flex items-center gap-1 bg-secondary rounded-md p-1 border">
                   <Button variant="ghost" size="icon" className="w-6 h-6 h-auto p-0" onClick={() => setCustomRows(r => Math.max(1, r - 1))}><Minus className="w-3 h-3" /></Button>
                   <span className="flex-1 text-center text-sm font-bold">{customRows}</span>
                   <Button variant="ghost" size="icon" className="w-6 h-6 h-auto p-0" onClick={() => setCustomRows(r => r + 1)}><Plus className="w-3 h-3" /></Button>
                </div>
             </div>
             <div className="space-y-1.5">
                <Label className="text-xs">Cols</Label>
                <div className="flex items-center gap-1 bg-secondary rounded-md p-1 border">
                   <Button variant="ghost" size="icon" className="w-6 h-6 h-auto p-0" onClick={() => setCustomCols(c => Math.max(1, c - 1))}><Minus className="w-3 h-3" /></Button>
                   <span className="flex-1 text-center text-sm font-bold">{customCols}</span>
                   <Button variant="ghost" size="icon" className="w-6 h-6 h-auto p-0" onClick={() => setCustomCols(c => c + 1)}><Plus className="w-3 h-3" /></Button>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Draw Tools</CardTitle>
            <CardDescription className="text-xs">Click and drag</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant={drawMode === 'none' ? 'default' : 'outline'} 
            className="w-full justify-start gap-2" 
            onClick={() => setDrawMode('none')}
          >
            <KeySquare className="w-4 h-4" /> Select / Edit
          </Button>
          <Button 
            variant={drawMode === 'seat' ? 'default' : 'outline'} 
            className="w-full justify-start gap-2 text-primary" 
            onClick={() => setDrawMode('seat')}
          >
            <Armchair className="w-4 h-4" /> Draw Seat
          </Button>
          <Button 
            variant={drawMode === 'sleeper' ? 'default' : 'outline'} 
            className="w-full justify-start gap-2 text-indigo-500" 
            onClick={() => setDrawMode('sleeper')}
          >
            <BedDouble className="w-4 h-4" /> Draw Sleeper
          </Button>
          <Button 
            variant={drawMode === 'empty' ? 'default' : 'outline'} 
            className="w-full justify-start gap-2 text-muted-foreground" 
            onClick={() => setDrawMode('empty')}
          >
            <Trash2 className="w-4 h-4" /> Erase (Empty)
          </Button>
          <Button 
            variant={drawMode === 'door' ? 'default' : 'outline'} 
            className="w-full justify-start gap-2 text-amber-600" 
            onClick={() => setDrawMode('door')}
          >
            <DoorOpen className="w-4 h-4" /> Draw Door
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
