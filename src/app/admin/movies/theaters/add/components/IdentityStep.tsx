import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TheaterFormInput, CineplexChain } from "../types";

interface IdentityStepProps {
  register: UseFormRegister<TheaterFormInput>;
  errors: FieldErrors<TheaterFormInput>;
  setValue: UseFormSetValue<TheaterFormInput>;
  chains: CineplexChain[];
}

export function IdentityStep({
  register,
  errors,
  setValue,
  chains,
}: IdentityStepProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    setValue(
      "slug",
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="text-xs font-bold text-foreground">
            Cineplex Brand / Chain
          </Label>
          <select
            {...register("cineplexChainId")}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Independent (No Chain)</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold text-foreground"
          >
            Branch Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name", {
              required: "Theater Name is required",
            })}
            onChange={handleNameChange}
            placeholder="e.g. Star Cineplex - Bashundhara City"
            className="rounded-lg bg-background text-xs h-9"
          />
          {errors.name && (
            <span className="text-rose-500 text-xs">
              {errors.name.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label
            htmlFor="slug"
            className="text-xs font-bold text-foreground"
          >
            Slug Identifier <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="slug"
            {...register("slug", { required: "Slug is required" })}
            placeholder="e.g. star-cineplex-bashundhara-city"
            className="rounded-lg bg-background text-xs h-9"
          />
          {errors.slug && (
            <span className="text-rose-500 text-xs">
              {errors.slug.message}
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="contactNumber"
            className="text-xs font-bold text-foreground"
          >
            Branch Direct Hotline
          </Label>
          <Input
            id="contactNumber"
            {...register("contactNumber")}
            placeholder="e.g. +88029966... / manager hotline"
            className="rounded-lg bg-background text-xs h-9"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="description"
          className="text-xs font-bold text-foreground"
        >
          Description / Profile
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Provide a detailed write-up about the branch capacity, screen specs, lobby size, parking etc..."
          rows={4}
          className="rounded-lg bg-background resize-none text-xs"
        />
      </div>
    </div>
  );
}
