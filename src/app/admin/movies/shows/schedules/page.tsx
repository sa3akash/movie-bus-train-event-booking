"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Film, Building, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Show {
  id: string;
  movieId: string;
  movieTitle: string;
  screenId: string;
  screenName: string;
  theaterName: string;
  startTime: string;
  endTime: string;
  basePrice: string;
  status: string;
  availableSeats: number;
}

export default function SchedulesPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    try {
      // Fetching a large number of shows to cover the schedule, ideally this would use server-side date filtering
      const res = await fetch("/api/movie/admin-shows?limit=500");
      if (!res.ok) throw new Error("Failed to fetch shows");
      const data = await res.json();
      setShows(data.items || []);
    } catch (err) {
      toast.error("Error loading schedules");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ONGOING": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED": return "bg-slate-100 text-slate-800 border-slate-300";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter shows by selected date
  const selectedDateShows = useMemo(() => {
    if (!date) return [];
    return shows.filter((show) => isSameDay(new Date(show.startTime), date));
  }, [shows, date]);

  // Group shows by Theater
  const groupedShows = useMemo(() => {
    const groups: Record<string, Show[]> = {};
    selectedDateShows.forEach((show) => {
      if (!groups[show.theaterName]) groups[show.theaterName] = [];
      groups[show.theaterName].push(show);
    });
    // Sort shows inside groups by time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });
    return groups;
  }, [selectedDateShows]);

  // Determine which dates have shows to mark them on the calendar
  // Since react-day-picker accepts 'modifiers', we can create a modifier for dates with shows
  const datesWithShows = useMemo(() => {
    return shows.map((show) => new Date(show.startTime));
  }, [shows]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Daily Schedules
        </h1>
        <p className="text-muted-foreground mt-1">
          View all movie showtimes structured by date and theater.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          <Card className="shadow-xs border-muted sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-0 pb-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md"
                modifiers={{
                  hasShows: datesWithShows
                }}
                modifiersStyles={{
                  hasShows: { fontWeight: "bold", textDecoration: "underline", color: "var(--indigo-600)" }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Shows for the selected date */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <Card className="shadow-xs border-muted bg-muted/10 min-h-[500px]">
            <CardHeader className="pb-4 border-b bg-background rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Schedule for {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateShows.length} show(s) scheduled for this date.
                  </CardDescription>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="text-muted-foreground font-medium text-sm animate-pulse">Loading schedules...</span>
                </div>
              ) : selectedDateShows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center h-full">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold">No shows scheduled</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    There are no movie shows scheduled for the selected date. Please choose another date from the calendar.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedShows).map(([theaterName, theaterShows]) => (
                    <div key={theaterName} className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Building className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-foreground">{theaterName}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {theaterShows.map((show) => (
                          <div key={show.id} className="bg-background rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                            
                            <div className="flex justify-between items-start mb-3 pl-2">
                              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold ${getStatusColor(show.status)}`}>
                                {show.status}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm font-bold text-foreground">
                                  {format(new Date(show.startTime), "hh:mm a")}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-medium">
                                  to {format(new Date(show.endTime), "hh:mm a")}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2.5 pl-2">
                              <div className="flex gap-2 items-start">
                                <Film className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                                <span className="font-semibold text-sm leading-tight line-clamp-2">{show.movieTitle}</span>
                              </div>
                              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span>{show.screenName}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t flex items-center justify-between pl-2">
                              <div className="text-xs">
                                <span className="font-semibold text-indigo-600">{show.availableSeats}</span>
                                <span className="text-muted-foreground"> seats left</span>
                              </div>
                              <div className="font-bold text-sm">
                                ৳{show.basePrice}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
