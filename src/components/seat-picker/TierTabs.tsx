import React from "react";
import { TierKey } from "./types";

interface TierTabsProps {
  currentTier: TierKey;
  onSelectTier: (tier: TierKey) => void;
}

const TIERS: TierKey[] = ["vip", "premium", "standard"];

export const TierTabs: React.FC<TierTabsProps> = ({ currentTier, onSelectTier }) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      {TIERS.map((t) => (
        <button
          key={t}
          onClick={() => onSelectTier(t)}
          className={`p-2 rounded ${
            currentTier === t ? "bg-slate-700" : "bg-slate-800"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};
