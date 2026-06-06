import { useState, useCallback, RefObject } from "react";

export function useVideoTracks({
  playerRef,
}: {
  playerRef: RefObject<any>;
}) {
  const [videoTracks, setVideoTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeTrackHeight, setActiveTrackHeight] = useState<number | null>(null);

  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [selectedTextTrackId, setSelectedTextTrackId] = useState<string | null>(null);
  const [isTextTrackVisible, setIsTextTrackVisible] = useState(false);

  const [audioLanguages, setAudioLanguages] = useState<any[]>([]);
  const [selectedAudioLanguage, setSelectedAudioLanguage] = useState<string>("auto");

  const selectTrack = useCallback((trackId: string | null) => {
    if (!playerRef.current) return;
    if (trackId === null) {
      playerRef.current.configure({ abr: { enabled: true } });
      setSelectedTrackId(null);
    } else {
      const track = playerRef.current.getVariantTracks().find((t: any) => t.id.toString() === trackId);
      if (track) {
        playerRef.current.configure({ abr: { enabled: false } });
        playerRef.current.selectVariantTrack(track, true);
        setSelectedTrackId(trackId);
      }
    }
  }, [playerRef]);

  const toggleTextTrackVisibility = useCallback(() => {
    if (!playerRef.current) return;
    const isVisible = playerRef.current.isTextTrackVisible();
    playerRef.current.setTextTrackVisibility(!isVisible);
    setIsTextTrackVisible(!isVisible);
  }, [playerRef]);

  const selectTextTrack = useCallback((trackId: string | null) => {
    if (!playerRef.current) return;
    if (trackId === null) {
      playerRef.current.setTextTrackVisibility(false);
      setSelectedTextTrackId(null);
      setIsTextTrackVisible(false);
    } else {
      const track = playerRef.current.getTextTracks().find((t: any) => t.id.toString() === trackId);
      if (track) {
        playerRef.current.selectTextTrack(track);
        playerRef.current.setTextTrackVisibility(true);
        setSelectedTextTrackId(trackId);
        setIsTextTrackVisible(true);
      }
    }
  }, [playerRef]);

  const selectAudioLanguage = useCallback((language: string) => {
    if (!playerRef.current) return;
    if (language === "auto") {
      playerRef.current.selectAudioLanguage('');
      setSelectedAudioLanguage("auto");
    } else {
      playerRef.current.selectAudioLanguage(language);
      setSelectedAudioLanguage(language);
    }
  }, [playerRef]);

  return {
    videoTracks,
    setVideoTracks,
    selectedTrackId,
    setSelectedTrackId,
    activeTrackHeight,
    setActiveTrackHeight,
    textTracks,
    setTextTracks,
    selectedTextTrackId,
    setSelectedTextTrackId,
    isTextTrackVisible,
    setIsTextTrackVisible,
    audioLanguages,
    setAudioLanguages,
    selectedAudioLanguage,
    setSelectedAudioLanguage,
    selectTrack,
    toggleTextTrackVisibility,
    selectTextTrack,
    selectAudioLanguage,
  };
}
