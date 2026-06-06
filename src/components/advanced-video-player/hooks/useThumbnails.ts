import { useRef, useCallback, RefObject } from "react";
import { ParsedThumbnail } from "../types";

export function useThumbnails({
  playerRef,
}: {
  playerRef: RefObject<any>;
}) {
  const thumbnailsRef = useRef<ParsedThumbnail[]>([]);

  // VTT Time Parser (HH:MM:SS.mmm or MM:SS.mmm to seconds)
  const parseVttTime = (timeStr: string) => {
    const parts = timeStr.trim().split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    } else if (parts.length === 2) {
      const [m, s] = parts;
      return parseInt(m) * 60 + parseFloat(s);
    }
    return parseFloat(timeStr) || 0;
  };

  const getThumbnail = useCallback(async (time: number) => {
    if (thumbnailsRef.current.length > 0) {
      const thumb = thumbnailsRef.current.find(t => time >= t.startTime && time <= t.endTime);
      if (thumb) {
        return {
          uris: [thumb.url],
          imageWidth: thumb.w,
          imageHeight: thumb.h,
          positionX: thumb.x,
          positionY: thumb.y,
        };
      }
    }
    
    if (playerRef.current) {
      try {
        const imageTracks = playerRef.current.getImageTracks();
        if (imageTracks && imageTracks.length > 0) {
          const thumb = await playerRef.current.getThumbnails(imageTracks[0].id, time);
          if (thumb) {
            const t = Array.isArray(thumb) ? thumb[0] : thumb;
            if (t) {
              return {
                uris: t.uris || (t.imageUri ? [t.imageUri] : []),
                imageWidth: t.width,
                imageHeight: t.height,
                positionX: t.positionX,
                positionY: t.positionY,
              };
            }
          }
        }
      } catch (e) {
        console.warn("Failed to get Shaka native thumbnail", e);
      }
    }
    
    return null;
  }, [playerRef]);

  const loadVttStoryboard = useCallback(async (storyboardUrl: string) => {
    if (!storyboardUrl || !storyboardUrl.endsWith('.vtt')) {
      if (storyboardUrl) {
        console.warn("Skipping legacy storyboard URL (not a VTT file):", storyboardUrl);
      }
      return;
    }

    try {
      const vttRes = await fetch(storyboardUrl);
      const vttText = await vttRes.text();
      
      const baseUrl = storyboardUrl.substring(0, storyboardUrl.lastIndexOf('/') + 1);
      const normalizedText = vttText.replace(/\r\n/g, '\n');
      const lines = normalizedText.split('\n');
      const parsedThumbnails: ParsedThumbnail[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const timeMatch = line.match(/(.*) --> (.*)/);
        
        if (timeMatch) {
          const startTime = parseVttTime(timeMatch[1]);
          const endTime = parseVttTime(timeMatch[2]);
          
          let urlLine = '';
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') {
              urlLine = lines[j].trim();
              break;
            }
          }
          
          if (urlLine) {
            const [filename, hash] = urlLine.split('#xywh=');
            if (hash) {
              const [x, y, w, h] = hash.split(',').map(Number);
              const isAbsolute = filename.startsWith('http://') || filename.startsWith('https://');
              parsedThumbnails.push({
                startTime,
                endTime,
                url: isAbsolute ? filename : baseUrl + filename,
                x, y, w, h
              });
            } else {
              const isAbsolute = urlLine.startsWith('http://') || urlLine.startsWith('https://');
              parsedThumbnails.push({
                startTime,
                endTime,
                url: isAbsolute ? urlLine : baseUrl + urlLine,
                x: 0, y: 0, w: 160, h: 90
              });
            }
          }
        }
      }
      thumbnailsRef.current = parsedThumbnails;
    } catch (e) {
      console.warn("Failed to fetch and parse storyboard VTT", e);
    }
  }, []);

  return {
    thumbnailsRef,
    getThumbnail,
    loadVttStoryboard,
  };
}
