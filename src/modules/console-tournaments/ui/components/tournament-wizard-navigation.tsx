import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple";
import { Button } from "@/components/ui/button";

import { tournamentSteps } from "./tournament-wizard-types";

export function DesktopStepper({
  step,
  disabled,
  onSelectStep,
}: {
  step: number;
  disabled: boolean;
  onSelectStep: (step: number) => void;
}) {
  return (
    <nav aria-label="Tournament setup progress" className="mt-6 hidden overflow-x-auto pb-1 sm:block">
      <ol className="flex min-w-[560px] items-center">
        {tournamentSteps.map((label, index) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => index < step && onSelectStep(index)}
              aria-current={step === index ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${label}${index < step ? ", completed" : index === step ? ", current" : ""}`}
              disabled={index > step || disabled}
              className="group flex items-center gap-2 rounded-md text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${index < step ? "border-primary bg-primary text-primary-foreground" : index === step ? "border-primary bg-background text-primary" : "border-border bg-card text-muted-foreground"}`}>
                {index < step ? <Check aria-hidden="true" className="size-4" /> : index + 1}
              </span>
              <span className={`hidden text-xs font-medium sm:inline ${index === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
            {index < tournamentSteps.length - 1 && (
              <span aria-hidden="true" className={`mx-2 h-px flex-1 ${index < step ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function MobileProgress({ step, reducedMotion }: { step: number; reducedMotion: boolean }) {
  return (
    <div className="mt-6 sm:hidden">
      <div
        role="progressbar"
        aria-label="Tournament setup progress"
        aria-valuemin={1}
        aria-valuemax={tournamentSteps.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${tournamentSteps.length}: ${tournamentSteps[step]}`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-primary"
          initial={false}
          animate={{ scaleX: (step + 1) / tournamentSteps.length }}
          transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function WizardActions({
  step,
  transitioning,
  notice,
  onBack,
  onContinue,
  onFinish,
}: {
  step: number;
  transitioning: boolean;
  notice: boolean;
  onBack: () => void;
  onContinue: () => void;
  onFinish: () => void;
}) {
  return (
    <>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {step > 0 && (
            <Button type="button" variant="ghost" disabled={transitioning} onClick={onBack}>
              <ArrowLeft aria-hidden="true" />Back
            </Button>
          )}
        </div>
        {step < tournamentSteps.length - 1 ? (
          <RippleButton type="button" disabled={transitioning} onClick={onContinue} hoverScale={1.015} tapScale={0.98}>
            Continue<ArrowRight aria-hidden="true" /><RippleButtonRipples />
          </RippleButton>
        ) : (
          <RippleButton type="button" disabled={transitioning} onClick={onFinish} hoverScale={1.015} tapScale={0.98}>
            <Check aria-hidden="true" />Save as draft<RippleButtonRipples />
          </RippleButton>
        )}
      </div>
      {notice && (
        <div role="status" className="mt-4 rounded-lg border border-live/40 bg-live/10 p-4 text-sm">
          <p className="font-semibold">Draft check complete</p>
          <p className="mt-1 text-muted-foreground">Your tournament details are valid in this page. Nothing has been saved to the database.</p>
        </div>
      )}
    </>
  );
}
