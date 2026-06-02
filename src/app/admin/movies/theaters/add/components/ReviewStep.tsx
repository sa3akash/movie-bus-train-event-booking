import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, MapPin, Car, Globe } from "lucide-react";
import { TheaterFormInput, CineplexChain } from "../types";

interface ReviewStepProps {
  watchFormValues: TheaterFormInput;
  watchLatitude: string;
  watchLongitude: string;
  chains: CineplexChain[];
}

export function ReviewStep({
  watchFormValues,
  watchLatitude,
  watchLongitude,
  chains,
}: ReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-indigo-400">
            Ready to configure location
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Review Coordinates, Brand layout, and technical systems checklists below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-indigo-500" /> General Identity
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-bold text-foreground truncate max-w-[120px]">
                {watchFormValues.name}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Slug:</span>
              <span className="font-mono text-[10px] truncate max-w-[120px]">
                {watchFormValues.slug}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Chain:</span>
              <span className="truncate max-w-[120px]">
                {chains.find((c) => c.id === watchFormValues.cineplexChainId)?.name ||
                  "Independent"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Geographic Info
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Address:</span>
              <span className="truncate max-w-[120px]">
                {watchFormValues.address || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">City:</span>
              <span>{watchFormValues.city}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Coordinates:</span>
              <span className="font-mono text-indigo-400">
                {watchLatitude}, {watchLongitude}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
            <Car className="h-3.5 w-3.5 text-indigo-500" /> Features
          </h4>
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {watchFormValues.parkingAvailable && (
                <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">
                  Parking
                </Badge>
              )}
              {watchFormValues.wheelchairAccessible && (
                <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">
                  Wheelchair
                </Badge>
              )}
              {watchFormValues.foodAllowed && (
                <Badge variant="secondary" className="text-[8px] px-1 font-normal py-0">
                  Food
                </Badge>
              )}
            </div>
            {watchFormValues.facilities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {watchFormValues.facilities.map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    className="text-[8px] px-1 font-normal py-0"
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">
                None configured
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-indigo-500" /> Contacts
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Phone:</span>
              <span>{watchFormValues.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Email:</span>
              <span className="truncate max-w-[100px]">
                {watchFormValues.email || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
