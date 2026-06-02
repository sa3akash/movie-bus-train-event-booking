import React from "react";

export const Screen = () => (
  <div className="relative flex flex-col items-center mb-4">
    <div className="absolute -top-6 w-3/4 h-12 bg-linear-to-r from-transparent via-sky-400/20 to-transparent blur-2xl" />
    <div className="w-3/4 h-[4px] bg-linear-to-r from-transparent via-sky-400 to-transparent rounded-full" />
    <span className="text-[10px] mt-2 tracking-widest text-sky-300">
      SCREEN
    </span>
  </div>
);
