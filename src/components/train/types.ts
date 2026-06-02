import { BusLayout } from '@/lib/data';
import { trainCouchLayout } from '@/lib/data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoachData {
  id: string;
  label: string;
  type: 'economy' | 'business' | 'first';
  layout: BusLayout;
  price: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const TYPE_BADGE: Record<CoachData['type'], { bg: string; text: string; label: string }> = {
  economy:  { bg: 'bg-sky-500',    text: 'text-sky-500',    label: 'Economy'   },
  business: { bg: 'bg-amber-500',  text: 'text-amber-500',  label: 'Business'  },
  first:    { bg: 'bg-purple-500', text: 'text-purple-500', label: '1st Class' },
};

// Deep-clone and shuffle availability for variety between coaches
const makeLayout = (occupiedPct: number): BusLayout => ({
  ...trainCouchLayout,
  seats: trainCouchLayout.seats.map(s => ({
    ...s,
    isActive: s.isActive ? Math.random() > occupiedPct : false,
  })),
});

export const COACHES: CoachData[] = [
  { id: 'C-01', label: 'C-01', type: 'economy',  layout: makeLayout(0.3), price: 12 },
  { id: 'C-02', label: 'C-02', type: 'economy',  layout: makeLayout(0.5), price: 12 },
  { id: 'C-03', label: 'C-03', type: 'business', layout: makeLayout(0.2), price: 28 },
  { id: 'C-04', label: 'C-04', type: 'business', layout: makeLayout(0.4), price: 28 },
  { id: 'C-05', label: 'C-05', type: 'first',    layout: makeLayout(0.1), price: 55 },
  { id: 'C-06', label: 'C-06', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-07', label: 'C-07', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-08', label: 'C-08', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-09', label: 'C-09', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-10', label: 'C-10', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-11', label: 'C-11', type: 'first',    layout: makeLayout(0.3), price: 55 },
  { id: 'C-12', label: 'C-12', type: 'first',    layout: makeLayout(0.3), price: 55 },
];
