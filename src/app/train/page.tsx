"use client";

import React, { useState } from 'react';
import { trainCouchLayout } from '@/lib/data';
import { LucideProps } from 'lucide-react';

const TrainIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-6 h-6"}>
    <rect x="4" y="3" width="16" height="16" rx="2" ry="2"></rect>
    <path d="M4 11h16"></path>
    <path d="M12 3v8"></path>
    <path d="m8 19-2 3"></path>
    <path d="m18 22-2-3"></path>
    <path d="M8 15h0"></path>
    <path d="M16 15h0"></path>
  </svg>
);

const CheckIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={props.className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const CoachProfile = ({ number, active }: { number: string, active?: boolean }) => (
  <div className={`w-40 md:w-56 h-20 md:h-24 rounded-md flex flex-col justify-between relative transition-all duration-500 shrink-0
    ${active ? 'bg-emerald-500 border-b-4 border-emerald-700 scale-110 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-10 -translate-y-2' : 'bg-slate-300 border-b-4 border-slate-400 opacity-70'}
  `}>
    <div className="flex justify-center gap-1.5 md:gap-2 px-2 md:px-4 pt-3 md:pt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex-1 aspect-square rounded-sm max-h-8 ${active ? 'bg-emerald-900/30' : 'bg-slate-800/30'}`}></div>
      ))}
    </div>
    <div className={`text-center text-[10px] md:text-xs font-bold pb-1.5 md:pb-2 ${active ? 'text-white' : 'text-slate-600'}`}>{number}</div>
    {/* wheels */}
    <div className="absolute -bottom-3 left-4 md:left-8 w-5 h-5 rounded-full border-4 border-slate-700 bg-slate-400"></div>
    <div className="absolute -bottom-3 right-4 md:right-8 w-5 h-5 rounded-full border-4 border-slate-700 bg-slate-400"></div>
  </div>
);

const Gangway = () => (
  <div className="w-2 md:w-4 h-12 md:h-16 bg-slate-900 flex flex-col justify-evenly px-0.5 shrink-0">
    <div className="w-full h-0.5 bg-black/50"></div>
    <div className="w-full h-0.5 bg-black/50"></div>
    <div className="w-full h-0.5 bg-black/50"></div>
    <div className="w-full h-0.5 bg-black/50"></div>
  </div>
);

