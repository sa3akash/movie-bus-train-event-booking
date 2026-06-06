import React, { useEffect, useState, useRef } from "react";
import { useAdvancedPlayer } from "./context";
import { X } from "lucide-react";

export const StatsOverlay = ({ onClose }: { onClose: () => void }) => {
  const { videoRef, getStats, videoTracks, isLiveState } = useAdvancedPlayer();
  const [stats, setStats] = useState<any>({});
  
  // A unique session ID similar to YouTube's sCPN
  const sCpnRef = useRef(Math.random().toString(36).substring(2, 14).toUpperCase());

  useEffect(() => {
    const updateStats = () => {
      const shakaStats = getStats() || {};
      const video = videoRef.current;
      const activeTrack = videoTracks?.find((t: any) => t.active);
      
      let bufferHealth = 0;
      if (video && video.buffered.length > 0) {
        const current = video.currentTime;
        for (let i = 0; i < video.buffered.length; i++) {
          if (current >= video.buffered.start(i) && current <= video.buffered.end(i)) {
            bufferHealth = video.buffered.end(i) - current;
            break;
          }
        }
      }

      setStats({
        ...shakaStats,
        videoWidth: video?.videoWidth || 0,
        videoHeight: video?.videoHeight || 0,
        playerWidth: video?.clientWidth || 0,
        playerHeight: video?.clientHeight || 0,
        volume: video ? Math.round(video.volume * 100) : 0,
        muted: video?.muted,
        bufferHealth: bufferHealth,
        videoCodec: activeTrack?.videoCodec || 'unknown',
        audioCodec: activeTrack?.audioCodec || 'unknown',
        isLive: isLiveState,
      });
    };

    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial fetch

    return () => clearInterval(interval);
  }, [getStats, videoRef, videoTracks, isLiveState]);

  if (!stats) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[90] md:hidden backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="
        fixed bottom-0 left-0 right-0 z-[100] w-full flex flex-col max-h-[70vh]
        bg-zinc-950 md:bg-black/85 md:backdrop-blur-md border-t md:border border-white/10 rounded-t-2xl md:rounded-xl
        md:absolute md:top-4 md:bottom-auto md:left-4 md:right-auto md:w-auto md:max-h-none
        text-white/90 p-4 text-[11px] font-mono shadow-2xl min-w-[300px] md:min-w-[340px] pointer-events-auto
        animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:fade-in duration-300
      ">
        {/* Mobile Handle */}
        <div className="w-full flex justify-center pb-4 md:hidden shrink-0" onClick={onClose}>
          <div className="w-10 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2 shrink-0">
          <h3 className="font-bold text-sm tracking-wide font-sans">Stats for nerds</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto overscroll-contain pr-2 pb-4 md:pb-0">
        <div className="flex justify-between">
          <span className="text-white/60">Video ID / sCPN</span>
          <span>{sCpnRef.current}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Viewport / Frames</span>
          <span>
            {stats.playerWidth}x{stats.playerHeight} / {stats.droppedFrames || 0} dropped
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Current / Optimal Res</span>
          <span>
            {stats.videoWidth}x{stats.videoHeight} / {stats.width || stats.videoWidth}x{stats.height || stats.videoHeight}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Volume / Normalized</span>
          <span>
            {stats.volume}% {stats.muted ? '(muted)' : ''}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Codecs</span>
          <span className="truncate max-w-[180px] text-right" title={`${stats.videoCodec} / ${stats.audioCodec}`}>
            {stats.videoCodec} / {stats.audioCodec}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Connection Speed</span>
          <span>
            {Math.round((stats.estimatedBandwidth || 0) / 1000)} Kbps
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Network Activity</span>
          <span>
            {Math.round((stats.streamBandwidth || 0) / 1000)} Kbps
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Buffer Health</span>
          <span>
            {(stats.bufferHealth || 0).toFixed(2)} s
          </span>
        </div>
        {stats.isLive && (
          <div className="flex justify-between">
            <span className="text-white/60">Live Latency</span>
            <span>
              {(stats.liveLatency || 0).toFixed(2)} s
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/60">Latency / Play / Buffer</span>
          <span>
            {Math.round((stats.loadLatency || 0) * 1000)}ms / {Math.round(stats.playTime || 0)}s / {Math.round(stats.bufferingTime || 0)}s
          </span>
        </div>
        </div>
      </div>
    </>
  );
};
