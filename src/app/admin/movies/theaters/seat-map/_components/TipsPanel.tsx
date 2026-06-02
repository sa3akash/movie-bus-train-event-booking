import React from "react";

export function TipsPanel() {
  return (
    <div className="px-4 py-4 space-y-2 mt-auto">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
        Tips
      </p>
      <ul className="space-y-1.5 text-[10px] text-slate-600">
        <li className="flex gap-1.5">
          <span className="text-indigo-500">→</span> Select a tool then click /
          drag to paint
        </li>
        <li className="flex gap-1.5">
          <span className="text-indigo-500">→</span> Right-click any seat to
          toggle ♿ access
        </li>
        <li className="flex gap-1.5">
          <span className="text-indigo-500">→</span> Aisles split seat numbering
          per row
        </li>
        <li className="flex gap-1.5">
          <span className="text-indigo-500">→</span> Seat types are loaded from
          the database
        </li>
      </ul>
    </div>
  );
}
