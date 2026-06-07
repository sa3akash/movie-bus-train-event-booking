import React from "react";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFilesDrop: (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropzone({ onFilesDrop }: UploadDropzoneProps) {
  return (
    <div 
      onDragOver={e => e.preventDefault()} 
      onDrop={onFilesDrop}
      className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer relative"
    >
      <input 
        type="file" 
        multiple 
        accept="video/*" 
        onChange={onFilesDrop} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
      />
      <UploadCloud className="w-12 h-12 text-indigo-400 mb-4" />
      <p className="font-medium text-indigo-900 dark:text-indigo-400 text-lg">Drop your episodes here</p>
      <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm mt-1">Select multiple files at once. We'll auto-sort them.</p>
    </div>
  );
}
