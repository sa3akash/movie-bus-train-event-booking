import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, TrendingUp, Users, Banknote } from "lucide-react";
import { SeatType, getPreset } from "./utils";

function MultiplierBadge({ value }: { value: string }) {
  const n = parseFloat(value);
  const color =
    n <= 1
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : n <= 1.5
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : n <= 2
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}
    >
      <TrendingUp className="h-2.5 w-2.5" />
      ×{Number(value).toFixed(2)}
    </span>
  );
}

export function SeatTypeCard({
  st,
  index,
  onEdit,
  onDelete,
}: {
  st: SeatType;
  index: number;
  onEdit: (st: SeatType) => void;
  onDelete: (id: string) => void;
}) {
  const preset = getPreset(st.name, index);
  const Icon = preset.icon;
  const multiplier = parseFloat(st.priceMultiplier);

  return (
    <Card
      className={`border border-muted/80 shadow-xs hover:shadow-md transition-all group ring-0 hover:ring-2 ${preset.ring} hover:ring-offset-1`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div
            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center shadow-sm`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-indigo-600"
              onClick={() => onEdit(st)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(st.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <CardTitle className="text-base font-bold">{st.name}</CardTitle>
          <div 
            className="w-3 h-3 rounded-full border border-black/10" 
            style={{ backgroundColor: st.color }}
            title={`Color: ${st.color}`}
          />
        </div>
        <CardDescription className="text-xs">
          Seat category ·{" "}
          {st.capacity > 1 ? `${st.capacity}-person unit` : "Single seat"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Price Multiplier
          </span>
          <MultiplierBadge value={st.priceMultiplier} />
        </div>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Capacity
          </span>
          <span className="text-xs font-semibold text-foreground">
            {st.capacity} {st.capacity === 1 ? "person" : "persons"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5" /> Base Price
          </span>
          <span className="text-xs font-semibold text-foreground">
            {st.price} {st.currency}
          </span>
        </div>

        <div className="rounded-lg border border-dashed border-muted p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Calculated Final Price
          </p>
          <p className="text-sm font-bold text-foreground">
            {(st.price * multiplier).toFixed(0)} {st.currency}{" "}
            {multiplier > 1 && (
              <span className="text-[10px] text-emerald-600 font-medium">
                +{((multiplier - 1) * 100).toFixed(0)}%
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
