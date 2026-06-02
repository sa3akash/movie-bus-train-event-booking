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
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const mockTrips = [
  { id: '1', route: 'Dhaka → Chittagong', bus: 'Green Line Express (DHA-2201)', departure: '2026-06-03 08:00', arrival: '2026-06-03 14:00', basePrice: '750', status: 'SCHEDULED', seats: 42 },
  { id: '2', route: 'Dhaka → Sylhet',     bus: 'Shyamoli Deluxe (CTG-1145)',   departure: '2026-06-03 10:00', arrival: '2026-06-03 16:30', basePrice: '650', status: 'ON_TIME',   seats: 36 },
  { id: '3', route: 'Chittagong → Dhaka', bus: 'Hanif Coach 7 (DHA-3302)',     departure: '2026-06-03 06:00', arrival: '2026-06-03 12:00', basePrice: '700', status: 'DELAYED',   seats: 48 },
  { id: '4', route: 'Dhaka → Rajshahi',   bus: 'Ena Transport (SYL-0891)',     departure: '2026-06-03 22:00', arrival: '2026-06-04 04:00', basePrice: '600', status: 'SCHEDULED', seats: 40 },
  { id: '5', route: 'Sylhet → Dhaka',     bus: 'S.Alam Luxury (DHA-4401)',     departure: '2026-06-03 09:00', arrival: '2026-06-03 15:30', basePrice: '800', status: 'CANCELLED', seats: 44 },
]

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  SCHEDULED: { variant: 'outline',      label: 'Scheduled' },
  ON_TIME:   { variant: 'default',      label: 'On Time'   },
  DELAYED:   { variant: 'secondary',    label: 'Delayed'   },
  CANCELLED: { variant: 'destructive',  label: 'Cancelled' },
  COMPLETED: { variant: 'default',      label: 'Completed' },
}

const mockRoutes = ['Dhaka → Chittagong', 'Dhaka → Sylhet', 'Dhaka → Rajshahi', 'Chittagong → Dhaka']
const mockBuses  = ['Green Line Express', 'Shyamoli Deluxe', 'Hanif Coach 7', 'Ena Transport']

export default function TripsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ routeId: '', busId: '', departureTime: '', arrivalTime: '', basePrice: '' })

  const filtered = mockTrips.filter((t) => {
    const matchSearch = t.route.toLowerCase().includes(search.toLowerCase()) || t.bus.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" /> Trips & Schedules
          </h1>
          <p className="text-muted-foreground mt-1">Manage bus trip instances and schedules</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/buses/shows/routes">
            <Button variant="outline" className="gap-2"><ArrowRight className="w-4 h-4" /> Manage Routes</Button>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Trip</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Trip</DialogTitle>
                <DialogDescription>Schedule a new bus trip</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Route *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, routeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                    <SelectContent>{mockRoutes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bus *</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, busId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                    <SelectContent>{mockBuses.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Departure Time *</Label>
                    <Input type="datetime-local" value={form.departureTime} onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Arrival Time *</Label>
                    <Input type="datetime-local" value={form.arrivalTime} onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Base Price (BDT) *</Label>
                  <Input type="number" placeholder="700" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setOpen(false)}>Save Trip</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Trips',  value: mockTrips.length,                                  color: '' },
          { label: 'Scheduled',    value: mockTrips.filter(t => t.status === 'SCHEDULED').length, color: 'text-blue-500' },
          { label: 'On Time',      value: mockTrips.filter(t => t.status === 'ON_TIME').length,   color: 'text-green-500' },
          { label: 'Cancelled',    value: mockTrips.filter(t => t.status === 'CANCELLED').length, color: 'text-destructive' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
          <CardDescription>Live and upcoming bus trip schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search trips…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ON_TIME">On Time</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((trip) => {
                const st = statusConfig[trip.status]
                return (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.route}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{trip.bus}</TableCell>
                    <TableCell className="font-mono text-sm">{trip.departure}</TableCell>
                    <TableCell className="font-mono text-sm">{trip.arrival}</TableCell>
                    <TableCell>৳{trip.basePrice}</TableCell>
                    <TableCell>{trip.seats}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
