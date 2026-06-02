import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TheaterFormInput } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationStepProps {
  register: UseFormRegister<TheaterFormInput>;
  setValue: UseFormSetValue<TheaterFormInput>;
  watchCity: string;
  watchState: string;
  divisionCities: Record<string, string[]>;
}

export function LocationStep({ register, setValue, watchCity, watchState, divisionCities }: LocationStepProps) {
  const [openCity, setOpenCity] = useState(false);
  const [openState, setOpenState] = useState(false);

  const divisions = Object.keys(divisionCities);
  const availableCities = watchState ? divisionCities[watchState] || [] : [];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-2">
        <Label
          htmlFor="address"
          className="text-xs font-bold text-foreground"
        >
          Full Physical Address
        </Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Level 5, Bashundhara City Shopping Mall, Panthapath..."
          className="rounded-lg bg-background text-xs h-9"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Division Selection */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold text-foreground">
            State / Division
          </Label>
          <Popover open={openState} onOpenChange={setOpenState}>
            <PopoverTrigger>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openState}
                className="w-full justify-between h-9 text-xs bg-background border-input shadow-xs hover:bg-muted/50 px-3"
              >
                {watchState
                  ? divisions.find((div) => div.toLowerCase() === watchState.toLowerCase()) || watchState
                  : "Select division..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 shadow-lg border-muted/50 rounded-xl" align="start">
              <Command>
                <CommandInput placeholder="Search division..." className="h-9 text-xs" />
                <CommandList>
                  <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">No division found.</CommandEmpty>
                  <CommandGroup>
                    {divisions.map((division) => (
                      <CommandItem
                        key={division}
                        value={division}
                        onSelect={(currentValue) => {
                          const exactMatch = divisions.find(d => d.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                          setValue("state", exactMatch, { shouldValidate: true });
                          // Clear city if it doesn't belong to the newly selected division
                          if (watchCity && !divisionCities[exactMatch]?.includes(watchCity)) {
                            setValue("city", "", { shouldValidate: true });
                          }
                          setOpenState(false);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        {division}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            watchState.toLowerCase() === division.toLowerCase() ? "opacity-100 text-indigo-500" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <input type="hidden" {...register("state", { required: "State/Division is required" })} value={watchState || ""} />
        </div>

        {/* City Selection (dependent on division) */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold text-foreground">
            City
          </Label>
          <Popover open={openCity} onOpenChange={setOpenCity}>
            <PopoverTrigger>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCity}
                disabled={!watchState || availableCities.length === 0}
                className="w-full justify-between h-9 text-xs bg-background border-input shadow-xs hover:bg-muted/50 px-3 disabled:opacity-50"
              >
                {watchCity
                  ? availableCities.find((city) => city.toLowerCase() === watchCity.toLowerCase()) || watchCity
                  : "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 shadow-lg border-muted/50 rounded-xl" align="start">
              <Command>
                <CommandInput placeholder="Search city..." className="h-9 text-xs" />
                <CommandList>
                  <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">No city found.</CommandEmpty>
                  <CommandGroup>
                    {availableCities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={(currentValue) => {
                          const exactMatch = availableCities.find(c => c.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                          setValue("city", exactMatch, { shouldValidate: true });
                          setOpenCity(false);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        {city}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            watchCity.toLowerCase() === city.toLowerCase() ? "opacity-100 text-indigo-500" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <input type="hidden" {...register("city", { required: "City is required" })} value={watchCity || ""} />
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="country"
            className="text-xs font-bold text-foreground"
          >
            Country
          </Label>
          <Input
            id="country"
            {...register("country", {
              required: "Country is required",
            })}
            placeholder="Bangladesh"
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="pincode"
            className="text-xs font-bold text-foreground"
          >
            ZIP / Pincode
          </Label>
          <Input
            id="pincode"
            {...register("pincode")}
            placeholder="1215"
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
      </div>

      <div className="p-3 bg-muted/20 border border-muted/50 rounded-xl space-y-3">
        <Label className="text-xs font-bold text-foreground block">
          GPS Parameters
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1">
            <Label
              htmlFor="latitude"
              className="text-[10px] uppercase font-semibold text-muted-foreground"
            >
              Latitude
            </Label>
            <Input
              id="latitude"
              {...register("latitude")}
              placeholder="e.g. 23.7508"
              className="h-9 rounded-lg font-mono text-xs bg-background"
            />
          </div>
          <div className="grid gap-1">
            <Label
              htmlFor="longitude"
              className="text-[10px] uppercase font-semibold text-muted-foreground"
            >
              Longitude
            </Label>
            <Input
              id="longitude"
              {...register("longitude")}
              placeholder="e.g. 90.3916"
              className="h-9 rounded-lg font-mono text-xs bg-background"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal">
          Interact directly with the map pane on the right side. You
          can click anywhere or drag the custom marker to
          auto-populate coordinates.
        </p>
      </div>
    </div>
  );
}
