'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Pencil, Trash2, MoreHorizontal, DollarSign } from 'lucide-react'

const mockPricing = [
  { id: '1', route: 'Dhaka → Chittagong', seatType: 'AC Sleeper', basePrice: '750', multiplier: '1.20', effectivePrice: '900' },
  { id: '2', route: 'Dhaka → Chittagong', seatType: 'AC Seater',  basePrice: '750', multiplier: '1.00', effectivePrice: '750' },
  { id: '3', route: 'Dhaka → Sylhet',     seatType: 'AC Sleeper', basePrice: '650', multiplier: '1.20', effectivePrice: '780' },
  { id: '4', route: 'Dhaka → Rajshahi',   seatType: 'Non-AC',     basePrice: '600', multiplier: '0.85', effectivePrice: '510' },
]

const mockRoutes    = ['Dhaka → Chittagong', 'Dhaka → Sylhet', 'Dhaka → Rajshahi']
const mockSeatTypes = ['AC Sleeper', 'AC Seater', 'Non-AC Seater']

export default function PricingPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ routeId: '', seatTypeId: '', basePrice: '', multiplier: '1.00' })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-primary" /> Pricing Rules
          </h1>
          <p className="text-muted-foreground mt-1">Set price multipliers by route and seat type</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Pricing Rule</DialogTitle>
              <DialogDescription>Configure price multiplier for a route + seat type combination</DialogDescription>
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
                <Label>Seat Type *</Label>
                <Select onValueChange={(v) => setForm((f) => ({ ...f, seatTypeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select seat type" /></SelectTrigger>
                  <SelectContent>{mockSeatTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Base Price (BDT)</Label>
                  <Input type="number" placeholder="700" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Price Multiplier</Label>
                  <Input type="number" step="0.05" placeholder="1.00" value={form.multiplier} onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value }))} />
                </div>
              </div>
              {form.basePrice && form.multiplier && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  Effective Price: <strong>৳{Math.round(Number(form.basePrice) * Number(form.multiplier))}</strong>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>Price multipliers per route and seat class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Seat Type</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Effective Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPricing.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.route}</TableCell>
                  <TableCell><Badge variant="outline">{p.seatType}</Badge></TableCell>
                  <TableCell>৳{p.basePrice}</TableCell>
                  <TableCell>
                    <Badge variant={Number(p.multiplier) > 1 ? 'default' : Number(p.multiplier) < 1 ? 'secondary' : 'outline'}>
                      ×{p.multiplier}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">৳{p.effectivePrice}</TableCell>
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
