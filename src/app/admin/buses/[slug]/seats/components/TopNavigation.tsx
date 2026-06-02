'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutTemplate, Loader2, Save, RefreshCw } from 'lucide-react'
import { useSeatBuilder } from './SeatBuilderContext'

export function TopNavigation() {
  const { bus, syncing, load, handleSave } = useSeatBuilder()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/admin/buses">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-7 h-7 text-primary" /> Visual Seat Builder
          </h1>
          <p className="text-muted-foreground mt-0.5">Interactive map for {bus?.registrationNo || 'Bus'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={load} disabled={syncing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} /> Reset
        </Button>
        <Button onClick={handleSave} disabled={syncing} className="gap-2 bg-primary text-primary-foreground shadow-sm">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Layout
        </Button>
      </div>
    </div>
  )
}
