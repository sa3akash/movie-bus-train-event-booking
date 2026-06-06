import { useState, useRef, useCallback, useEffect, RefObject } from "react";
import { AdvancedVideoPlayerProps } from "../types";

export function useVideoAds({
  videoRef,
  playerRef,
  propsRef,
  isAdPlayingRef,
  setDuration,
  setCurrentTime,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  playerRef: RefObject<any>;
  propsRef: RefObject<AdvancedVideoPlayerProps | null>;
  isAdPlayingRef: React.RefObject<boolean>;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
}) {
  const adManagerRef = useRef<any>(null);
  const currentAdRef = useRef<any>(null);
  const registeredAdsRef = useRef<Set<string>>(new Set());
  const adMetadataMapRef = useRef<
    Map<string, { isSkippable: boolean; skipOffset: number; title?: string }>
  >(new Map());

  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [adTimeUntilSkippable, setAdTimeUntilSkippable] = useState(0);
  const [adTitle, setAdTitle] = useState("");
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const [adDuration, setAdDuration] = useState(0);

  const skipAd = useCallback(() => {
    if (currentAdRef.current && isAdPlayingRef.current) {
      try {
        if (typeof currentAdRef.current.skip === "function") {
          currentAdRef.current.skip();
        }
      } catch (e) {
        console.error("Failed to skip ad", e);
      }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAdPlaying) {
      interval = setInterval(() => {
        if (currentAdRef.current) {
          const ad = currentAdRef.current;

          let remaining = 0;
          let current = 0;
          let duration = 0;

          if (typeof ad.getRemainingTime === "function")
            remaining = ad.getRemainingTime();
          if (typeof ad.getDuration === "function") duration = ad.getDuration();

          current = duration - remaining;

          setAdCurrentTime(current);
          setAdDuration(duration);
          setAdTimeRemaining(remaining);

          let skipOffset = 5;
          let isSkip = true;

          const id = typeof ad.getAdId === "function" ? ad.getAdId() : null;
          if (id && adMetadataMapRef.current.has(id)) {
            const meta = adMetadataMapRef.current.get(id);
            skipOffset = meta?.skipOffset ?? 5;
            isSkip = meta?.isSkippable ?? true;
          } else {
            if (ad.isSkippable && typeof ad.isSkippable === "function") {
              isSkip = ad.isSkippable();
            }
            if (
              ad.getSkipTimeOffset &&
              typeof ad.getSkipTimeOffset === "function"
            ) {
              skipOffset = ad.getSkipTimeOffset();
            }
          }

          if (isSkip) {
            setAdTimeUntilSkippable(Math.max(0, skipOffset - current));
            setCanSkipAd(current >= skipOffset);
          } else {
            setAdTimeUntilSkippable(-1);
            setCanSkipAd(false);
          }
        }
      }, 250);
    } else {
      setAdTimeRemaining(0);
      setAdTimeUntilSkippable(0);
      setAdCurrentTime(0);
      setAdDuration(0);
    }
    return () => clearInterval(interval);
  }, [isAdPlaying]);

  return {
    adManagerRef,
    currentAdRef,
    registeredAdsRef,
    adMetadataMapRef,
    isAdPlaying,
    setIsAdPlaying,
    canSkipAd,
    setCanSkipAd,
    adTimeRemaining,
    setAdTimeRemaining,
    adTimeUntilSkippable,
    setAdTimeUntilSkippable,
    adTitle,
    setAdTitle,
    adCurrentTime,
    setAdCurrentTime,
    adDuration,
    setAdDuration,
    skipAd,
  };
}
