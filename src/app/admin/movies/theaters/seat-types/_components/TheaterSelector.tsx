"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";

export function TheaterSelector({
  theaters,
  selectedTheaterId,
  onSelectTheater,
}: {
  theaters: any[];
  selectedTheaterId: string;
  onSelectTheater: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-muted">
      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
        <Building className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">
          Select Theater Context
        </Label>
        <Select
          value={selectedTheaterId}
          onValueChange={onSelectTheater}
        >
          <SelectTrigger className="w-[300px] h-9 bg-background">
            <SelectValue placeholder="Select a theater" />
          </SelectTrigger>
          <SelectContent>
            {theaters.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
