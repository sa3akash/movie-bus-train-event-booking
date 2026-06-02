'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, Route, ArrowRight } from 'lucide-react'

const mockRoutes = [
  { id: '1', name: 'Dhaka to Chittagong', slug: 'dhaka-chittagong', origin: 'Dhaka', destination: 'Chittagong', distanceKm: '246', durationMins: 360, isActive: true },
  { id: '2', name: 'Dhaka to Sylhet',     slug: 'dhaka-sylhet',     origin: 'Dhaka', destination: 'Sylhet',     distanceKm: '244', durationMins: 390, isActive: true },
  { id: '3', name: 'Dhaka to Rajshahi',   slug: 'dhaka-rajshahi',   origin: 'Dhaka', destination: 'Rajshahi',   distanceKm: '253', durationMins: 420, isActive: true },
  { id: '4', name: 'Chittagong to Dhaka', slug: 'chittagong-dhaka', origin: 'Chittagong', destination: 'Dhaka', distanceKm: '246', durationMins: 360, isActive: false },
]

const mockLocations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', "Cox's Bazar", 'Khulna']

export default function RoutesPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', originId: '', destinationId: '', distanceKm: '', estimatedDurationMins: '' })

  const filtered = mockRoutes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? (mins % 60) + 'm' : ''}`

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="w-7 h-7 text-primary" /> Routes
          </h1>
          <p className="text-muted-foreground mt-1">Origin-destination corridors for bus operations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Route</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Route</DialogTitle>
              <DialogDescription>Create an origin-destination corridor</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Route Name *</Label>
                <Input placeholder="e.g. Dhaka to Chittagong" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Origin *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, originId: v }))}>
                    <SelectTrigger><SelectValue placeholder="From city" /></SelectTrigger>
                    <SelectContent>{mockLocations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, destinationId: v }))}>
                    <SelectTrigger><SelectValue placeholder="To city" /></SelectTrigger>
                    <SelectContent>{mockLocations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Distance (km)</Label>
                  <Input type="number" placeholder="246" value={form.distanceKm} onChange={(e) => setForm((f) => ({ ...f, distanceKm: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Est. Duration (mins)</Label>
                  <Input type="number" placeholder="360" value={form.estimatedDurationMins} onChange={(e) => setForm((f) => ({ ...f, estimatedDurationMins: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Route</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Routes</p><p className="text-3xl font-bold mt-1">{mockRoutes.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active</p><p className="text-3xl font-bold mt-1 text-green-500">{mockRoutes.filter(r => r.isActive).length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. Distance</p><p className="text-3xl font-bold mt-1 text-primary">{Math.round(mockRoutes.reduce((a, r) => a + Number(r.distanceKm), 0) / mockRoutes.length)} km</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>Manage origin-destination corridors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search routes…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Corridor</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      {route.origin} <ArrowRight className="w-3 h-3" /> {route.destination}
                    </span>
                  </TableCell>
                  <TableCell>{route.distanceKm} km</TableCell>
                  <TableCell>{formatDuration(route.durationMins)}</TableCell>
                  <TableCell><Badge variant={route.isActive ? 'default' : 'secondary'}>{route.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
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
