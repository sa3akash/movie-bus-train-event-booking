import React from 'react';
import { BusLayout } from '@/lib/data';

interface PlaneSeatMapProps {
  layout: BusLayout;
  selectedSeats: string[];
  onSeatToggle: (seatId: string, isAvailable: boolean) => void;
}

export const PlaneSeatMap: React.FC<PlaneSeatMapProps> = ({
  layout,
  selectedSeats,
  onSeatToggle,
}) => {
  return (
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
                gridTemplateColumns: `repeat(${layout.rows}, minmax(44px, 1fr))`,
                gridTemplateRows: `repeat(${layout.columns}, minmax(44px, 1fr))`
              }}
            >
              {layout.seats.map((seat, i) => {
                const seatId = `${seat.row}${seat.seatNumber}`;
                const isAvailable = seat.isActive;
                const isSelected = selectedSeats.includes(seatId);
                
                // Map coordinates: y=0 is row A (front, right side)
                // x=0 is top, x=4 is bottom
                const col = layout.rows - seat.y;
                const row = seat.x + 1;

                return (
                  <div 
                    key={i}
                    onClick={() => onSeatToggle(seatId, isAvailable)}
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
  );
};
