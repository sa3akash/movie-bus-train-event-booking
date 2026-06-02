'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { SeatBuilderProvider, useSeatBuilder } from './components/SeatBuilderContext'
import { TopNavigation } from './components/TopNavigation'
import { SmartTemplates } from './components/SmartTemplates'
import { SeatBuilderSidebar } from './components/SeatBuilderSidebar'
import { BusGridShell } from './components/BusGridShell'
import { Loader2 } from 'lucide-react'

function VisualSeatBuilderContent() {
  const { loading } = useSeatBuilder()

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
      <TopNavigation />
      <SmartTemplates />
      <div className="flex flex-col lg:flex-row gap-6">
        <SeatBuilderSidebar />
        <BusGridShell />
      </div>
    </div>
  )
}

export default function VisualSeatBuilderPage() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <SeatBuilderProvider slug={slug}>
      <VisualSeatBuilderContent />
    </SeatBuilderProvider>
  )
}
