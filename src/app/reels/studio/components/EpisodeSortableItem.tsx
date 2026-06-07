import React from "react";
import { GripVertical, Lock, Trash2 } from "lucide-react";

interface EpisodeMeta {
  caption: string;
  isPremium: boolean;
  unlockPrice: number;
  file: File;
}

interface EpisodeSortableItemProps {
  index: number;
  meta: EpisodeMeta;
  draggedItemIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onUpdateMeta: (index: number, key: keyof EpisodeMeta, value: any) => void;
  onRemove: (index: number) => void;
}

export function EpisodeSortableItem({
  index,
  meta,
  draggedItemIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onUpdateMeta,
  onRemove
}: EpisodeSortableItemProps) {
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-xl hover:shadow-sm transition-all group ${draggedItemIndex === index ? 'opacity-50' : ''}`}
    >
      <div className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
        <GripVertical className="w-5 h-5 pointer-events-none" />
      </div>
      
      <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-900 rounded flex items-center justify-center text-xs font-bold text-neutral-500">
        {index + 1}
      </div>
      
      <div className="flex-1">
        <input 
          type="text" 
          value={meta.caption} 
          onChange={e => onUpdateMeta(index, 'caption', e.target.value)}
          className="w-full text-sm font-medium bg-transparent border-0 p-0 focus:ring-0 dark:text-white"
          placeholder="Episode title or caption"
        />
        <p className="text-xs text-neutral-400 truncate mt-1">{meta.file.name}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <Lock className="w-3.5 h-3.5" /> Premium
          <input 
            type="checkbox" 
            checked={meta.isPremium} 
            onChange={e => onUpdateMeta(index, 'isPremium', e.target.checked)}
            className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 ml-1 dark:border-neutral-600 dark:bg-neutral-700" 
          />
        </label>
        {meta.isPremium && (
          <input 
            type="number" 
            placeholder="Price" 
            value={meta.unlockPrice || ''}
            onChange={e => onUpdateMeta(index, 'unlockPrice', Number(e.target.value))}
            className="w-16 px-2 py-1 text-xs border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
          />
        )}
      </div>
      
      <button 
        onClick={() => onRemove(index)} 
        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
