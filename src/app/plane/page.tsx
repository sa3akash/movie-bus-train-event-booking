"use client";

import React, { useState } from 'react';
import { planeLayout } from '@/lib/data';
import { LucideProps } from 'lucide-react';

// SVG Icons
const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500">
    <path d="M3.1 11.2l6.5-1.8 4.2-6.5a1.8 1.8 0 0 1 3 .6l1.2 3.8 3.5-.9c1-.3 2 .3 2.3 1.3.3 1-.3 2-1.3 2.3l-16.7 4.6a1 1 0 0 1-1.2-1.2l-1.5-2.2z" />
  </svg>
);

const CheckIcon = (props:LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

export default function PlanePage() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      {/* Navigation */}
      <nav className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-tight">
          <PlaneIcon />
          Flywere
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-500 transition-colors">Service</a>
          <a href="#" className="hover:text-blue-500 transition-colors">About Us</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-sm font-medium text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">Log in</button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 shadow-sm transition-all hover:shadow">Sign in</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (Flight Details & Seat Picker) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Flight Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-blue-500 font-bold italic">
                    AJ
                  </div>
                  <span className="font-semibold text-lg text-slate-700">Asia Jettime Airline</span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Economy Class</span>
              </div>
              
              <div className="flex items-center justify-between relative">
                {/* Depart */}
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-medium mb-1">Depart</div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">20:15</div>
                  <div className="text-sm text-slate-600">4 October 2023</div>
                  <div className="text-xs text-slate-400 mt-1">Soekarno-Hatta Airport</div>
                </div>
                
                {/* Timeline */}
                <div className="flex-1 px-8 relative hidden md:block">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-blue-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full z-10">12 hr 30 min</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                    <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                  </div>
                  <div className="text-center text-[10px] text-slate-400 mt-4">2 stop</div>
                </div>

                {/* Arrive */}
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium mb-1">Arrive</div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">12:25</div>
                  <div className="text-sm text-slate-600">5 October 2023</div>
                  <div className="text-xs text-slate-400 mt-1">John F. Kennedy Intl Airport</div>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 text-sm font-medium bg-white p-4 rounded-xl shadow-sm border border-slate-100 overflow-x-auto whitespace-nowrap">
              <span className="text-slate-400">Traveler Details</span>
              <span className="text-slate-300">›</span>
              <span className="text-blue-500">Seat Reservation</span>
              <span className="text-slate-300">›</span>
              <span className="text-slate-400">Review</span>
              <span className="text-slate-300">›</span>
              <span className="text-slate-400">Payment</span>
            </div>

            {/* Seat Map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-6">Pick Seat Reservation</h3>
              
              <div className="w-full overflow-x-auto custom-scrollbar pb-4">
                <div className="min-w-max flex justify-center py-4 px-4">
                  
                  {/* Plane Shape Container (Dynamic for any grid size) */}
                  <div className="flex drop-shadow-sm">
                    
                    {/* Dynamic Fuselage Body */}
                    <div 
                      className="bg-[#F3F5F8] pl-6 py-6 pr-2 flex items-center"
                      style={{
                        borderTopLeftRadius: '16px',
                        borderBottomLeftRadius: '16px',
                      }}
                    >
                      <div 
                        className="grid gap-x-3 gap-y-2 relative z-10" 
                        style={{
                          gridTemplateColumns: `repeat(${planeLayout.rows}, minmax(44px, 1fr))`,
                          gridTemplateRows: `repeat(${planeLayout.columns}, minmax(44px, 1fr))`
                        }}
                      >
                        {planeLayout.seats.map((seat, i) => {
                          const seatId = `${seat.row}${seat.seatNumber}`;
                          const isAvailable = seat.isActive;
                          const isSelected = selectedSeats.includes(seatId);
                          
                          // Map coordinates: y=0 is row A (front, right side)
                          // x=0 is top, x=4 is bottom
                          const col = planeLayout.rows - seat.y;
                          const row = seat.x + 1;

                          return (
                            <div 
                              key={i}
                              onClick={() => toggleSeat(seatId, isAvailable)}
                              style={{ gridColumn: col, gridRow: row }}
                              className={`
                                w-11 h-11 flex items-center justify-center rounded-[10px] text-[11px] font-bold transition-colors select-none
                                ${isSelected 
                                  ? 'bg-blue-500 text-white shadow-md' 
                                  : isAvailable 
                                    ? 'bg-white text-slate-400 cursor-pointer hover:bg-slate-50' 
                                    : 'bg-[#e2e8f0] text-slate-400 cursor-not-allowed'}
                              `}
                            >
                              {seatId}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* SVG Nose (Scales height automatically to match fuselage) */}
                    <svg 
                      viewBox="710.397 0 196.603 316" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-[100px] md:w-[130px] shrink-0"
                      preserveAspectRatio="none"
                    >
                      <path d="M907 150C895.982 67.2451 787.521 -1.00068e-05 710.397 -8.76314e-06L16 -8.6253e-07C7.16345 -7.6199e-07 -3.07075e-07 7.16343 -6.85869e-07 16L-1.286e-05 300C-1.32388e-05 308.836 7.16344 316 16 316L710.397 316C823.078 316 902.493 202.156 907 150Z" fill="#F3F5F8"/>
                      <path d="M758.524 47.7943L762.994 38.7557C764.001 36.7203 766.256 35.6099 768.468 36.1256C800.213 43.5288 820.716 60.0517 829.898 70.7093C831.921 73.0575 830.901 76.5368 828.059 77.7755L809.446 85.8896C807.209 86.8651 804.61 86.0681 803.133 84.1247C791.648 69.015 773.304 59.4569 761.572 55.091C758.634 53.9977 757.134 50.604 758.524 47.7943Z" fill="white"/>
                      <path d="M818.218 95.0609L837.217 86.7786C839.085 85.9641 841.269 86.3511 842.648 87.8512C855.404 101.72 866.508 124.896 868.522 141.318C868.858 144.059 866.609 146.302 863.847 146.302L832.15 146.302C829.475 146.302 827.286 144.192 827.048 141.527C825.516 124.366 820.118 110.812 815.788 102.972C814.221 100.134 815.247 96.3561 818.218 95.0609Z" fill="white"/>
                      <path d="M758.524 259.81L762.994 268.848C764.001 270.884 766.256 271.994 768.468 271.478C800.213 264.075 820.716 247.552 829.898 236.895C831.921 234.546 830.901 231.067 828.059 229.828L809.446 221.714C807.209 220.739 804.61 221.536 803.133 223.479C791.648 238.589 773.304 248.147 761.572 252.513C758.634 253.606 757.134 257 758.524 259.81Z" fill="white"/>
                      <path d="M818.218 212.543L837.208 220.822C839.081 221.638 841.273 221.242 842.664 219.746C858.323 202.899 865.638 180.238 868.066 166.761C868.591 163.852 866.285 161.302 863.329 161.302L832.15 161.302C829.475 161.302 827.286 163.412 827.048 166.076C825.516 183.237 820.118 196.792 815.788 204.632C814.221 207.47 815.247 211.248 818.218 212.543Z" fill="white"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6 border-t border-slate-100 pt-6">
                <button className="px-8 py-2.5 text-sm font-medium text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">Previous</button>
                <button className="px-8 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 shadow-sm transition-all hover:shadow">Next</button>
              </div>
            </div>
          </div>

          {/* Right Column (Fare Summary) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
            <h3 className="font-semibold text-slate-800 mb-6 text-lg">Fare Summary</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between items-center text-slate-600">
                <span>Food, Snack and Drink 3x</span>
                <span className="font-medium text-slate-800">$60</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Ticket</span>
                <span className="font-medium text-slate-800">$160</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Selected Seats</span>
                <span className="font-medium text-slate-800">${selectedSeats.length * 15}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-slate-800">-</span>
              </div>
            </div>

            <button className="w-full py-2.5 mb-6 text-sm font-medium text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors border-dashed">
              Select Discount
            </button>

            <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between">
              <span className="font-semibold text-slate-600 text-sm">Total Summary</span>
              <div className="flex items-baseline gap-1 text-slate-800">
                <span className="text-xs font-bold">$</span>
                <span className="text-2xl font-bold">{220 + selectedSeats.length * 15}</span>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                <CheckIcon className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-blue-900 mb-1">Seats Selected</div>
                  <div className="text-xs text-blue-700">{selectedSeats.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* Custom styles for hiding scrollbar visually but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
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
