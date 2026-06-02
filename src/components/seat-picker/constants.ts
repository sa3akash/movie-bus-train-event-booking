import { TierKey, TierMeta } from "./types";

export const TIER_META: Record<TierKey, TierMeta> = {
  vip: { price: 25, color: "bg-purple-500", active: "bg-purple-300" },
  premium: { price: 18.5, color: "bg-sky-500", active: "bg-sky-300" },
  standard: { price: 12, color: "bg-slate-600", active: "bg-amber-400" },
};

// Grid constants
export const CELL_SIZE = 32;
export const GAP_SIZE = 8;
