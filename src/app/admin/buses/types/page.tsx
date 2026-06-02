'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, LayoutGrid } from 'lucide-react'

const mockTypes = [
  { id: '1', name: 'AC Sleeper',     slug: 'ac-sleeper',     totalSeats: 40, isAC: true,  isActive: true },
  { id: '2', name: 'AC Seater',      slug: 'ac-seater',      totalSeats: 42, isAC: true,  isActive: true },
  { id: '3', name: 'Non-AC Seater',  slug: 'non-ac-seater',  totalSeats: 48, isAC: false, isActive: true },
  { id: '4', name: 'Double Decker',  slug: 'double-decker',  totalSeats: 80, isAC: true,  isActive: false },
  { id: '5', name: 'Mini Coach',     slug: 'mini-coach',     totalSeats: 22, isAC: false, isActive: true },
]

export default function BusTypesPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', totalSeats: '', isAC: false })

  const filtered = mockTypes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-primary" /> Bus Types
          </h1>
          <p className="text-muted-foreground mt-1">Define bus layout blueprints and seat configurations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bus Type</DialogTitle>
              <DialogDescription>Define a new bus layout blueprint</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. AC Sleeper" value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f, name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Total Seats *</Label>
                <Input type="number" placeholder="42" value={form.totalSeats}
                  onChange={(e) => setForm((f) => ({ ...f, totalSeats: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe this bus type…" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="isAC" checked={form.isAC} onCheckedChange={(v) => setForm((f) => ({ ...f, isAC: v }))} />
                <Label htmlFor="isAC">Air Conditioned</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Types</p><p className="text-3xl font-bold mt-1">{mockTypes.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">AC Types</p><p className="text-3xl font-bold mt-1 text-blue-500">{mockTypes.filter(t => t.isAC).length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. Seats</p><p className="text-3xl font-bold mt-1 text-primary">{Math.round(mockTypes.reduce((a, t) => a + t.totalSeats, 0) / mockTypes.length)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bus Types</CardTitle>
          <CardDescription>Layout blueprints used across the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search types…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Total Seats</TableHead>
                <TableHead>AC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{type.slug}</TableCell>
                  <TableCell>{type.totalSeats}</TableCell>
                  <TableCell>
                    <Badge variant={type.isAC ? 'default' : 'outline'}>{type.isAC ? 'AC' : 'Non-AC'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? 'default' : 'secondary'}>{type.isActive ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Pencil className="w-4 h-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
