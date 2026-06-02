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
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, Globe } from 'lucide-react'

const mockLocations = [
  { id: '1', name: 'Dhaka',      slug: 'dhaka',      type: 'CITY',           parent: null,    counters: 8,  isActive: true  },
  { id: '2', name: 'Chittagong', slug: 'chittagong', type: 'CITY',           parent: null,    counters: 5,  isActive: true  },
  { id: '3', name: 'Sylhet',     slug: 'sylhet',     type: 'CITY',           parent: null,    counters: 3,  isActive: true  },
  { id: '4', name: 'Kalyanpur',  slug: 'kalyanpur',  type: 'BOARDING_POINT', parent: 'Dhaka', counters: 2,  isActive: true  },
  { id: '5', name: 'Oxygen Mor', slug: 'oxygen-mor', type: 'BOARDING_POINT', parent: 'Chittagong', counters: 1, isActive: false },
]

export default function CounterLocationsPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', type: 'CITY', parentLocationId: '', latitude: '', longitude: '' })

  const filtered = mockLocations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary" /> Locations
          </h1>
          <p className="text-muted-foreground mt-1">Cities and boarding points for counter placement</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Location</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Location</DialogTitle>
              <DialogDescription>Add a city or boarding point</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input placeholder="e.g. Dhaka" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CITY">City</SelectItem>
                    <SelectItem value="BOARDING_POINT">Boarding Point</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === 'BOARDING_POINT' && (
                <div className="space-y-2">
                  <Label>Parent City</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, parentLocationId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select parent city" /></SelectTrigger>
                    <SelectContent>
                      {mockLocations.filter(l => l.type === 'CITY').map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" placeholder="23.8103" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" placeholder="90.4125" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Locations</p><p className="text-3xl font-bold mt-1">{mockLocations.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Cities</p><p className="text-3xl font-bold mt-1 text-primary">{mockLocations.filter(l => l.type === 'CITY').length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Boarding Points</p><p className="text-3xl font-bold mt-1 text-blue-500">{mockLocations.filter(l => l.type === 'BOARDING_POINT').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>Cities and boarding points for counter placement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search locations…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Counters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell><Badge variant={loc.type === 'CITY' ? 'default' : 'outline'}>{loc.type === 'CITY' ? 'City' : 'Boarding Point'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{loc.parent ?? '—'}</TableCell>
                  <TableCell>{loc.counters}</TableCell>
                  <TableCell><Badge variant={loc.isActive ? 'default' : 'secondary'}>{loc.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
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
