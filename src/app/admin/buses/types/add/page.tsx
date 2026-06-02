'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, LayoutGrid, RotateCcw, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type SeatCell = {
  id: string
  rowIdx: number
  colIdx: number
  type: 'seat' | 'sleeper' | 'empty' | 'driver'
  label: string
}

export default function AddBusTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isAC: false,
    rows: 10,
    columns: 5,
  })

  const [grid, setGrid] = useState<SeatCell[]>([])
  
  // Naming logic: Rows A, B, C... Columns 1, 2, 3...
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const generateGrid = (r: number, c: number) => {
    const newGrid: SeatCell[] = []
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        newGrid.push({
          id: `${i}-${j}`,
          rowIdx: i,
          colIdx: j,
          // Usually col index 2 is the aisle in a 5-col bus (2x2 seating)
          type: j === Math.floor(c / 2) ? 'empty' : 'seat',
          label: '',
        })
      }
    }
    updateLabels(newGrid)
  }

  const updateLabels = (currentGrid: SeatCell[]) => {
    const updated = currentGrid.map((cell) => {
      if (cell.type === 'empty' || cell.type === 'driver') {
        return { ...cell, label: '' }
      }
      // Naming convention: A1, A2, A3, B1...
      const rowL = rowLabels[cell.rowIdx] || `R${cell.rowIdx}`
      // Determine seat number in this row
      const seatsInRowBefore = currentGrid.filter(c => c.rowIdx === cell.rowIdx && c.colIdx < cell.colIdx && c.type !== 'empty' && c.type !== 'driver').length
      const label = `${rowL}${seatsInRowBefore + 1}`
      return { ...cell, label }
    })
    setGrid(updated)
  }

  useEffect(() => {
    generateGrid(form.rows, form.columns)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegenerate = () => {
    generateGrid(form.rows, form.columns)
  }

  const toggleCell = (id: string) => {
    const types: ('seat' | 'sleeper' | 'empty' | 'driver')[] = ['seat', 'empty', 'sleeper']
    const newGrid = grid.map(c => {
      if (c.id === id) {
        const nextType = types[(types.indexOf(c.type) + 1) % types.length]
        return { ...c, type: nextType }
      }
      return c
    })
    updateLabels(newGrid)
  }

  const totalSeats = grid.filter(c => c.type === 'seat' || c.type === 'sleeper').length

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const setNumber = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1
    setForm((f) => ({ ...f, [k]: val > 40 ? 40 : val })) // limit to 40 max
  }

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast.error('Name and Slug are required')
      return
    }

    const seatLayout = {
      rows: form.rows,
      columns: form.columns,
      seats: grid.map(cell => ({
        row: rowLabels[cell.rowIdx] || `R${cell.rowIdx}`,
        seatNumber: cell.label || `${cell.rowIdx}-${cell.colIdx}`, // Use label or fallback for empty seats
        x: cell.colIdx,
        y: cell.rowIdx,
        type: cell.type === 'driver' ? 'empty' : cell.type
      }))
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bus/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          isAC: form.isAC,
          totalSeats: totalSeats,
          seatLayout: seatLayout,
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to save bus type')
      }

      toast.success('Bus layout blueprint created successfully!')
      router.push('/admin/buses/types')
    } catch (err: any) {
      toast.error(err.message || 'Error saving layout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/buses/types">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-primary" /> Add Bus Type
          </h1>
          <p className="text-muted-foreground mt-0.5">Define a new layout blueprint and seat configuration</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Details about this layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g. AC Sleeper" value={form.name}
                onChange={(e) => setForm((f) => ({
                  ...f, name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={set('slug')} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe this bus type…" value={form.description} onChange={set('description')} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch id="isAC" checked={form.isAC} onCheckedChange={(v) => setForm((f) => ({ ...f, isAC: v }))} />
              <Label htmlFor="isAC">Air Conditioned</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Seat Layout Generator</span>
              <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                Total Seats: <strong className="text-foreground">{totalSeats}</strong>
              </span>
            </CardTitle>
            <CardDescription>Click on a cell to toggle between Seat, Sleeper, and Empty (Aisle)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="space-y-2 flex-1">
                <Label>Rows</Label>
                <Input type="number" value={form.rows} onChange={setNumber('rows')} min={1} max={40} />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Columns</Label>
                <Input type="number" value={form.columns} onChange={setNumber('columns')} min={1} max={10} />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={handleRegenerate} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset Grid
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-dashed flex flex-col items-center overflow-x-auto">
              {/* Steering wheel icon placeholder */}
              <div className="w-full flex justify-end mb-6 pr-4">
                <div className="w-10 h-10 border-4 border-muted-foreground/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                </div>
              </div>

              <div 
                className="grid gap-2" 
                style={{ gridTemplateColumns: `repeat(${form.columns}, minmax(0, 1fr))` }}
              >
                {grid.map((cell) => (
                  <div
                    key={cell.id}
                    onClick={() => toggleCell(cell.id)}
                    className={`
                      w-14 h-14 rounded-lg flex items-center justify-center font-medium text-sm cursor-pointer transition-all select-none
                      ${cell.type === 'seat' ? 'bg-primary text-primary-foreground shadow-sm hover:brightness-110' : ''}
                      ${cell.type === 'sleeper' ? 'bg-indigo-500 text-white shadow-sm hover:brightness-110 h-20' : ''}
                      ${cell.type === 'empty' ? 'bg-transparent border border-dashed hover:bg-muted' : ''}
                    `}
                  >
                    {cell.type !== 'empty' && cell.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-4 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary"></div> Seat</div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-indigo-500"></div> Sleeper</div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 border border-dashed rounded"></div> Empty</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Link href="/admin/buses/types"><Button variant="outline" disabled={loading}>Cancel</Button></Link>
        <Button className="gap-2" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> Save Bus Type
        </Button>
      </div>
    </div>
  )
}
