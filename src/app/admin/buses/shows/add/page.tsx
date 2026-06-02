'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Clock } from 'lucide-react'
import Link from 'next/link'

const mockRoutes = ['Dhaka → Chittagong', 'Dhaka → Sylhet', 'Dhaka → Rajshahi', 'Chittagong → Dhaka']
const mockBuses  = ['Green Line Express (DHA-2201)', 'Shyamoli Deluxe (CTG-1145)', 'Hanif Coach 7 (DHA-3302)', 'Ena Transport (SYL-0891)']

export default function AddTripPage() {
  const router = useRouter()
  const [form, setForm] = useState({ routeId: '', busId: '', departureTime: '', arrivalTime: '', basePrice: '' })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/buses/shows">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" /> Add Trip
          </h1>
          <p className="text-muted-foreground mt-0.5">Schedule a new bus trip instance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Assign a bus to a route and set the schedule</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/buses/shows"><Button variant="outline">Cancel</Button></Link>
        <Button className="gap-2" onClick={() => router.push('/admin/buses/shows')}>
          <Save className="w-4 h-4" /> Schedule Trip
        </Button>
      </div>
    </div>
  )
}
