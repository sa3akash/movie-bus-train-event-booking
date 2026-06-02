'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter
} from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, LayoutGrid, Loader2, Save, RefreshCw, Zap, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'

export default function BusSeatMapPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [bus, setBus] = useState<any>(null)
  const [busType, setBusType] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])

  const [selectedCell, setSelectedCell] = useState<any>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  // Custom grid dimensions that can stretch beyond the blueprint
  const [customRows, setCustomRows] = useState(0)
  const [customCols, setCustomCols] = useState(0)

  const [editForm, setEditForm] = useState({ 
    row: '', 
    seatNumber: '', 
    isActive: true, 
    isAccessible: false,
    seatType: 'seat' // 'seat' | 'sleeper'
  })

  const load = async () => {
    try {
      const busRes = await fetch(`/api/bus/buses/slug/${slug}`)
      if (!busRes.ok) throw new Error('Bus not found')
      const busData = await busRes.json()
      setBus(busData)

      const [typeRes, seatsRes] = await Promise.all([
        fetch(`/api/bus/types/${busData.typeId}`),
        fetch(`/api/bus/seats?busId=${busData.id}&limit=500`)
      ])
      
      if (!typeRes.ok) throw new Error('Bus type not found')
      const typeData = await typeRes.json()
      setBusType(typeData)

      const seatsData = await seatsRes.json()
      const physicalSeats = seatsData.items || []
      setSeats(physicalSeats)

      // Initialize grid dimensions based on blueprint AND physical seats
      let maxR = typeData.seatLayout?.rows || 10
      let maxC = typeData.seatLayout?.columns || 5
      
      physicalSeats.forEach((s: any) => {
        if (parseInt(s.posY) >= maxR) maxR = parseInt(s.posY) + 1
        if (parseInt(s.posX) >= maxC) maxC = parseInt(s.posX) + 1
      })
      
      setCustomRows(maxR)
      setCustomCols(maxC)

    } catch (err: any) {
      toast.error(err.message || 'Error loading seat map')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const openSheet = (cell: any) => {
    setSelectedCell(cell)
    if (cell.physicalSeat) {
      setEditForm({
        row: cell.physicalSeat.row,
        seatNumber: cell.physicalSeat.seatNumber,
        isActive: cell.physicalSeat.isActive,
        isAccessible: cell.physicalSeat.isAccessible,
        seatType: cell.type === 'empty' ? 'seat' : cell.type // Fallback to seat if previously empty
      })
    } else {
      setEditForm({ 
        row: cell.bpSeat?.row || '', 
        seatNumber: cell.bpSeat?.seatNumber || '', 
        isActive: true, 
        isAccessible: false,
        seatType: cell.bpSeat?.type === 'sleeper' ? 'sleeper' : 'seat'
      })
    }
    setSheetOpen(true)
  }

  const handleDeleteSeat = async () => {
    if (!selectedCell || !selectedCell.physicalSeat) return
    if (!confirm('Are you sure you want to permanently delete this physical seat?')) return
    
    setSyncing(true)
    try {
      const res = await fetch(`/api/bus/seats/${selectedCell.physicalSeat.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete seat')
      toast.success('Seat deleted successfully')
      setSheetOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.message || 'Error deleting seat')
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveSeat = async () => {
    if (!selectedCell) return
    setSyncing(true)
    try {
      if (selectedCell.physicalSeat) {
        // Update existing seat
        const res = await fetch(`/api/bus/seats/${selectedCell.physicalSeat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            row: editForm.row,
            seatNumber: parseInt(editForm.seatNumber) || 0,
            isActive: editForm.isActive,
            isAccessible: editForm.isAccessible,
            // (seatType isn't directly on physical seat yet, but could map to seatTypeId if implemented)
          })
        })
        if (!res.ok) throw new Error('Failed to update seat')
        toast.success('Seat updated')
      } else {
        // Create new seat at this exact geometric coordinate
        const res = await fetch(`/api/bus/seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            busId: bus.id,
            row: editForm.row,
            seatNumber: parseInt(editForm.seatNumber) || 0,
            level: 1, // Defaulting to lower deck
            posX: String(selectedCell.x),
            posY: String(selectedCell.y),
            isAccessible: editForm.isAccessible,
            isActive: editForm.isActive,
          })
        })
        if (!res.ok) throw new Error('Failed to create seat')
        toast.success('Custom seat created')
      }
      setSheetOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.message || 'Error saving seat')
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncMissing = async () => {
    const missing = gridCells.filter(c => c.bpSeat && c.bpSeat.type !== 'empty' && !c.physicalSeat)
    if (missing.length === 0) {
      toast.info('All blueprint seats are already synced!')
      return
    }
    setSyncing(true)
    try {
      for (const cell of missing) {
        await fetch(`/api/bus/seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            busId: bus.id,
            row: cell.bpSeat?.row || '',
            seatNumber: parseInt(String(cell.bpSeat?.seatNumber).replace(/\D/g, '')) || 0,
            level: 1,
            posX: String(cell.x),
            posY: String(cell.y),
            isAccessible: false,
            isActive: true,
          })
        })
      }
      toast.success(`Successfully generated ${missing.length} missing seats!`)
      load()
    } catch (err: any) {
      toast.error('Error syncing some seats')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="flex-1 p-8 pt-6 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!bus || !busType) {
    return <div className="flex-1 p-8 pt-6">Failed to load bus seat map.</div>
  }

  const blueprintSeats = busType.seatLayout?.seats || []

  const gridCells = []
  for (let i = 0; i < customRows; i++) {
    for (let j = 0; j < customCols; j++) {
      const bpSeat = blueprintSeats.find((s: any) => s.x === j && s.y === i)
      const physicalSeat = seats.find(s => parseInt(s.posX) === j && parseInt(s.posY) === i)

      // Type determination: prioritize physical seat existence, then blueprint. If neither, it's an empty cell space.
      let cellType = 'empty'
      if (physicalSeat) {
         // Determine if it was meant to be a sleeper from blueprint (since physical doesn't store type explicitly yet)
         cellType = bpSeat?.type === 'sleeper' ? 'sleeper' : 'seat'
      } else if (bpSeat && bpSeat.type !== 'empty') {
         cellType = bpSeat.type
      }

      gridCells.push({
        id: `${i}-${j}`,
        x: j,
        y: i,
        type: cellType,
        bpSeat,
        physicalSeat
      })
    }
  }

  const missingCount = gridCells.filter(c => c.bpSeat && c.bpSeat.type !== 'empty' && !c.physicalSeat).length

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/buses">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-7 h-7 text-primary" /> {bus.name} Dynamic Seat Map
            </h1>
            <p className="text-muted-foreground mt-0.5">Registration: {bus.registrationNo} · Blueprint: {busType.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {missingCount > 0 && (
            <Button onClick={handleSyncMissing} disabled={syncing} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Zap className="w-4 h-4" /> Sync {missingCount} Missing Blueprint Seats
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Completely Custom Layout Generation</CardTitle>
              <CardDescription>Click anywhere on the grid (even empty space) to spawn a custom physical seat. Override the blueprint dynamically.</CardDescription>
            </div>
            
            <div className="flex items-center gap-4 border rounded-lg p-2 bg-muted/20">
               <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Grid Rows:</Label>
                  <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => setCustomRows(r => Math.max(1, r - 1))}><Minus className="w-3 h-3" /></Button>
                  <span className="text-sm font-bold w-4 text-center">{customRows}</span>
                  <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => setCustomRows(r => r + 1)}><Plus className="w-3 h-3" /></Button>
               </div>
               <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Grid Cols:</Label>
                  <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => setCustomCols(c => Math.max(1, c - 1))}><Minus className="w-3 h-3" /></Button>
                  <span className="text-sm font-bold w-4 text-center">{customCols}</span>
                  <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => setCustomCols(c => c + 1)}><Plus className="w-3 h-3" /></Button>
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-8 rounded-xl border border-dashed flex flex-col items-center overflow-x-auto relative">
            <div className="w-full flex justify-end mb-8 pr-4">
               <div className="w-12 h-12 border-4 border-muted-foreground/30 rounded-full flex items-center justify-center" title="Driver's Seat">
                 <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
               </div>
            </div>

            <div 
              className="grid gap-3" 
              style={{ gridTemplateColumns: `repeat(${customCols}, minmax(0, 1fr))` }}
            >
              {gridCells.map((cell) => {
                
                // If there's no physical seat, but blueprint expected one, highlight it as missing
                if (cell.bpSeat && cell.bpSeat.type !== 'empty' && !cell.physicalSeat) {
                  return (
                    <div 
                      key={cell.id} 
                      onClick={() => openSheet(cell)}
                      className="w-16 h-16 rounded-xl bg-destructive/10 border-2 border-destructive/50 text-destructive flex items-center justify-center text-xs text-center p-1 cursor-pointer hover:bg-destructive/20 transition-colors"
                    >
                      Missing<br/>{cell.bpSeat.row}{cell.bpSeat.seatNumber}
                    </div>
                  )
                }

                // If it's totally empty (no blueprint, no physical)
                if (!cell.physicalSeat) {
                  return (
                    <div 
                      key={cell.id} 
                      onClick={() => openSheet(cell)}
                      className="w-16 h-16 rounded-xl border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors group relative"
                    >
                      <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )
                }

                // It's a real physical seat!
                return (
                  <div
                    key={cell.id}
                    onClick={() => openSheet(cell)}
                    className={`
                      w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-sm shadow-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 relative
                      ${cell.type === 'seat' ? 'bg-primary text-primary-foreground' : 'bg-indigo-500 text-white h-24'}
                      ${!cell.physicalSeat.isActive ? 'opacity-40 grayscale' : ''}
                    `}
                    title={`Seat ID: ${cell.physicalSeat.id}`}
                  >
                    <span>{cell.physicalSeat.row}{cell.physicalSeat.seatNumber}</span>
                    {cell.type === 'sleeper' && <span className="text-[10px] font-normal mt-1 opacity-80">Sleeper</span>}
                    {cell.physicalSeat.isAccessible && <span className="text-[10px] font-normal mt-0.5 opacity-80">♿</span>}
                    
                    {/* Highlight if it's an extra custom seat not in blueprint */}
                    {(!cell.bpSeat || cell.bpSeat.type === 'empty') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-background" title="Custom Override Seat" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary"></div> Active Seat</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-indigo-500"></div> Active Sleeper</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary opacity-40 grayscale"></div> Inactive (Blocked)</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 border border-dashed rounded flex items-center justify-center"><Plus className="w-3 h-3 text-muted-foreground opacity-50"/></div> Add Custom Space</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/50"></div> Missing DB Record</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Custom Override</div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedCell?.physicalSeat ? 'Manage Existing Seat' : 'Generate Custom Seat'}</SheetTitle>
            <SheetDescription>
              {selectedCell?.physicalSeat 
                ? 'Update or permanently delete this specific physical seat instance.' 
                : 'Create a completely new physical seat at this geometric grid coordinate.'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-8">
            {/* Context Coordinate Info */}
            <div className="bg-muted p-3 rounded-lg text-xs flex justify-between text-muted-foreground font-mono">
               <span>Grid X (Col): {selectedCell?.x}</span>
               <span>Grid Y (Row): {selectedCell?.y}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Row Identifier</Label>
                <Input value={editForm.row} onChange={(e) => setEditForm(f => ({ ...f, row: e.target.value }))} placeholder="e.g. A" />
              </div>
              <div className="space-y-2">
                <Label>Seat Number</Label>
                <Input value={editForm.seatNumber} onChange={(e) => setEditForm(f => ({ ...f, seatNumber: e.target.value }))} placeholder="e.g. 1" />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t mt-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Is this seat available for booking?</p>
                </div>
                <Switch checked={editForm.isActive} onCheckedChange={(v) => setEditForm(f => ({ ...f, isActive: v }))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Accessible Seat</Label>
                  <p className="text-sm text-muted-foreground">Prioritized for passengers with disabilities</p>
                </div>
                <Switch checked={editForm.isAccessible} onCheckedChange={(v) => setEditForm(f => ({ ...f, isAccessible: v }))} />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 flex sm:justify-between w-full">
             {selectedCell?.physicalSeat ? (
               <Button variant="destructive" onClick={handleDeleteSeat} disabled={syncing}>
                 <Trash2 className="w-4 h-4 mr-2" /> Delete 
               </Button>
             ) : (
               <div /> // placeholder for flex spacing
             )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSeat} disabled={syncing}>
                {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {selectedCell?.physicalSeat ? 'Save Changes' : 'Generate Seat'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
