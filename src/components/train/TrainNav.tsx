"use client";

import { TrainIcon } from './TrainIcons';

export const TrainNav = () => (
  <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-5 flex items-center justify-between text-white">
    {/* Brand */}
    <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
      <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
        <TrainIcon className="w-6 h-6" />
      </div>
      RailLink
    </div>

    {/* Links */}
    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="#" className="text-white/75 hover:text-white transition-colors">Schedules</a>
      <a href="#" className="text-white/75 hover:text-white transition-colors">Destinations</a>
      <a href="#" className="text-white/75 hover:text-white transition-colors">My Trips</a>
    </div>

    {/* Avatar */}
    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-bold text-sm">
      JD
    </div>
  </nav>
);