const TrainPage = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-800 relative overflow-hidden">
      
      {/* Immersive Train Hero Section */}
      <div className="absolute top-0 left-0 w-full h-[28rem] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-b-[4rem] shadow-2xl z-0 overflow-hidden flex flex-col justify-end pb-16">
        
        {/* Subtle environment backdrop */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute bottom-12 left-0 w-full h-32 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>

        {/* The Train Tracks */}
        <div className="absolute bottom-14 left-0 right-0 h-1 bg-slate-600 shadow-[0_1px_5px_rgba(0,0,0,0.5)]"></div>

        {/* The Train Wrapper */}
        <div className="flex items-end px-12 md:px-32 max-w-full overflow-x-auto no-scrollbar pb-3 z-10 -ml-12">
          
          {/* Locomotive (Engine) */}
          <div className="flex items-end shrink-0">
             <div className="w-40 md:w-56 h-20 md:h-24 bg-slate-200 rounded-tl-[3rem] rounded-tr-md flex flex-col justify-between border-b-4 border-slate-400 relative opacity-90 shadow-lg">
                {/* Cockpit window */}
                <div className="w-12 md:w-16 h-8 md:h-10 bg-slate-800 rounded-tl-2xl rounded-br-md absolute left-2 md:left-4 top-2 md:top-3 opacity-90 shadow-inner"></div>
                {/* Stripe */}
                <div className="w-full h-2 bg-emerald-500 absolute top-1/2 mt-2"></div>
                {/* wheels */}
                <div className="absolute -bottom-3 left-6 md:left-10 w-5 md:w-6 h-5 md:h-6 rounded-full border-4 border-slate-700 bg-slate-400"></div>
                <div className="absolute -bottom-3 right-4 md:right-8 w-5 md:w-6 h-5 md:h-6 rounded-full border-4 border-slate-700 bg-slate-400"></div>
             </div>
             <Gangway />
          </div>

          <CoachProfile number="COACH C-01" />
          <Gangway />
          <CoachProfile number="COACH C-02" />
          <Gangway />
          <CoachProfile number="COACH C-03" />
          <Gangway />
          
          {/* Active Coach */}
          <div className="relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-1 animate-bounce">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              YOUR COACH
            </div>
            <CoachProfile number="COACH C-04" active />
          </div>
          
          <Gangway />
          <CoachProfile number="COACH C-05" />
          <Gangway />
          <CoachProfile number="COACH C-06" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <TrainIcon className="w-7 h-7" />
          </div>
          RailLink
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="text-white/80 hover:text-white transition-colors">Schedules</a>
          <a href="#" className="text-white/80 hover:text-white transition-colors">Destinations</a>
          <a href="#" className="text-white/80 hover:text-white transition-colors">My Trips</a>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold">
          JD
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Details */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Coach C-04</h1>
            <p className="text-emerald-100 font-medium">Express Intercity • New York to Boston</p>
          </div>
          <div className="flex gap-3 bg-white/10 p-1.5 rounded-full backdrop-blur-md border border-white/20">
            <div className="px-6 py-2 rounded-full text-sm font-semibold bg-white text-emerald-700 shadow-sm">Seat Map</div>
            <div className="px-6 py-2 rounded-full text-sm font-semibold text-white/80">Amenities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Layout Area */}
          <div className="xl:col-span-2">
            
            {/* The Train Carriage Container */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-emerald-900/10 border border-slate-100 relative overflow-hidden">
              <h3 className="font-bold text-slate-800 text-xl mb-12">Select your seats</h3>
              
              <div className="w-full overflow-x-auto custom-scrollbar pb-10">
                <div className="min-w-max flex justify-center py-4 px-12 relative">
                  
                  {/* Railway Tracks (Visual under the train) */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-40 flex flex-col justify-between z-0 opacity-20 pointer-events-none">
                    <div className="w-full h-1 bg-slate-800"></div>
                    <div className="w-full h-1 bg-slate-800"></div>
                    {/* Railway ties (wood planks) */}
                    <div className="absolute inset-0 flex items-center justify-between px-2" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #334155 40px, #334155 50px)' }}></div>
                  </div>

                  {/* Advanced Train Coach Design */}
                  <div className="relative flex items-stretch z-10 drop-shadow-2xl">
                    
                    {/* Left Gangway (Connection to previous car) */}
                    <div className="w-8 bg-slate-700 flex flex-col justify-center items-center rounded-l-md border-l-4 border-slate-800 relative z-20">
                      <div className="h-16 w-full bg-slate-900/50 flex flex-col justify-between py-2 border-y-2 border-slate-900">
                        <div className="w-full h-1 bg-black/40"></div>
                        <div className="w-full h-1 bg-black/40"></div>
                        <div className="w-full h-1 bg-black/40"></div>
                      </div>
                    </div>

                    {/* Main Coach Body */}
                    <div 
                      className="bg-slate-100 relative flex items-center px-12 py-8 border-y-8 border-slate-300"
                      style={{
                        boxShadow: 'inset 0 10px 20px rgba(255,255,255,0.8), inset 0 -10px 20px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Coach Windows (Top) */}
                      <div className="absolute top-0 left-12 right-12 h-3 bg-blue-900/10 rounded-b-lg flex gap-4 px-4">
                        {[...Array(10)].map((_, i) => (
                           <div key={i} className="h-full flex-1 bg-sky-200/50 rounded-b border border-sky-300/30"></div>
                        ))}
                      </div>

                      {/* Coach Windows (Bottom) */}
                      <div className="absolute bottom-0 left-12 right-12 h-3 bg-blue-900/10 rounded-t-lg flex gap-4 px-4">
                        {[...Array(10)].map((_, i) => (
                           <div key={i} className="h-full flex-1 bg-sky-200/50 rounded-t border border-sky-300/30"></div>
                        ))}
                      </div>

                      {/* Grid of Seats */}
                      <div 
                        className="grid gap-x-4 gap-y-3 relative z-10" 
                        style={{
                          gridTemplateColumns: `repeat(${trainCouchLayout.rows}, minmax(46px, 1fr))`,
                          gridTemplateRows: `repeat(${trainCouchLayout.columns}, minmax(46px, 1fr))`
                        }}
                      >
                        {trainCouchLayout.seats.map((seat, i) => {
                          const seatId = `${seat.row}${seat.seatNumber}`;
                          const isAvailable = seat.isActive;
                          const isSelected = selectedSeats.includes(seatId);
                          
                          // Horizontal orientation: y=0 is left, x=0 is top
                          const col = seat.y + 1;
                          const row = seat.x + 1;

                          return (
                            <div 
                              key={i}
                              onClick={() => toggleSeat(seatId, isAvailable)}
                              style={{ gridColumn: col, gridRow: row }}
                              className={`
                                w-12 h-12 flex flex-col items-center justify-center rounded-t-xl rounded-b-md text-xs font-bold transition-all select-none relative
                                ${isSelected 
                                  ? 'bg-emerald-500 text-white shadow-[0_8px_16px_rgba(16,185,129,0.4)] scale-110 z-20 border-b-4 border-emerald-700' 
                                  : isAvailable 
                                    ? 'bg-white text-slate-500 shadow-md border-b-4 border-slate-200 cursor-pointer hover:border-emerald-400 hover:text-emerald-600 hover:-translate-y-1 hover:shadow-lg' 
                                    : 'bg-[#e2e8f0] text-slate-400 cursor-not-allowed border-b-4 border-slate-300 opacity-60'}
                              `}
                            >
                              {/* Train seat headrest accent */}
                              <div className={`absolute top-1 w-6 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : isAvailable ? 'bg-slate-100' : 'bg-slate-300'}`}></div>
                              <span className="mt-2">{seatId}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Right Gangway (Connection to next car) */}
                    <div className="w-8 bg-slate-700 flex flex-col justify-center items-center rounded-r-md border-r-4 border-slate-800 relative z-20">
                      <div className="h-16 w-full bg-slate-900/50 flex flex-col justify-between py-2 border-y-2 border-slate-900">
                        <div className="w-full h-1 bg-black/40"></div>
                        <div className="w-full h-1 bg-black/40"></div>
                        <div className="w-full h-1 bg-black/40"></div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              {/* Legend & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-6 mt-8 border-t border-slate-100 pt-8">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-white border-b-2 border-slate-200 shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-500">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-emerald-500 border-b-2 border-emerald-700 shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-500">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-slate-200 border-b-2 border-slate-300 opacity-60"></div>
                    <span className="text-sm font-medium text-slate-500">Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Ticket / Fare Summary) */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8 overflow-hidden">
              
              {/* Ticket Header Graphic */}
              <div className="bg-slate-900 p-6 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-30"></div>
                <h3 className="font-semibold text-white/90 mb-1 text-sm tracking-widest uppercase">Your Journey</h3>
                <div className="text-2xl font-bold">NYC → BOS</div>
                <div className="mt-4 flex justify-between text-sm">
                  <div>
                    <div className="text-white/60">Date</div>
                    <div className="font-medium">Oct 24, 2026</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60">Time</div>
                    <div className="font-medium">08:30 AM</div>
                  </div>
                </div>
              </div>

              {/* Ticket body cutout dots */}
              <div className="flex justify-between items-center -mt-3 relative z-10 px-2">
                <div className="w-6 h-6 bg-[#F0F2F5] rounded-full shadow-inner"></div>
                <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-2"></div>
                <div className="w-6 h-6 bg-[#F0F2F5] rounded-full shadow-inner"></div>
              </div>

              <div className="p-6">
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Base Fare</span>
                    <span className="font-bold text-slate-800">$45.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Selected Seats ({selectedSeats.length})</span>
                    <span className="font-bold text-slate-800">${selectedSeats.length * 12}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Taxes & Fees</span>
                    <span className="font-bold text-slate-800">$8.50</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-2xl p-5 mb-6 border border-emerald-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Total Amount</span>
                    <div className="flex items-start text-emerald-600">
                      <span className="text-sm font-bold mt-1">$</span>
                      <span className="text-3xl font-black">{53.50 + selectedSeats.length * 12}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Includes all applicable taxes and fees.</p>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Seats</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(id => (
                        <span key={id} className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm border border-slate-200">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  disabled={selectedSeats.length === 0}
                  className="w-full py-4 text-sm font-bold text-white bg-slate-900 rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-600/30"
                >
                  {selectedSeats.length === 0 ? 'Select a seat to continue' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}

export default TrainPage;