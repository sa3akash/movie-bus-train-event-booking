"use client";

import { COACHES, TYPE_BADGE } from './types';

interface SelectedSeat {
  coachId: string;
  seatId: string;
}

interface FareSummaryProps {
  allSelected: SelectedSeat[];
  totalPrice: number;
}

export const FareSummary = ({ allSelected, totalPrice }: FareSummaryProps) => (
  <div className="relative">
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 sticky top-8 overflow-hidden">

      {/* Header */}
      <div className="bg-slate-950 p-6 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500 rounded-full blur-[70px] opacity-25" />
        <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase mb-1">Booking Summary</div>
        <div className="text-2xl font-black">NYC → BOS</div>
        <div className="mt-3 flex justify-between text-xs">
          <div>
            <div className="text-white/50">Date</div>
            <div className="font-bold">Oct 24, 2026</div>
          </div>
          <div className="text-right">
            <div className="text-white/50">Departs</div>
            <div className="font-bold">08:30 AM</div>
          </div>
        </div>
      </div>

      {/* Tear line */}
      <div className="flex items-center -mt-3 relative z-10 px-1.5">
        <div className="w-5 h-5 bg-[#F0F2F5] rounded-full" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-1" />
        <div className="w-5 h-5 bg-[#F0F2F5] rounded-full" />
      </div>

      <div className="p-6 space-y-5">

        {/* Per-coach breakdown */}
        <div className="space-y-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Coach Breakdown</div>
          {COACHES.map(c => {
            const cnt = allSelected.filter(s => s.coachId === c.id).length;
            if (cnt === 0) return null;
            return (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${TYPE_BADGE[c.type].bg}`} />
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <span className="text-slate-400">×{cnt}</span>
                </div>
                <span className="font-bold text-slate-800">${c.price * cnt}</span>
              </div>
            );
          })}
          {allSelected.length === 0 && (
            <p className="text-xs text-slate-400 italic">No seats selected yet.</p>
          )}
        </div>

        <div className="border-t border-dashed border-slate-200" />

        {/* Base fare row */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Base + Taxes</span>
          <span className="font-bold text-slate-800">$53.50</span>
        </div>

        {/* Total */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <span className="font-black text-slate-700">Total</span>
          <div className="flex items-start text-emerald-600">
            <span className="text-xs font-black mt-1.5 mr-0.5">$</span>
            <span className="text-3xl font-black">{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Selected seat chips */}
        {allSelected.length > 0 && (
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">All Selected</div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
              {allSelected.map(({ coachId, seatId }) => {
                const coach = COACHES.find(c => c.id === coachId)!;
                return (
                  <span
                    key={`${coachId}-${seatId}`}
                    className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${TYPE_BADGE[coach.type].bg}`} />
                    {seatId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          disabled={allSelected.length === 0}
          className="w-full py-4 text-sm font-black text-white bg-slate-950 rounded-2xl hover:bg-emerald-600 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-600/30"
        >
          {allSelected.length === 0
            ? 'Select seats to continue'
            : `Book ${allSelected.length} seat${allSelected.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  </div>
);
