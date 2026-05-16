"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, Ticket, Users, Activity, ArrowUpRight, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Static Mock Data ---

const overviewCards = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    trend: "+20.1%",
    isPositive: true,
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    data: [40, 30, 45, 50, 45, 60, 70],
  },
  {
    title: "Tickets Sold",
    value: "2,350",
    trend: "+15.0%",
    isPositive: true,
    icon: Ticket,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    data: [10, 20, 15, 25, 20, 30, 35],
  },
  {
    title: "Active Events",
    value: "142",
    trend: "+5.2%",
    isPositive: true,
    icon: Activity,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    data: [5, 5, 8, 8, 10, 12, 12],
  },
  {
    title: "Active Users",
    value: "573",
    trend: "-1.1%",
    isPositive: false,
    icon: Users,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    data: [100, 90, 95, 85, 80, 75, 70],
  },
];

const revenueData = [
  { date: "Jan", revenue: 4000 },
  { date: "Feb", revenue: 3000 },
  { date: "Mar", revenue: 2000 },
  { date: "Apr", revenue: 2780 },
  { date: "May", revenue: 1890 },
  { date: "Jun", revenue: 2390 },
  { date: "Jul", revenue: 3490 },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const categoryData = [
  { name: "Movies", value: 1200, color: "hsl(var(--chart-1))" },
  { name: "Concerts", value: 800, color: "hsl(var(--chart-2))" },
  { name: "Buses", value: 400, color: "hsl(var(--chart-3))" },
  { name: "Trains", value: 250, color: "hsl(var(--chart-4))" },
];

const categoryChartConfig = {
  value: {
    label: "Sales",
  },
  Movies: { color: "hsl(var(--chart-1))" },
  Concerts: { color: "hsl(var(--chart-2))" },
  Buses: { color: "hsl(var(--chart-3))" },
  Trains: { color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const recentSales = [
  {
    id: "TRX-10000",
    name: "Alice Smith",
    email: "alice@example.com",
    avatar: "https://i.pravatar.cc/150?u=100",
    amount: "+$30.00",
  },
  {
    id: "TRX-10001",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://i.pravatar.cc/150?u=101",
    amount: "+$250.00",
  },
  {
    id: "TRX-10002",
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatar: "https://i.pravatar.cc/150?u=102",
    amount: "+$45.00",
  },
  {
    id: "TRX-10003",
    name: "Diana Prince",
    email: "diana@example.com",
    avatar: "https://i.pravatar.cc/150?u=103",
    amount: "+$120.00",
  },
  {
    id: "TRX-10004",
    name: "Ethan Hunt",
    email: "ethan@example.com",
    avatar: "https://i.pravatar.cc/150?u=104",
    amount: "+$15.00",
  },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90">
              Welcome back, Admin 👋
            </h1>
            <p className="mt-2 text-indigo-100 max-w-xl text-sm leading-relaxed">
              Your platform is performing exceptionally well today. Revenue is up
              by 20% compared to last week. Keep up the great work!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
              <Plus className="mr-2 h-4 w-4" /> New Event
            </Button>
          </div>
        </div>
        {/* Abstract shapes for background decoration */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, i) => (
          <Card key={i} className="group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={"flex h-12 w-12 items-center justify-center rounded-xl " + card.bg}>
                  <card.icon className={"h-6 w-6 " + card.color} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <ArrowUpRight className={"h-4 w-4 " + (card.isPositive ? 'text-emerald-500' : 'text-rose-500 rotate-180')} />
                  <span className={card.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
                    {card.trend}
                  </span>
                </div>
                {/* Mini Sparkline */}
                <div className="h-8 w-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={card.data.map((v) => ({ value: v }))}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={card.isPositive ? "#10b981" : "#f43f5e"}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </Card>
        ))}
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
 
        <Card className="lg:col-span-4 shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue performance</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[320px] w-full">
              <AreaChart data={revenueData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tickFormatter={(value) => "$" + value} />
                <ChartTooltip content={<ChartTooltipContent className="backdrop-blur-xl bg-background/80 shadow-2xl border-muted" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  fill="url(#colorRevenuePremium)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Donut Chart */}
        <Card className="lg:col-span-3 shadow-sm border-muted">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of ticket types</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={categoryChartConfig} className="h-[320px] w-full pb-0">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel className="backdrop-blur-xl bg-background/80 shadow-2xl border-muted" />} />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales List */}
      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            You made 265 sales this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={sale.avatar} alt={sale.name} />
                    <AvatarFallback>{sale.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.email}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {sale.amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

