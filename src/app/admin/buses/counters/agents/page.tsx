'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, UserCheck } from 'lucide-react'

const mockAgents = [
  { id: '1', name: 'Rahim Miah',   email: 'rahim@greenline.com',   counter: 'Dhaka Kalyanpur', city: 'Dhaka',      sales: 342, isActive: true  },
  { id: '2', name: 'Karim Uddin',  email: 'karim@hanif.com',       counter: 'Chittagong Oxygen', city: 'Chittagong', sales: 218, isActive: true  },
  { id: '3', name: 'Nasrin Akter', email: 'nasrin@shyamoli.com',   counter: 'Sylhet Amborkhana', city: 'Sylhet',     sales: 187, isActive: false },
  { id: '4', name: 'Sumon Das',    email: 'sumon@ena.com',         counter: 'Rajshahi Station',  city: 'Rajshahi',   sales: 95,  isActive: true  },
]

const mockCounters = ['Dhaka Kalyanpur', 'Chittagong Oxygen', 'Sylhet Amborkhana', 'Rajshahi Station']

export default function AgentsPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', counterId: '', phone: '' })

  const filtered = mockAgents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" /> Counter Agents
          </h1>
          <p className="text-muted-foreground mt-1">Manage ticket sales agents assigned to counters</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Agent</DialogTitle>
              <DialogDescription>Assign a new agent to a counter</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="e.g. Rahim Miah" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="agent@company.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+8801XXXXXXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Counter *</Label>
                <Select onValueChange={(v) => setForm((f) => ({ ...f, counterId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Assign to counter" /></SelectTrigger>
                  <SelectContent>{mockCounters.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Add Agent</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Agents</p><p className="text-3xl font-bold mt-1">{mockAgents.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active Agents</p><p className="text-3xl font-bold mt-1 text-green-500">{mockAgents.filter(a => a.isActive).length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-3xl font-bold mt-1 text-primary">{mockAgents.reduce((s, a) => s + a.sales, 0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>Agents assigned to ticket sales counters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search agents…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Tickets Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{initials(agent.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.counter}</TableCell>
                  <TableCell>{agent.city}</TableCell>
                  <TableCell className="font-medium">{agent.sales}</TableCell>
                  <TableCell><Badge variant={agent.isActive ? 'default' : 'secondary'}>{agent.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Pencil className="w-4 h-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Remove</DropdownMenuItem>
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
