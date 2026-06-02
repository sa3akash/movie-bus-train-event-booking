import React from "react";

const ScreenLavel = () => {
  return (<>
    {/* <div className="relative flex flex-col items-center mb-4">
      <div className="absolute -top-2 w-2/3 h-10 bg-linear-to-r from-transparent via-sky-500/30 to-transparent blur-2xl rounded-full" />

      <div className="w-2/3 h-[3px] rounded-full bg-linear-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.6)]" />

      <div className="mt-2 px-4 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] tracking-[0.3em] font-black text-sky-400 backdrop-blur">
        SCREEN
      </div>
    </div> */}

    {/* SCREEN */}
<div className="relative flex flex-col items-center w-full mb-10 overflow-hidden h-24 select-none">
  
  {/* 1. Projector Light Cone / Ambient Reflection Glow */}
  <div 
    className="absolute top-0 w-2/3 h-full bg-linear-to-b from-sky-500/20 via-sky-500/5 to-transparent blur-xl pointer-events-none transform will-change-transform animate-pulse"
    style={{
      clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
      animationDuration: "4s"
    }}
  />

  {/* 2. Top Rim Light Highlight (Mimics Screen Edge Curve) */}
  <div className="absolute top-[2px] w-2/3 h-[12px] bg-linear-to-b from-sky-300/30 to-transparent blur-xs rounded-full pointer-events-none" />

  {/* 3. Main Silver Curved Screen Line */}
  <div className="relative w-2/3 h-[4px] rounded-full bg-linear-to-r from-transparent via-sky-300 to-transparent shadow-[0_1px_15px_4px_rgba(56,189,248,0.5)] border-t border-sky-200/40" />

  {/* 4. Subtle Downward Light Leak */}
  <div className="w-1/2 h-px bg-linear-to-r from-transparent via-sky-400/30 to-transparent blur-[1px] mt-[2px]" />

  {/* 5. Floating Glassmorphic Text Label */}
  <div className="relative z-10 mt-4 px-5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 text-[10px] tracking-[0.4em] font-black text-sky-400/90 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
    SCREEN
  </div>

</div>
  </>
  );
};

export default ScreenLavel;
