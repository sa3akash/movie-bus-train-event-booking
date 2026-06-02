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
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, MapPin, ChevronRight } from 'lucide-react'

const mockCounters = [
  { id: '1', name: 'Dhaka Kalyanpur Counter', slug: 'dhaka-kalyanpur', location: 'Dhaka', brand: 'Green Line', address: 'House 12, Kalyanpur, Dhaka', phone: '01711-000001', isActive: true },
  { id: '2', name: 'Chittagong Oxygen Counter', slug: 'ctg-oxygen', location: 'Chittagong', brand: 'Hanif Enterprise', address: 'Oxygen Mor, Chittagong', phone: '01811-000002', isActive: true },
  { id: '3', name: 'Sylhet Amborkhana Counter', slug: 'sylhet-amborkhana', location: 'Sylhet', brand: 'Shyamoli', address: 'Amborkhana, Sylhet', phone: '01911-000003', isActive: false },
  { id: '4', name: 'Rajshahi Station Counter', slug: 'rajshahi-station', location: 'Rajshahi', brand: 'Ena Transport', address: 'Railway Station, Rajshahi', phone: '01611-000004', isActive: true },
]

const mockLocations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna']
const mockBrands   = ['Green Line', 'Hanif Enterprise', 'Shyamoli', 'Ena Transport']

export default function CountersPage() {
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', locationId: '', brandId: '', address: '', contactPhone: '' })

  const filtered = mockCounters.filter((c) => {
    const matchSearch   = c.name.toLowerCase().includes(search.toLowerCase())
    const matchLocation = locationFilter === 'ALL' || c.location === locationFilter
    return matchSearch && matchLocation
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" /> Counters
          </h1>
          <p className="text-muted-foreground mt-1">Manage ticket sales counters across cities</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Counter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Counter</DialogTitle>
              <DialogDescription>Add a new ticket sales counter</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Counter Name *</Label>
                <Input placeholder="e.g. Dhaka Kalyanpur Counter" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>{mockLocations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>{mockBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea placeholder="Full address…" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input placeholder="+880…" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Counter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Counters</p><p className="text-3xl font-bold mt-1">{mockCounters.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active Counters</p><p className="text-3xl font-bold mt-1 text-green-500">{mockCounters.filter(c => c.isActive).length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Cities Covered</p><p className="text-3xl font-bold mt-1 text-primary">{new Set(mockCounters.map(c => c.location)).size}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Counters</CardTitle>
          <CardDescription>Bus ticket selling points across all cities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search counters…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                {mockLocations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counter Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{c.location}</TableCell>
                  <TableCell>{c.brand}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{c.phone}</TableCell>
                  <TableCell><Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
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
