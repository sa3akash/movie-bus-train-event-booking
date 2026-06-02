import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StepperFooterProps {
  step: number;
  isSubmitting: boolean;
  prevStep: () => void;
  nextStep: () => void;
}

export function StepperFooter({
  step,
  isSubmitting,
  prevStep,
  nextStep,
}: StepperFooterProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center pt-6 border-t border-muted/80">
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        disabled={step === 1}
        className="h-9 gap-1 rounded-lg border-muted text-xs"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/movies/theaters")}
          className="h-9 text-muted-foreground hover:text-foreground text-xs"
        >
          Cancel
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 gap-1 rounded-lg shadow-xs text-xs"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-9 gap-1.5 rounded-lg shadow-md text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Location...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Location
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
