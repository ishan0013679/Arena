"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { useGamesQuery } from "@/modules/games/queries/games";
import { useGameModesQuery, useModeTeamConfigsQuery } from "@/modules/games/queries/modes";

import { BasicDetailsStep } from "./basic-details-step";
import { GameTeamStep } from "./game-team-step";
import { PrizesRulesStep } from "./prizes-rules-step";
import { ReviewStep } from "./review-step";
import { ScheduleStep } from "./schedule-step";
import { DesktopStepper, MobileProgress, WizardActions } from "./tournament-wizard-navigation";
import {
  createPrize,
  createRule,
  emptyTournamentForm,
  slugify,
  stepDescriptions,
  tournamentSteps,
  validateTournament,
  type Prize,
  type TournamentErrors,
  type TournamentForm,
} from "./tournament-wizard-types";

export function TournamentWizard() {
  const [form, setForm] = useState<TournamentForm>(emptyTournamentForm);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errors, setErrors] = useState<TournamentErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [notice, setNotice] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocusRef = useRef(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const gamesQuery = useGamesQuery();
  const modesQuery = useGameModesQuery(form.game_id);
  const modes = modesQuery.data?.modes ?? [];
  const configurationsQuery = useModeTeamConfigsQuery(selectedModeId, {
    enabled: Boolean(selectedModeId),
  });
  const games = gamesQuery.data?.games ?? [];
  const configurations = configurationsQuery.data?.configurations ?? [];
  const selectedModeConfigurations = configurations.filter(
    (configuration) => configuration.mode_id === selectedModeId,
  );
  const selectedGame = games.find((game) => game.id === form.game_id);
  const selectedMode = modes.find((mode) => mode.id === selectedModeId);
  const selectedConfiguration = selectedModeConfigurations.find(
    (configuration) => configuration.id === form.mode_team_configuration_id,
  );
  const update = <K extends keyof TournamentForm>(key: K, value: TournamentForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const goToStep = (target: number, preserveErrors = false) => {
    if (target === step || isTransitioning) return;

    setDirection(target > step ? 1 : -1);
    if (!preserveErrors) setErrors({});
    setNotice(false);
    pendingFocusRef.current = true;
    setIsTransitioning(true);
    setStep(target);
  };

  const continueStep = () => {
    if (isTransitioning) return;

    const nextErrors = validateTournament(form, step);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];

    if (firstError) {
      requestAnimationFrame(() => {
        const fieldId = firstError.replaceAll(".", "-");
        const field = document.getElementById(fieldId)
          ?? document.querySelector<HTMLInputElement>(`input[name="${fieldId}"]`);
        field?.focus();
      });
      return;
    }

    goToStep(Math.min(step + 1, tournamentSteps.length - 1));
  };

  const finish = () => {
    const nextErrors = validateTournament(form, -1);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidStep = [0, 1, 2, 3].find(
        (index) => Object.keys(validateTournament(form, index)).length > 0,
      );
      if (firstInvalidStep !== undefined) goToStep(firstInvalidStep, true);
      return;
    }
    setNotice(true);
  };

  const updatePrize = (id: string, patch: Partial<Prize>) => {
    update("prizes", form.prizes.map((prize) => prize.id === id ? { ...prize, ...patch } : prize));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[`prizes.${id}.${key}`];
      if (patch.prize_type && patch.prize_type !== "cash") {
        delete next[`prizes.${id}.cash_amount`];
        delete next[`prizes.${id}.currency`];
      }
      return next;
    });
  };

  const updateRule = (id: string, patch: Partial<TournamentForm["rules"][number]>) => {
    update("rules", form.rules.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[`rules.${id}.${key}`];
      return next;
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-w-0 flex-1 bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
              <li>
                <Link href="/console/games" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Console
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="size-3" /></li>
              <li>
                <Link href="/console/tournaments" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Tournaments
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="size-3" /></li>
              <li aria-current="page" className="text-foreground">Create</li>
            </ol>
          </nav>

          <header className="border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2 text-eyebrow">
              <span>TOURNAMENT SETUP</span>
              <span aria-hidden="true">/</span>
              <span className="hidden sm:inline">STEP {step + 1} OF {tournamentSteps.length}</span>
            </div>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl">
                  Create tournament
                </h1>
                <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
                  Set up the details, configuration, schedule, prizes, and rules for a new Arena event.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">
                <span className="size-2 rounded-full bg-muted-foreground" />Not saved
              </span>
            </div>
          </header>

          <DesktopStepper
            step={step}
            disabled={isTransitioning}
            onSelectStep={goToStep}
          />
          <MobileProgress step={step} reducedMotion={prefersReducedMotion} />

          <motion.section
            aria-labelledby="step-heading"
            layout
            transition={{ layout: { duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" } }}
            className="mt-6 min-w-0"
          >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={{
                  enter: (value: number) => ({ opacity: 0, x: prefersReducedMotion ? 0 : value > 0 ? 16 : -16 }),
                  center: { opacity: 1, x: 0 },
                  exit: (value: number) => ({ opacity: 0, x: prefersReducedMotion ? 0 : value > 0 ? -16 : 16 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                onAnimationComplete={(definition) => {
                  if (definition === "center" && pendingFocusRef.current) {
                    pendingFocusRef.current = false;
                    setIsTransitioning(false);
                    stepHeadingRef.current?.focus({ preventScroll: true });
                  }
                }}
              >
                <div className="mb-6 border-b border-border pb-5">
                  <p className="text-eyebrow">STEP {step + 1}</p>
                  <h2
                    id="step-heading"
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="mt-1 rounded-sm font-display text-2xl font-black tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {tournamentSteps[step]}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
                </div>

                {step === 0 && (
                  <BasicDetailsStep
                    form={form}
                    errors={errors}
                    onNameChange={(name) => {
                      update("name", name);
                      if (!slugTouched) update("slug", slugify(name));
                    }}
                    onSlugChange={(slug) => {
                      setSlugTouched(true);
                      update("slug", slug);
                    }}
                    onDescriptionChange={(description) => update("description", description)}
                    onFormatChange={(format) => update("tournament_format", format)}
                  />
                )}
                {step === 1 && (
                  <GameTeamStep
                    games={games}
                    modes={modes}
                    configurations={configurations}
                    selectedGameId={form.game_id}
                    selectedModeId={selectedModeId}
                    selectedConfigurationId={form.mode_team_configuration_id}
                    errors={errors}
                    gamesLoading={gamesQuery.isLoading}
                    gamesError={gamesQuery.isError}
                    modesLoading={Boolean(form.game_id) && modesQuery.isLoading}
                    modesError={Boolean(form.game_id) && modesQuery.isError}
                    configurationsLoading={Boolean(selectedModeId) && configurationsQuery.isLoading}
                    configurationsError={Boolean(selectedModeId) && configurationsQuery.isError}
                    onGameChange={(gameId) => {
                      update("game_id", gameId);
                      update("mode_team_configuration_id", "");
                      setSelectedModeId("");
                    }}
                    onModeChange={(modeId) => {
                      setSelectedModeId(modeId);
                      update("mode_team_configuration_id", "");
                    }}
                    onConfigurationChange={(configurationId) => update("mode_team_configuration_id", configurationId)}
                  />
                )}
                {step === 2 && <ScheduleStep form={form} errors={errors} onChange={update} />}
                {step === 3 && (
                  <PrizesRulesStep
                    prizes={form.prizes}
                    rules={form.rules}
                    errors={errors}
                    onAddPrize={() => update("prizes", [...form.prizes, createPrize()])}
                    onRemovePrize={(id) => update("prizes", form.prizes.filter((prize) => prize.id !== id))}
                    onUpdatePrize={updatePrize}
                    onAddRule={() => update("rules", [...form.rules, createRule()])}
                    onRemoveRule={(id) => update("rules", form.rules.filter((rule) => rule.id !== id))}
                    onUpdateRule={updateRule}
                  />
                )}
                {step === 4 && (
                  <ReviewStep
                    form={form}
                    game={selectedGame}
                    mode={selectedMode}
                    configuration={selectedConfiguration}
                    onEditStep={goToStep}
                  />
                )}

                <WizardActions
                  step={step}
                  transitioning={isTransitioning}
                  notice={notice}
                  onBack={() => goToStep(step - 1)}
                  onContinue={continueStep}
                  onFinish={finish}
                />
              </motion.div>
            </AnimatePresence>
          </motion.section>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            All tournaments in this setup are drafts. You can review and revise details before any future publishing workflow.
          </p>
        </div>
      </main>
    </MotionConfig>
  );
}
