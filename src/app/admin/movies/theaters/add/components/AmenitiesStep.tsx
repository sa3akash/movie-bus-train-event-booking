import React from "react";
import { UseFormRegister, Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Car, Accessibility, Utensils, Phone, Mail, Globe, Check, Image as ImageIcon } from "lucide-react";
import { TheaterFormInput } from "../types";

interface AmenitiesStepProps {
  register: UseFormRegister<TheaterFormInput>;
  control: Control<TheaterFormInput>;
  availableFacilities: string[];
  handleFacilityToggle: (facility: string, currentFacilities: string[]) => void;
}

export function AmenitiesStep({
  register,
  control,
  availableFacilities,
  handleFacilityToggle,
}: AmenitiesStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-3 bg-muted/25 border border-muted/50 rounded-xl space-y-3">
        <Label className="text-xs font-bold text-foreground block">
          Branch Amenities Checklist
        </Label>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
            <input
              type="checkbox"
              {...register("parkingAvailable")}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Car className="h-3.5 w-3.5 text-indigo-500" /> Parking Available
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
            <input
              type="checkbox"
              {...register("wheelchairAccessible")}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Accessibility className="h-3.5 w-3.5 text-indigo-500" /> Wheelchair Access
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
            <input
              type="checkbox"
              {...register("foodAllowed")}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Utensils className="h-3.5 w-3.5 text-indigo-500" /> Food Allowed
            </span>
          </label>
        </div>
      </div>

      <div className="p-3 bg-muted/25 border border-muted/50 rounded-xl space-y-3">
        <Label className="text-xs font-bold text-foreground block">
          Advanced Screen Tech Features
        </Label>
        <Controller
          name="facilities"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableFacilities.map((fac) => {
                const isChecked = field.value.includes(fac);
                return (
                  <div
                    key={fac}
                    onClick={() => handleFacilityToggle(fac, field.value)}
                    className={`flex items-center gap-2 cursor-pointer text-[11px] p-2 rounded-lg border transition-all ${
                      isChecked
                        ? "bg-indigo-50/10 border-indigo-500/40 text-indigo-400 font-semibold"
                        : "bg-background border-muted hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isChecked && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <span>{fac}</span>
                  </div>
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="phone"
            className="text-xs font-bold text-foreground flex items-center gap-1"
          >
            <Phone className="h-3.5 w-3.5 text-indigo-500" /> Office Phone
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+88017..."
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-foreground flex items-center gap-1"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-500" /> Office Email
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="branch@cineplex.com"
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="website"
            className="text-xs font-bold text-foreground flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-500" /> Website URL
          </Label>
          <Input
            id="website"
            {...register("website")}
            placeholder="https://..."
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="logoUrl"
            className="text-xs font-bold text-foreground flex items-center gap-1"
          >
            <ImageIcon className="h-3.5 w-3.5 text-indigo-500" /> Logo Image URL
          </Label>
          <Input
            id="logoUrl"
            {...register("logoUrl")}
            placeholder="https://..."
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
      </div>
    </div>
  );
}
