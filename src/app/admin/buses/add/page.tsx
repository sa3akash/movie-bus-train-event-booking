'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, BusFront, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AddBusPage() {
  const router = useRouter()
  
  const [brands, setBrands] = useState<{id: string, name: string}[]>([])
  const [types, setTypes] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    registrationNo: '',
    name: '',
    slug: '',
    brandId: '',
    typeId: '',
    model: '',
    year: '',
    description: '',
    features: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/bus/brands?limit=100').then(r => r.json()),
      fetch('/api/bus/types?limit=100').then(r => r.json())
    ]).then(([brandsData, typesData]) => {
      setBrands(brandsData.items || [])
      setTypes(typesData.items || [])
    }).catch(err => {
      toast.error('Failed to load initial data')
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async () => {
    if (!form.registrationNo || !form.name || !form.slug || !form.brandId || !form.typeId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bus/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNo: form.registrationNo,
          name: form.name,
          slug: form.slug,
          brandId: form.brandId,
          typeId: form.typeId,
          model: form.model || undefined,
          year: form.year ? Number(form.year) : undefined,
          description: form.description || undefined,
          features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create bus')
      }

      toast.success('Bus created and seats generated dynamically!')
      router.push('/admin/buses')
    } catch (err: any) {
      toast.error(err.message || 'Error saving bus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/buses">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BusFront className="w-7 h-7 text-primary" /> Add New Bus
          </h1>
          <p className="text-muted-foreground mt-0.5">Register a new bus to the fleet and generate its seating layout.</p>
        </div>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Bus Identity</CardTitle>
          <CardDescription>Basic information about the bus</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg">Registration Number *</Label>
            <Input id="reg" placeholder="e.g. DHA-2201" value={form.registrationNo} onChange={set('registrationNo')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Bus Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Green Line Express"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" placeholder="auto-generated" value={form.slug} onChange={set('slug')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Type & Brand */}
      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <CardDescription>Assign brand and bus type blueprint to auto-generate physical seats.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand *</Label>
            <Select value={form.brandId} onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bus Type *</Label>
            <Select value={form.typeId} onValueChange={(v) => setForm((f) => ({ ...f, typeId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="e.g. Volvo B11R" value={form.model} onChange={set('model')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" placeholder="e.g. 2023" value={form.year} onChange={set('year')} />
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Short description of this bus…" value={form.description} onChange={set('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma separated)</Label>
            <Input id="features" placeholder="WiFi, USB Charging, Blanket, Water Bottle" value={form.features} onChange={set('features')} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/admin/buses">
          <Button variant="outline" disabled={loading}>Cancel</Button>
        </Link>
        <Button className="gap-2" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> Save Bus
        </Button>
      </div>
    </div>
  )
}
