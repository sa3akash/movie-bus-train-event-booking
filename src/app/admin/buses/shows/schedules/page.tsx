'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const months = ['June 2026']

const schedule = [
  { time: '06:00', route: 'Dhaka → Chittagong', bus: 'DHA-2201', mon: true,  tue: true,  wed: true,  thu: true,  fri: true,  sat: false, sun: false },
  { time: '08:00', route: 'Dhaka → Sylhet',     bus: 'CTG-1145', mon: true,  tue: false, wed: true,  thu: false, fri: true,  sat: true,  sun: true  },
  { time: '10:00', route: 'Dhaka → Rajshahi',   bus: 'DHA-3302', mon: false, tue: true,  wed: false, thu: true,  fri: false, sat: true,  sun: false },
  { time: '14:00', route: 'Chittagong → Dhaka', bus: 'SYL-0891', mon: true,  tue: true,  wed: true,  thu: true,  fri: true,  sat: true,  sun: true  },
  { time: '22:00', route: 'Dhaka → Rajshahi',   bus: 'DHA-4401', mon: true,  tue: true,  wed: false, thu: false, fri: true,  sat: false, sun: false },
]

export default function SchedulesPage() {
  const [month] = useState(0)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" /> Weekly Schedules
          </h1>
          <p className="text-muted-foreground mt-1">Recurring departure schedule view per route</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-medium px-2">{months[month]}</span>
          <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Matrix</CardTitle>
          <CardDescription>Weekly recurring departures across all routes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Bus</TableHead>
                {days.map((d) => <TableHead key={d} className="text-center">{d}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono font-medium">{row.time}</TableCell>
                  <TableCell>{row.route}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{row.bus}</TableCell>
                  {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((d) => (
                    <TableCell key={d} className="text-center">
                      {row[d]
                        ? <Badge variant="default" className="text-xs px-1.5">✓</Badge>
                        : <span className="text-muted-foreground/40">–</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
