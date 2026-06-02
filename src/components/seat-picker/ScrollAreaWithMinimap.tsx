import React, { useRef, useState, useEffect, useCallback } from "react";
import { Minimap } from "./Minimap";
import { ProcessedSeat, ViewportState } from "./types";

interface ScrollAreaWithMinimapProps {
  children: React.ReactNode;
  processedSeats: ProcessedSeat[];
  selectedSeats: Set<string>;
  bookedSeats: Set<string>;
  columns: number;
}

export const ScrollAreaWithMinimap: React.FC<ScrollAreaWithMinimapProps> = ({
  children,
  processedSeats,
  selectedSeats,
  bookedSeats,
  columns,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scrollWidth: 0,
    scrollHeight: 0,
  });

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setViewport({
      x: el.scrollLeft,
      y: el.scrollTop,
      width: el.clientWidth,
      height: el.clientHeight,
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
    });

    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial measure
    handleScroll();

    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });

    resizeObserver.observe(el);
    el.addEventListener("scroll", scrollListener);
    window.addEventListener("resize", handleScroll);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", scrollListener);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const handleMinimapClick = useCallback((x: number, y: number) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({
      left: x * el.scrollWidth - el.clientWidth / 2,
      top: y * el.scrollHeight - el.clientHeight / 2,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="overflow-auto py-4"
      >
        {children}
      </div>

      <Minimap
        viewport={viewport}
        processedSeats={processedSeats}
        selectedSeats={selectedSeats}
        bookedSeats={bookedSeats}
        columns={columns}
        isScrolling={isScrolling}
        onMinimapClick={handleMinimapClick}
      />
    </>
  );
};
