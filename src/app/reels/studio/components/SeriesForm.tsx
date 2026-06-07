import React, { useState } from "react";
import { DollarSign } from "lucide-react";

interface SeriesFormProps {
  onSuccess: (newSeries: any) => void;
  onCancel: () => void;
}

export function SeriesForm({ onSuccess, onCancel }: SeriesFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);

  // Advanced metadata
  const [director, setDirector] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");
  const [language, setLanguage] = useState("en");
  const [ageRating, setAgeRating] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title, description, genre, totalEpisodes, isPremium, defaultPricePerEpisode: defaultPrice,
        director: director || undefined,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        language,
        ageRating: ageRating || undefined
      };

      const res = await fetch("/api/reels/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.series);
      }
    } catch (e) {
      console.error("Failed to create series", e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800">
      <input type="text" placeholder="Series Title" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
      <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" rows={2} />
      
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Genre" value={genre} onChange={e=>setGenre(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
        <input type="number" placeholder="Total Eps" value={totalEpisodes || ''} onChange={e=>setTotalEpisodes(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Director" value={director} onChange={e=>setDirector(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
        <input type="number" placeholder="Release Year" value={releaseYear} onChange={e=>setReleaseYear(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700">
           <option value="en">English</option>
           <option value="es">Spanish</option>
           <option value="ko">Korean</option>
           <option value="zh">Mandarin</option>
           <option value="hi">Hindi</option>
        </select>
        <select value={ageRating} onChange={e=>setAgeRating(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700">
           <option value="">Age Rating (None)</option>
           <option value="G">G</option>
           <option value="PG">PG</option>
           <option value="PG-13">PG-13</option>
           <option value="R">R</option>
           <option value="TV-MA">TV-MA</option>
        </select>
      </div>

      <div className="flex items-center justify-between px-3 py-2 rounded-lg border bg-white dark:bg-neutral-800 dark:border-neutral-700">
        <label className="text-sm font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500"/> Premium?</label>
        <input type="checkbox" checked={isPremium} onChange={e=>setIsPremium(e.target.checked)} className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
      </div>
      {isPremium && (
         <input type="number" placeholder="Coins per Ep" value={defaultPrice || ''} onChange={e=>setDefaultPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700" />
      )}
      
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="w-full py-2 bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition">Cancel</button>
        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">Create</button>
      </div>
    </form>
  );
}
