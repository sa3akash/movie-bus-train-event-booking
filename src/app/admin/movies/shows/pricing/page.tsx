"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PricingRulesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Dynamic Pricing Rules
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure dynamic pricing multipliers for weekends, mornings, and VIP seats. (Coming Soon)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Strategy</CardTitle>
          <CardDescription>Rules engine for ticket pricing will be available here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
          <p className="text-muted-foreground font-medium">Pricing rules module is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
