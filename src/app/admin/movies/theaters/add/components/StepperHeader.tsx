import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface StepInfo {
  num: number;
  title: string;
  desc: string;
  icon: LucideIcon;
}

interface StepperHeaderProps {
  step: number;
  stepsList: StepInfo[];
  setStep: (step: number) => void;
}

export function StepperHeader({ step, stepsList, setStep }: StepperHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-muted hover:bg-muted/40 shadow-xs shrink-0"
          onClick={() => router.push("/admin/movies/theaters")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Add Multiplex Branch
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure details, coordinates, facilities, and contact parameters.
          </p>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Configuration progress</span>
          <span className="text-indigo-400 font-semibold">
            {step * 25}% Complete
          </span>
        </div>
        <div className="w-full bg-muted/45 h-1.5 rounded-full overflow-hidden border border-muted/20">
          <div
            className="bg-linear-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-muted/15 p-2 rounded-xl border border-muted/50">
        {stepsList.map((s) => {
          const StepIcon = s.icon;
          const isCompleted = step > s.num;
          const isActive = step === s.num;
          return (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                isActive
                  ? "bg-background border-indigo-600 shadow-xs"
                  : isCompleted
                    ? "bg-indigo-50/5 border-indigo-500/20 cursor-pointer hover:bg-indigo-50/10"
                    : "border-transparent opacity-50 pointer-events-none"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 text-center truncate w-full ${isActive ? "text-indigo-600" : ""}`}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
