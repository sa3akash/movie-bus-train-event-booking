import React from "react";
import { Lock, Search, MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface SeriesListProps {
  seriesList: any[];
  selectedSeriesId: string | null;
  onSelectSeries: (id: string) => void;
  isCreating: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onDeleteSeries?: (id: string, e: React.MouseEvent) => void;
  isDeleting?: string | null;
}

export function SeriesList({ 
  seriesList, selectedSeriesId, onSelectSeries, isCreating,
  searchQuery = "", onSearchChange, hasMore, onLoadMore, onDeleteSeries, isDeleting 
}: SeriesListProps) {
  
  return (
    <div className="flex flex-col h-full">
      {onSearchChange && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search series..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-800/50 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      )}

      {seriesList.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
          <p className="text-sm italic">No series found.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {seriesList.map((s) => (
            <div 
              key={s.id} 
              onClick={() => onSelectSeries(s.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all relative group ${
                selectedSeriesId === s.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm' 
                  : 'border-card hover:border-indigo-300 bg-card'
              }`}
            >
              <div className="flex justify-between items-start pr-8">
                <h3 className="font-semibold line-clamp-1">{s.title}</h3>
                {s.isPremium && <Lock className="w-3 h-3 text-emerald-600 mt-1 shrink-0" />}
              </div>
              <p className="text-xs text-neutral-500 mt-1">{s.genre || 'Drama'} • {s.status}</p>

              {/* Quick Actions overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link 
                  href={`/reels/studio/series/${s.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:text-indigo-600 transition"
                  title="Edit Series"
                >
                  <Edit2 className="w-3 h-3" />
                </Link>
                {onDeleteSeries && (
                  <button 
                    onClick={(e) => onDeleteSeries(s.id, e)}
                    disabled={isDeleting === s.id}
                    className="p-1.5 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:text-red-600 transition disabled:opacity-50"
                    title="Delete Series"
                  >
                    {isDeleting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {hasMore && onLoadMore && (
            <button 
              onClick={onLoadMore}
              className="w-full py-2 mt-4 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
