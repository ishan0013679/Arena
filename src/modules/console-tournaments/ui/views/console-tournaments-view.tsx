import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Gamepad2,
  Trophy,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const setupSteps = [
  {
    number: "01",
    title: "Set the details",
    description: "Name the event, pick its format, and choose a game setup.",
    icon: Gamepad2,
  },
  {
    number: "02",
    title: "Plan the event",
    description: "Set registration dates, entry limits, prizes, and rules.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Review as a draft",
    description: "Check every section before the draft workflow is connected.",
    icon: ClipboardCheck,
  },
];

export function ConsoleTournamentsView() {
  return (
    <main className="min-w-0 flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-10 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
            <li>
              <Link
                href="/console/games"
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Console
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="text-foreground">
              Tournaments
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-7">
          <div className="min-w-0">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              <span className="size-1.5 bg-primary" aria-hidden="true" />
              Competition control
            </p>
            <h1 className="font-display text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
              Tournaments
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Create and manage Arena events from one place. Tournament listings
              will appear here when management data is connected.
            </p>
          </div>
          <Link
            href="/console/tournaments/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full gap-2 px-4 font-semibold sm:w-auto",
            )}
          >
            Create tournament
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </header>

        <section aria-labelledby="workspace-heading" className="mt-7 sm:mt-9">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">EVENT OPERATIONS</p>
              <h2
                id="workspace-heading"
                className="mt-1 font-display text-2xl font-black tracking-[-0.05em] sm:text-3xl"
              >
                Tournament workspace
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDashed aria-hidden="true" className="size-3.5" />
              Listing not connected
            </span>
          </div>

          <div className="relative isolate overflow-hidden border border-border bg-slab text-slab-foreground">
            <div
              aria-hidden="true"
              className="arena-grid-slab absolute inset-0 -z-10 opacity-70"
            />
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
            <div className="grid min-h-[300px] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="flex flex-col justify-center border-b border-slab-foreground/15 p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-12">
                <div className="mb-7 flex size-12 items-center justify-center border border-primary/60 bg-primary/10 text-primary">
                  <Trophy aria-hidden="true" className="size-5" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Your event board
                </p>
                <h3 className="mt-2 max-w-lg font-display text-3xl font-black leading-[0.98] tracking-[-0.055em] sm:text-4xl">
                  The next tournament starts with a draft.
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slab-foreground/65">
                  Tournament records are not available in this view yet. You can
                  explore the creation workflow, review its details, and see the
                  UI-only draft confirmation.
                </p>
                <Link
                  href="/console/tournaments/new"
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border border-slab-foreground/30 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Start a tournament draft
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-slab-foreground/15 pb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-slab-foreground/55">
                  <span>Creation flow</span>
                  <span>01 — 03</span>
                </div>
                <ol className="divide-y divide-slab-foreground/15">
                  {setupSteps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <li key={step.number} className="flex gap-4 py-4 first:pt-1 last:pb-1">
                        <span className="pt-0.5 font-mono text-[10px] text-primary">
                          {step.number}
                        </span>
                        <span className="flex size-9 shrink-0 items-center justify-center border border-slab-foreground/15 bg-slab-foreground/[0.03] text-slab-foreground/70">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-lg font-bold tracking-[-0.03em]">
                            {step.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slab-foreground/60">
                            {step.description}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-4 flex flex-col gap-1 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>No tournament records are shown because listing data is not connected.</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
            Draft workflow · UI only
          </span>
        </footer>
      </div>
    </main>
  );
}
