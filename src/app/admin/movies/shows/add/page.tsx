"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";

type ShowFormValues = {
  movieId: string;
  theaterId: string;
  screenId: string;
  availableSeats: number;
  shows: {
    startTime: string;
    endTime: string;
    basePrice: string;
  }[];
};

export default function AddShowPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShowFormValues>({
    defaultValues: {
      movieId: "",
      theaterId: "",
      screenId: "",
      availableSeats: 0,
      shows: [
        {
          startTime: "",
          endTime: "",
          basePrice: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shows",
  });

  const watchTheaterId = watch("theaterId");
  const watchScreenId = watch("screenId");

  useEffect(() => {
    // Fetch movies and theaters
    Promise.all([
      fetch("/api/movie").then((r) => r.json()),
      fetch("/api/cinema/admin-theaters?limit=100").then((r) => r.json()),
    ])
      .then(([moviesData, theatersData]) => {
        setMovies(moviesData || []);
        setTheaters(theatersData.items || []);
      })
      .catch((err) => {
        toast.error("Failed to load initial data");
      });
  }, []);

  useEffect(() => {
    if (watchTheaterId) {
      fetch(`/api/cinema/${watchTheaterId}/screens`)
        .then((r) => r.json())
        .then((data) => {
          setScreens(data || []);
          setValue("screenId", "");
          setValue("availableSeats", 0);
        })
        .catch(() => toast.error("Failed to load screens"));
    } else {
      setScreens([]);
    }
  }, [watchTheaterId, setValue]);

  useEffect(() => {
    if (watchScreenId) {
      const selectedScreen = screens.find((s) => s.id === watchScreenId);
      setValue("availableSeats", selectedScreen ? selectedScreen.totalSeats : 0);
    }
  }, [watchScreenId, screens, setValue]);

  const onSubmit = async (data: ShowFormValues) => {
    if (data.shows.length === 0) {
      toast.error("Please add at least one show time.");
      return;
    }

    setLoading(true);
    try {
      // Create shows in parallel
      const promises = data.shows.map((show) => 
        fetch("/api/movie/shows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId: data.movieId,
            screenId: data.screenId,
            startTime: new Date(show.startTime).toISOString(),
            endTime: new Date(show.endTime).toISOString(),
            basePrice: show.basePrice,
            availableSeats: Number(data.availableSeats),
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create show");
          }
          return res.json();
        })
      );

      await Promise.all(promises);

      toast.success(`${data.shows.length} show(s) created successfully`);
      router.push("/admin/movies/shows");
    } catch (error: any) {
      toast.error(error.message || "Failed to create shows");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule New Shows</h1>
          <p className="text-muted-foreground mt-1">Configure movie showtimes and pricing using an advanced builder.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shows Builder</CardTitle>
          <CardDescription>Select the movie and location, then add multiple timings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="movie">Select Movie</Label>
                <select
                  id="movie"
                  {...register("movieId", { required: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select a movie --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                {errors.movieId && <p className="text-xs text-red-500">Movie is required</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="theater">Select Theater</Label>
                <select
                  id="theater"
                  {...register("theaterId", { required: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select a theater --</option>
                  {theaters.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                  ))}
                </select>
                {errors.theaterId && <p className="text-xs text-red-500">Theater is required</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="screen">Select Screen / Hall</Label>
                <select
                  id="screen"
                  {...register("screenId", { required: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!watchTheaterId || screens.length === 0}
                >
                  <option value="">-- Select a screen --</option>
                  {screens.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.totalSeats} seats)</option>
                  ))}
                </select>
                {errors.screenId && <p className="text-xs text-red-500">Screen is required</p>}
              </div>

              <div className="space-y-2 md:col-span-2 hidden">
                <Input type="hidden" {...register("availableSeats")} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Show Timings</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ startTime: "", endTime: "", basePrice: "" })}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Show
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md border-dashed">
                  No show times added. Click 'Add Show' to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative items-end bg-card">
                      <div className="space-y-2 md:col-span-4">
                        <Label htmlFor={`shows.${index}.startTime`}>Start Time</Label>
                        <Input
                          id={`shows.${index}.startTime`}
                          type="datetime-local"
                          {...register(`shows.${index}.startTime` as const, { required: true })}
                        />
                        {errors.shows?.[index]?.startTime && (
                           <p className="text-xs text-red-500">Required</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-4">
                        <Label htmlFor={`shows.${index}.endTime`}>End Time</Label>
                        <Input
                          id={`shows.${index}.endTime`}
                          type="datetime-local"
                          {...register(`shows.${index}.endTime` as const, { required: true })}
                        />
                        {errors.shows?.[index]?.endTime && (
                           <p className="text-xs text-red-500">Required</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`shows.${index}.basePrice`}>Base Price (৳)</Label>
                        <Input
                          id={`shows.${index}.basePrice`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 500"
                          {...register(`shows.${index}.basePrice` as const, { required: true })}
                        />
                        {errors.shows?.[index]?.basePrice && (
                           <p className="text-xs text-red-500">Required</p>
                        )}
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="w-full md:w-10"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || fields.length === 0} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save {fields.length} Show{fields.length !== 1 && 's'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
