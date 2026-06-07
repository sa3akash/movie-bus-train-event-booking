import React from "react";
import { Lock } from "lucide-react";

interface SeriesListProps {
  seriesList: any[];
  selectedSeriesId: string | null;
  onSelectSeries: (id: string) => void;
  isCreating: boolean;
}

export function SeriesList({ seriesList, selectedSeriesId, onSelectSeries, isCreating }: SeriesListProps) {
  if (seriesList.length === 0 && !isCreating) {
    return <p className="text-sm text-neutral-400 italic">No series yet.</p>;
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {seriesList.map((s) => (
        <div 
          key={s.id} 
          onClick={() => onSelectSeries(s.id)}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedSeriesId === s.id 
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm' 
              : 'border-card hover:border-indigo-300 bg-card'
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-1">{s.title}</h3>
            {s.isPremium && <Lock className="w-3 h-3 text-emerald-600 mt-1 shrink-0" />}
          </div>
          <p className="text-xs text-neutral-500 mt-1">{s.genre || 'Drama'} • {s.status}</p>
        </div>
      ))}
    </div>
  );
}
