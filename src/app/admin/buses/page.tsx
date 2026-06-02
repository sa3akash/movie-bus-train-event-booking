'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  PlusCircle, Search, MoreHorizontal, Eye, Pencil, Trash2,
  BusFront, Activity, Wrench, Archive,
} from 'lucide-react'

const mockBuses = [
  { id: '1', registrationNo: 'DHA-2201', name: 'Green Line Express', brand: 'Green Line', type: 'AC Sleeper', model: 'Volvo B11R', year: 2022, status: 'ACTIVE', seats: 42 },
  { id: '2', registrationNo: 'CTG-1145', name: 'Shyamoli Deluxe', brand: 'Shyamoli', type: 'AC Seater', model: 'Hino AK', year: 2021, status: 'ACTIVE', seats: 36 },
  { id: '3', registrationNo: 'DHA-3302', name: 'Hanif Coach 7', brand: 'Hanif Enterprise', type: 'Non-AC Seater', model: 'Ashok Leyland', year: 2019, status: 'MAINTENANCE', seats: 48 },
  { id: '4', registrationNo: 'SYL-0891', name: 'Ena Transport', brand: 'Ena', type: 'AC Sleeper', model: 'Scania K410', year: 2023, status: 'ACTIVE', seats: 40 },
  { id: '5', registrationNo: 'DHA-4401', name: 'S.Alam Luxury', brand: 'S.Alam', type: 'AC Sleeper', model: 'King Long', year: 2020, status: 'RETIRED', seats: 44 },
]

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  ACTIVE:      { label: 'Active',      variant: 'default',     icon: <Activity className="w-3 h-3" /> },
  MAINTENANCE: { label: 'Maintenance', variant: 'secondary',   icon: <Wrench   className="w-3 h-3" /> },
  RETIRED:     { label: 'Retired',     variant: 'destructive', icon: <Archive  className="w-3 h-3" /> },
}

export default function BusListPage() {
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = mockBuses.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.registrationNo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BusFront className="w-8 h-8 text-primary" /> Bus Fleet
          </h1>
          <p className="text-muted-foreground mt-1">Manage all buses in your fleet</p>
        </div>
        <Link href="/admin/buses/add">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Add Bus
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Buses',  value: mockBuses.length,                                      color: 'text-primary' },
          { label: 'Active',       value: mockBuses.filter(b => b.status === 'ACTIVE').length,       color: 'text-green-500' },
          { label: 'In Maintenance', value: mockBuses.filter(b => b.status === 'MAINTENANCE').length, color: 'text-yellow-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Buses</CardTitle>
          <CardDescription>View and manage the entire fleet</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or reg. no…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model / Year</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bus) => {
                const st = statusConfig[bus.status]
                return (
                  <TableRow key={bus.id}>
                    <TableCell className="font-mono font-medium">{bus.registrationNo}</TableCell>
                    <TableCell className="font-medium">{bus.name}</TableCell>
                    <TableCell>{bus.brand}</TableCell>
                    <TableCell>{bus.type}</TableCell>
                    <TableCell className="text-muted-foreground">{bus.model} · {bus.year}</TableCell>
                    <TableCell>{bus.seats}</TableCell>
                    <TableCell>
                      <Badge variant={st.variant} className="gap-1">
                        {st.icon} {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> View</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Pencil className="w-4 h-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    No buses match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
