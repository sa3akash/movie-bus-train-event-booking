"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Film,
  Star,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Clapperboard,
  Clock,
  Award,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Analytics {
  totalMovies: number;
  nowShowing: number;
  comingSoon: number;
  totalReviews: number;
  avgRating: string;
  totalRevenue: string;
  topMovies: {
    id: string;
    title: string;
    posterUrl: string | null;
    totalBookings: number;
    revenue: string;
    averageRating: string | null;
  }[];
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm">
      <div
        className={`absolute inset-0 opacity-[0.06] ${gradient}`}
      />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center ${gradient} shadow-sm`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MovieAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/movie/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxRevenue =
    analytics?.topMovies
      ? Math.max(...analytics.topMovies.map((m) => parseFloat(m.revenue) || 0))
      : 1;

  const maxBookings =
    analytics?.topMovies
      ? Math.max(...analytics.topMovies.map((m) => m.totalBookings || 0))
      : 1;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Movie Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Performance overview of your movie catalog.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw
            className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-transparent border-t-violet-400 blur-sm animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium text-sm animate-pulse">
            Crunching the numbers...
          </span>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total Movies"
              value={analytics.totalMovies}
              icon={Film}
              gradient="bg-indigo-500"
              iconColor="text-white"
              subtitle="In catalog"
            />
            <StatCard
              title="Now Showing"
              value={analytics.nowShowing}
              icon={Clapperboard}
              gradient="bg-emerald-500"
              iconColor="text-white"
              subtitle="Currently playing"
            />
            <StatCard
              title="Coming Soon"
              value={analytics.comingSoon}
              icon={Clock}
              gradient="bg-blue-500"
              iconColor="text-white"
              subtitle="Upcoming releases"
            />
            <StatCard
              title="Total Reviews"
              value={analytics.totalReviews}
              icon={MessageSquare}
              gradient="bg-purple-500"
              iconColor="text-white"
              subtitle="User reviews"
            />
            <StatCard
              title="Avg Rating"
              value={`${parseFloat(analytics.avgRating).toFixed(1)}/5`}
              icon={Star}
              gradient="bg-amber-500"
              iconColor="text-white"
              subtitle="Across all reviews"
            />
            <StatCard
              title="Total Revenue"
              value={`৳${parseFloat(analytics.totalRevenue).toLocaleString()}`}
              icon={DollarSign}
              gradient="bg-rose-500"
              iconColor="text-white"
              subtitle="Confirmed bookings"
            />
          </div>

          {/* Top Movies */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Bookings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Top Movies by Bookings
                </CardTitle>
                <CardDescription>
                  Most booked movies across all shows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topMovies.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No booking data yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.topMovies.map((movie, idx) => (
                      <div key={movie.id} className="flex items-center gap-3">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                              : idx === 1
                              ? "bg-slate-100 text-slate-600 border-2 border-slate-300"
                              : idx === 2
                              ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {movie.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-10 w-7 object-cover rounded shadow-xs border border-muted shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-7 rounded border border-muted bg-muted flex items-center justify-center shrink-0">
                            <Film className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold truncate">
                              {movie.title}
                            </span>
                            <span className="text-sm font-bold text-indigo-600 shrink-0">
                              {movie.totalBookings} bookings
                            </span>
                          </div>
                          <RevenueBar
                            value={movie.totalBookings}
                            max={maxBookings}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Revenue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-amber-500" />
                  Top Movies by Revenue
                </CardTitle>
                <CardDescription>
                  Highest earning movies from confirmed bookings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topMovies.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No revenue data yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...analytics.topMovies]
                      .sort(
                        (a, b) =>
                          parseFloat(b.revenue) - parseFloat(a.revenue)
                      )
                      .map((movie, idx) => (
                        <div key={movie.id} className="flex items-center gap-3">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              idx === 0
                                ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                                : idx === 1
                                ? "bg-slate-100 text-slate-600 border-2 border-slate-300"
                                : idx === 2
                                ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="h-10 w-7 object-cover rounded shadow-xs border border-muted shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-7 rounded border border-muted bg-muted flex items-center justify-center shrink-0">
                              <Film className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-semibold truncate">
                                  {movie.title}
                                </span>
                                {movie.averageRating && (
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-muted-foreground">
                                      {parseFloat(movie.averageRating).toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold text-emerald-600 shrink-0">
                                ৳{parseFloat(movie.revenue).toLocaleString()}
                              </span>
                            </div>
                            <RevenueBar
                              value={parseFloat(movie.revenue)}
                              max={maxRevenue}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary callout */}
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/30">
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-6 items-center justify-center sm:justify-start">
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">
                    Catalog Health
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                      {analytics.nowShowing} Now Showing
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                      {analytics.comingSoon} Coming Soon
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground border hover:bg-muted">
                      {analytics.totalMovies -
                        analytics.nowShowing -
                        analytics.comingSoon}{" "}
                      Others
                    </Badge>
                  </div>
                </div>
                <div className="h-10 border-r border-indigo-200 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">
                    Avg Review Score
                  </p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 ${
                          s <= Math.round(parseFloat(analytics.avgRating))
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/20 fill-muted-foreground/10"
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-bold text-lg">
                      {parseFloat(analytics.avgRating).toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / 5 from {analytics.totalReviews} reviews
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Film className="h-12 w-12 text-muted-foreground/30" />
          <p>Could not load analytics. Try refreshing.</p>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      )}
    </div>
  );
}
