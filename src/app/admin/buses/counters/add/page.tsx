'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, MapPin } from 'lucide-react'
import Link from 'next/link'

const mockLocations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna']
const mockBrands    = ['Green Line', 'Hanif Enterprise', 'Shyamoli', 'Ena Transport']

export default function AddCounterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', locationId: '', brandId: '', address: '', contactPhone: '' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/buses/counters">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" /> Add Counter
          </h1>
          <p className="text-muted-foreground mt-0.5">Add a new bus ticket sales counter</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Counter Details</CardTitle>
          <CardDescription>Define the counter name, location, and contact info</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Counter Name *</Label>
              <Input placeholder="e.g. Dhaka Kalyanpur Counter" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={set('slug')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location / City *</Label>
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
            <Label>Full Address</Label>
            <Textarea placeholder="House no, street, area, city…" value={form.address} onChange={set('address')} />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input placeholder="+8801XXXXXXXXX" value={form.contactPhone} onChange={set('contactPhone')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/buses/counters"><Button variant="outline">Cancel</Button></Link>
        <Button className="gap-2" onClick={() => router.push('/admin/buses/counters')}>
          <Save className="w-4 h-4" /> Save Counter
        </Button>
      </div>
    </div>
  )
}
