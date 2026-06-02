'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BusFront, TrendingUp, Users, Ticket, DollarSign,
  ArrowUpRight, ArrowDownRight, Route, MapPin, Clock,
} from 'lucide-react'

const stats = [
  { label: 'Total Buses',     value: '100',    change: '+5',   up: true,  icon: BusFront },
  { label: 'Active Trips',    value: '38',     change: '+12%', up: true,  icon: Clock },
  { label: 'Tickets Sold',    value: '4,821',  change: '+8%',  up: true,  icon: Ticket },
  { label: 'Revenue (BDT)',   value: '৳3.4M',  change: '-2%',  up: false, icon: DollarSign },
]

const topRoutes = [
  { route: 'Dhaka → Chittagong', trips: 142, revenue: '১,০৬,৫০০' },
  { route: 'Dhaka → Sylhet',     trips: 98,  revenue: '৬৩,৭০০'  },
  { route: 'Dhaka → Rajshahi',   trips: 76,  revenue: '৪৫,৬০০'  },
  { route: 'Chittagong → Dhaka', trips: 131, revenue: '৯৮,২৫০'  },
]

const recentBookings = [
  { pnr: 'BUS-20260001', route: 'Dhaka → Chittagong', seats: 2, amount: '৳1,500', status: 'CONFIRMED' },
  { pnr: 'BUS-20260002', route: 'Dhaka → Sylhet',     seats: 1, amount: '৳650',   status: 'CONFIRMED' },
  { pnr: 'BUS-20260003', route: 'Chittagong → Dhaka', seats: 3, amount: '৳2,100', status: 'CANCELLED' },
  { pnr: 'BUS-20260004', route: 'Dhaka → Rajshahi',   seats: 2, amount: '৳1,200', status: 'PENDING'   },
]

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  PENDING:   'outline',
}

export default function BusAnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" /> Bus Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Performance overview of the entire bus operations</p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
              <p className={`text-sm mt-1 flex items-center gap-1 ${s.up ? 'text-green-500' : 'text-destructive'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change} this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="w-4 h-4" /> Top Routes</CardTitle>
            <CardDescription>Best performing routes by trip count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRoutes.map((r, i) => (
                <div key={r.route} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{r.route}</p>
                      <p className="text-xs text-muted-foreground">{r.trips} trips</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">৳{r.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BusFront className="w-4 h-4" /> Fleet Status</CardTitle>
            <CardDescription>Current operational status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Active',      count: 78, percent: 78, color: 'bg-green-500' },
                { label: 'Maintenance', count: 15, percent: 15, color: 'bg-yellow-500' },
                { label: 'Retired',     count: 7,  percent: 7,  color: 'bg-red-400'   },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.count} buses ({item.percent}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Recent Bookings</CardTitle>
          <CardDescription>Latest bus ticket reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.pnr} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-medium">{b.pnr}</p>
                    <p className="text-xs text-muted-foreground">{b.route} · {b.seats} seat{b.seats > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{b.amount}</span>
                  <Badge variant={statusColors[b.status]}>{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
