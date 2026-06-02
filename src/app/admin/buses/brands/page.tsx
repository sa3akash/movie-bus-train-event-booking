'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, Building2 } from 'lucide-react'

const mockBrands = [
  { id: '1', name: 'Green Line',       slug: 'green-line',       buses: 24, isActive: true },
  { id: '2', name: 'Shyamoli',         slug: 'shyamoli',         buses: 18, isActive: true },
  { id: '3', name: 'Hanif Enterprise', slug: 'hanif-enterprise', buses: 31, isActive: true },
  { id: '4', name: 'Ena Transport',    slug: 'ena-transport',    buses: 12, isActive: false },
  { id: '5', name: 'S.Alam',          slug: 's-alam',           buses: 15, isActive: true },
]

export default function BrandsPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', logoUrl: '' })

  const filtered = mockBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Bus Brands
          </h1>
          <p className="text-muted-foreground mt-1">Manage bus operators and brands</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>Create a new bus operator / brand</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Green Line" value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input placeholder="auto-generated" value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description…" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input placeholder="https://…" value={form.logoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Brand</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Brands</p><p className="text-3xl font-bold mt-1">{mockBrands.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active Brands</p><p className="text-3xl font-bold mt-1 text-green-500">{mockBrands.filter(b => b.isActive).length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Fleet</p><p className="text-3xl font-bold mt-1 text-primary">{mockBrands.reduce((a, b) => a + b.buses, 0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>Operators whose buses run on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Buses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{brand.slug}</TableCell>
                  <TableCell>{brand.buses}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
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
