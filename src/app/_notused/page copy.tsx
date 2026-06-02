/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { seatsLayout } from "@/lib/data";
import React, { useState } from "react";

interface SeatPickerProps {
  layoutData: any;
  bookedSeats?: string[]; // e.g., ["A-1", "A-2"]
}

export const SeatPicker: React.FC<SeatPickerProps> = ({
  layoutData,
  bookedSeats = [],
}) => {
  const { rows, columns, seats } = layoutData;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Toggle seat selection
  const handleSeatClick = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* Screen Indicator */}
      <div
        style={{
          width: "80%",
          height: "8px",
          background: "#ccc",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
          paddingTop: "10px",
        }}
      >
        SCREEN
      </div>

      {/* Dynamic Seat Grid */}
      <div
        style={{
          display: "grid",
          // Dynamically sets the number of columns and rows based on your data
          gridTemplateColumns: `repeat(${columns}, minmax(30px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(30px, 1fr))`,
          gap: "8px",
          padding: "20px",
          // background: '#f9f9f9',
          borderRadius: "8px",
        }}
      >
        {seats.map((seat) => {
          const seatId = `${seat.row}-${seat.seatNumber}`;
          const isBooked = bookedSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);

          // Determine background color based on status
          let bgColor = "#4CAF50"; // Available (Green)
          if (isBooked)
            bgColor = "#D32F2F"; // Booked (Red)
          else if (isSelected) bgColor = "#FF9800"; // Selected (Orange)

          return (
            <button
              key={seatId}
              disabled={isBooked}
              onClick={() => handleSeatClick(seatId)}
              style={{
                // Absolutely position within the CSS Grid tracks using x and y
                gridColumnStart: seat.x + 1, // +1 because CSS grid is 1-indexed
                gridRowStart: seat.y + 1,
                width: "35px",
                height: "35px",
                backgroundColor: bgColor,
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: isBooked ? "not-allowed" : "pointer",
                fontSize: "10px",
                fontWeight: "bold",
                transition: "transform 0.1s ease",
              }}
              title={`Seat ${seat.row}${seat.seatNumber}`}
            >
              {seat.row}
              {seat.seatNumber}
            </button>
          );
        })}
      </div>

      {/* Summary Info */}
      <div>
        <h3>Selected Seats: {selectedSeats.join(", ") || "None"}</h3>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="h-screen">
      <SeatPicker layoutData={seatsLayout} />
    </div>
  );
}
