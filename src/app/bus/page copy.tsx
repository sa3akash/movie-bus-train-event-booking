import React from "react";
import { busLayout } from "@/lib/data";
import { BusSeatSelector } from "./components/BusSeatSelector";

const BusPage = () => {
  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Select Your Seats</h1>
        <p className="text-muted-foreground mt-2">Premium Express • New York to Boston • 10:00 AM</p>
      </div>
      
      <BusSeatSelector layout={busLayout} maxSeats={4} />
    </div>
  );
};

export default BusPage;