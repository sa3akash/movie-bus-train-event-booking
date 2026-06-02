import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Armchair, Users, TrendingUp, Palette, Check, Hash } from "lucide-react";
import { SeatType, getPreset } from "./utils";
import { useForm, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FormValues {
  name: string;
  capacity: number;
  priceMultiplier: string;
  price: number;
  color: string;
  currency: string;
}

const CURRENCIES = ["BDT", "USD", "EUR", "INR", "GBP"];

const PREDEFINED_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
];

export function SeatTypeFormDialog({
  isOpen,
  setIsOpen,
  initialData,
  onSubmit,
  loading,
  mode = "add",
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  initialData?: Partial<SeatType>;
  onSubmit: (data: Partial<SeatType>) => void;
  loading: boolean;
  mode?: "add" | "edit";
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      capacity: 1,
      priceMultiplier: "1.00",
      price: 0,
      color: "#f59e0b",
      currency: "BDT",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        capacity: initialData?.capacity || 1,
        priceMultiplier: initialData?.priceMultiplier || "1.00",
        price: initialData?.price || 0,
        color: initialData?.color || "#f59e0b",
        currency: initialData?.currency || "BDT",
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmitForm = (data: FormValues) => {
    onSubmit({
      ...initialData,
      ...data,
    });
  };

  const watchName = watch("name", "");
  const watchPrice = watch("price", 0);
  const watchMultiplier = watch("priceMultiplier", "1.00");
  const watchCurrency = watch("currency", "BDT");
  const watchCapacity = watch("capacity", 1);

  const preset = getPreset(watchName || "standard", 0);
  const Icon = preset.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-indigo-500" />{" "}
              {mode === "add" ? "Add Seat Type" : "Edit Seat Type"}
            </DialogTitle>
            <DialogDescription>
              Set pricing, capacity, and visual indicators.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Category Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required", maxLength: 15 })}
                placeholder="e.g. VIP"
              />
              {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
            </div>

            {/* Custom Advanced Color Picker via Popover */}
            <div className="grid gap-2">
              <Label>Theme Color</Label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 justify-start text-left px-3 hover:bg-slate-50 transition-all font-medium border-slate-200 dark:border-slate-800"
                      >
                        <div
                          className="w-5 h-5 rounded-full border shadow-sm mr-3 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: field.value }}
                        />
                        <span className="text-sm font-mono tracking-tight text-slate-700 dark:text-slate-300">
                          {field.value.toUpperCase()}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-xl shadow-2xl border-slate-100 dark:border-slate-800" align="start">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                          <Palette className="w-4 h-4 text-indigo-500" /> Color Picker
                        </div>
                        
                        {/* Swatches Grid */}
                        <div className="grid grid-cols-4 gap-2.5">
                          {PREDEFINED_COLORS.map((c) => {
                            const isSelected = field.value.toLowerCase() === c.toLowerCase();
                            return (
                              <button
                                key={c}
                                type="button"
                                className={`h-10 w-full rounded-lg border shadow-xs transition-all flex items-center justify-center ${
                                  isSelected 
                                    ? "ring-2 ring-indigo-500 ring-offset-2 scale-105" 
                                    : "hover:scale-110 hover:shadow-md"
                                }`}
                                style={{ backgroundColor: c }}
                                onClick={() => field.onChange(c)}
                                title={c}
                              >
                                {isSelected && (
                                  <Check className="w-4 h-4 text-white drop-shadow-md" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Custom Hex Input */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <Label className="text-xs font-semibold text-slate-500">Custom HEX</Label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3 flex h-full items-center text-slate-400">
                              <Hash className="w-3.5 h-3.5" />
                            </div>
                            <Input
                              value={field.value.replace('#', '')}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                                field.onChange(val ? `#${val}` : '#');
                              }}
                              className="pl-8 h-9 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-indigo-500"
                              maxLength={6}
                            />
                            <div className="absolute right-1">
                               <div className="relative w-7 h-7 rounded-md shadow-sm border overflow-hidden cursor-pointer" style={{ backgroundColor: field.value }}>
                                 <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)} className="absolute opacity-0 w-20 h-20 -top-2 -left-2 cursor-pointer" title="Native Picker" />
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Base Price</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  {...register("price", { valueAsNumber: true, min: 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Capacity and Multiplier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">
                  Capacity <span className="text-muted-foreground text-[10px] font-normal">(per unit)</span>
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={10}
                  {...register("capacity", { valueAsNumber: true, min: 1, max: 10 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priceMultiplier">Price Multiplier</Label>
                <Input
                  id="priceMultiplier"
                  type="number"
                  step="0.01"
                  min="0.50"
                  max="9.99"
                  {...register("priceMultiplier", { min: 0.5, max: 9.99 })}
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-lg border border-muted bg-muted/30 p-3 flex items-center gap-3 mt-1">
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${preset.gradient} flex items-center justify-center shrink-0`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {watchName || "Preview"}
                  </p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {((watchPrice || 0) * parseFloat(watchMultiplier || "1")).toFixed(0)} {watchCurrency}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {watchCapacity} pax
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold bg-background text-indigo-600 border-indigo-100/50">
                    <TrendingUp className="h-2.5 w-2.5" />
                    ×{Number(watchMultiplier || "1").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Saving…" : mode === "add" ? "Create Type" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
