'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { useSeatBuilder } from './SeatBuilderContext'

export function SmartTemplates() {
  const { applyTemplate } = useSeatBuilder()

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
           <Zap className="w-4 h-4 text-amber-500" /> Smart Templates:
         </div>
         <div className="flex flex-wrap items-center gap-2">
           <Button variant="secondary" size="sm" onClick={() => applyTemplate('2x2')}>2x2 Standard</Button>
           <Button variant="secondary" size="sm" onClick={() => applyTemplate('2x1')}>2x1 Executive</Button>
           <Button variant="secondary" size="sm" onClick={() => applyTemplate('1x1')}>1x1 VIP</Button>
           <Button variant="secondary" size="sm" onClick={() => applyTemplate('sleeper2x1')}>2x1 Sleeper</Button>
         </div>
      </CardContent>
    </Card>
  )
}
