"use client";

import { cloneElement, isValidElement, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Plus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGamesQuery } from "@/modules/games/queries/games";
import { useGameModesQuery, useModeTeamConfigsQuery } from "@/modules/games/queries/modes";

type PrizeType = "" | "cash" | "physical_goods" | "coupon" | "other";
type RuleCategory = "" | "eligibility" | "gameplay" | "conduct" | "technical" | "other";
type RuleSeverity = "" | "info" | "minor" | "major" | "critical";
type Penalty = "" | "none" | "warning" | "point_deduction" | "match_forfeit" | "disqualification" | "other";
type Prize = { id: string; place: string; prize_type: PrizeType; description: string; cash_amount: string; currency: string; quantity: string };
type Rule = { id: string; title: string; description: string; category: RuleCategory; severity: RuleSeverity; penalty_policy: Penalty };
type Form = {
  name: string; slug: string; description: string; tournament_format: "single_stage" | "multi_stage" | "";
  game_id: string; mode_team_configuration_id: string; max_entries: string;
  registration_opens_at: string; registration_closes_at: string; starts_at: string; ends_at: string;
  prizes: Prize[]; rules: Rule[];
};
type Errors = Record<string, string>;

const steps = ["Basic details", "Game & teams", "Registration & schedule", "Prizes & rules", "Review"];
const optionLabels: Record<string, string> = {
  single_stage: "Single stage", multi_stage: "Multi-stage",
  cash: "Cash", physical_goods: "Physical goods", coupon: "Coupon", other: "Other",
  eligibility: "Eligibility", gameplay: "Gameplay", conduct: "Conduct", technical: "Technical",
  info: "Info", minor: "Minor", major: "Major", critical: "Critical",
  none: "No penalty", warning: "Warning", point_deduction: "Point deduction",
  match_forfeit: "Match forfeit", disqualification: "Disqualification",
};

const emptyForm: Form = {
  name: "", slug: "", description: "", tournament_format: "", game_id: "",
  mode_team_configuration_id: "", max_entries: "", registration_opens_at: "",
  registration_closes_at: "", starts_at: "", ends_at: "", prizes: [], rules: [],
};

function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function validate(form: Form, step: number): Errors {
  const errors: Errors = {};
  const add = (key: string, message: string) => { errors[key] = message; };
  if (step === 0 || step === -1) {
    if (!form.name.trim()) add("name", "Enter a tournament name.");
    if (!form.slug.trim()) add("slug", "Enter a slug.");
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) add("slug", "Use lowercase letters and numbers separated by single hyphens.");
    if (form.tournament_format !== "single_stage" && form.tournament_format !== "multi_stage") add("tournament_format", "Choose a tournament format.");
  }
  if (step === 1 || step === -1) {
    if (!form.game_id) add("game_id", "Choose a game.");
    if (!form.mode_team_configuration_id) add("mode_team_configuration_id", "Choose a team configuration.");
  }
  if (step === 2 || step === -1) {
    if (!/^\d+$/.test(form.max_entries) || Number(form.max_entries) < 1 || Number(form.max_entries) > 2147483647) add("max_entries", "Enter a positive whole number within the supported range.");
    const open = form.registration_opens_at;
    const close = form.registration_closes_at;
    const start = form.starts_at;
    if (!open) add("registration_opens_at", "Choose when registration opens.");
    if (!close) add("registration_closes_at", "Choose when registration closes.");
    if (!start) add("starts_at", "Choose when the tournament starts.");
    if (open && close && open >= close) add("registration_closes_at", "Registration must close after it opens.");
    if (close && start && close > start) add("starts_at", "The tournament must start at or after registration closes.");
    if (form.ends_at && start && form.ends_at < start) add("ends_at", "The end time cannot be before the start.");
  }
  if (step === 3 || step === -1) {
    form.prizes.forEach((prize) => {
      const p = `prizes.${prize.id}`;
      if (!prize.prize_type) add(`${p}.prize_type`, "Choose a prize type.");
      if (!/^\d+$/.test(prize.place) || Number(prize.place) < 1 || Number(prize.place) > 2147483647) add(`${p}.place`, "Place must be a positive whole number within the supported range.");
      if (!prize.description.trim()) add(`${p}.description`, "Enter a prize description.");
      if (prize.prize_type === "cash") {
        if (prize.cash_amount === "" || !Number.isFinite(Number(prize.cash_amount)) || Number(prize.cash_amount) < 0 || Number(prize.cash_amount) > 9999999999.99 || !/^\d+(?:\.\d{1,2})?$/.test(prize.cash_amount)) add(`${p}.cash_amount`, "Enter an amount from 0 to 9,999,999,999.99, up to two decimal places.");
        if (!/^[A-Z]{3}$/.test(prize.currency)) add(`${p}.currency`, "Use a three-letter uppercase currency code.");
      }
      if (prize.quantity && (!/^\d+$/.test(prize.quantity) || Number(prize.quantity) < 1 || Number(prize.quantity) > 2147483647)) add(`${p}.quantity`, "Quantity must be a positive whole number within the supported range.");
    });
    form.rules.forEach((rule) => {
      const p = `rules.${rule.id}`;
      if (!rule.title.trim()) add(`${p}.title`, "Enter a rule title.");
      if (!rule.description.trim()) add(`${p}.description`, "Enter a rule description.");
      if (!rule.category) add(`${p}.category`, "Choose a category.");
      if (!rule.severity) add(`${p}.severity`, "Choose a severity.");
      if (!rule.penalty_policy) add(`${p}.penalty_policy`, "Choose a penalty policy.");
    });
  }
  return errors;
}

function Field({ label, id, error, children, required = false, hint }: { label: string; id: string; error?: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;
  return <div className="min-w-0 space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}{required && <span aria-hidden="true" className="ml-1 text-primary">*</span>}</label>
    {control}
    {hint && !error && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}

function SelectControl({ id, value, onChange, children, invalid, "aria-invalid": ariaInvalid, "aria-describedby": describedBy }: { id: string; value: string; onChange: (value: string) => void; children: React.ReactNode; invalid?: boolean; "aria-invalid"?: boolean; "aria-describedby"?: string }) {
  return <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={invalid || ariaInvalid || undefined}
    aria-describedby={describedBy}
    className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20">
    {children}
  </select>;
}

function InputControl({ id, value, onChange, type = "text", invalid, ...props }: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & { id: string; value: string; onChange: (value: string) => void; invalid?: boolean }) {
  return <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} type={type}
    aria-invalid={invalid || undefined} {...props} className={`h-10 ${props.className ?? ""}`} />;
}

function makePrize(): Prize { return { id: crypto.randomUUID(), place: "", prize_type: "", description: "", cash_amount: "", currency: "", quantity: "" }; }
function makeRule(): Rule { return { id: crypto.randomUUID(), title: "", description: "", category: "", severity: "", penalty_policy: "" }; }

export function TournamentWizard() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [notice, setNotice] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const gamesQuery = useGamesQuery();
  const modesQuery = useGameModesQuery(form.game_id);
  const modes = modesQuery.data?.modes ?? [];
  const actualConfigsQuery = useModeTeamConfigsQuery(selectedModeId, { enabled: Boolean(selectedModeId) });
  const games = gamesQuery.data?.games ?? [];
  const configs = actualConfigsQuery.data?.configurations ?? [];
  const selectedGame = games.find((game) => game.id === form.game_id);
  const selectedConfig = configs.find((config) => config.id === form.mode_team_configuration_id);
  const selectedMode = modes.find((mode) => mode.id === selectedModeId);
  const busy = gamesQuery.isLoading || (Boolean(form.game_id) && modesQuery.isLoading) || (Boolean(selectedModeId) && actualConfigsQuery.isLoading);
  const formatDate = (value: string) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not set";
  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => { const next = { ...current }; delete next[key]; return next; });
  };
  const error = (key: string) => errors[key];
  const editStep = (target: number) => {
    setErrors({}); setNotice(false); setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };
  const continueStep = () => {
    const nextErrors = validate(form, step);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      requestAnimationFrame(() => document.getElementById(firstError.replaceAll(".", "-"))?.focus());
      return;
    }
    editStep(Math.min(step + 1, 4));
  };
  const finish = () => {
    const nextErrors = validate(form, -1);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstStep = [0, 1, 2, 3].find((index) => Object.keys(validate(form, index)).length > 0);
      if (firstStep !== undefined) {
        setNotice(false);
        setStep(firstStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
        requestAnimationFrame(() => stepHeadingRef.current?.focus());
      }
      return;
    }
    setNotice(true);
  };
  const removePrize = (id: string) => update("prizes", form.prizes.filter((item) => item.id !== id));
  const removeRule = (id: string) => update("rules", form.rules.filter((item) => item.id !== id));
  const clearRowErrors = (prefix: string, patch: object) => setErrors((current) => {
    const next = { ...current };
    for (const key of Object.keys(patch)) delete next[`${prefix}.${key}`];
    return next;
  });
  const updatePrize = (id: string, patch: Partial<Prize>) => {
    update("prizes", form.prizes.map((item) => item.id === id ? { ...item, ...patch } : item));
    clearRowErrors(`prizes.${id}`, patch);
    if (patch.prize_type && patch.prize_type !== "cash") {
      clearRowErrors(`prizes.${id}`, { cash_amount: "", currency: "" });
    }
  };
  const updateRule = (id: string, patch: Partial<Rule>) => {
    update("rules", form.rules.map((item) => item.id === id ? { ...item, ...patch } : item));
    clearRowErrors(`rules.${id}`, patch);
  };
  const prizeErrors = errors;
  const fieldId = (key: string) => key.replaceAll(".", "-");

  return <main className="min-w-0 flex-1 bg-background text-foreground">
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
          <li><Link href="/console/games" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Console</Link></li><li aria-hidden="true"><ChevronRight className="size-3" /></li>
          <li><Link href="/console/tournaments" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Tournaments</Link></li><li aria-hidden="true"><ChevronRight className="size-3" /></li><li aria-current="page" className="text-foreground">Create</li>
        </ol>
      </nav>
      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-eyebrow"><span>TOURNAMENT SETUP</span><span aria-hidden="true">/</span><span>STEP {step + 1} OF 5</span></div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="font-display text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl">Create tournament</h1><p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">Set up the details, configuration, schedule, prizes, and rules for a new Arena event.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium"><span className="size-2 rounded-full bg-muted-foreground" /> Saved as draft</span>
        </div>
      </header>

      <nav aria-label="Tournament setup progress" className="mt-6 overflow-x-auto pb-1">
        <ol className="flex min-w-[560px] items-center">
          {steps.map((label, index) => <li key={label} className="flex flex-1 items-center last:flex-none">
            <button type="button" onClick={() => index < step && editStep(index)} aria-current={step === index ? "step" : undefined} aria-label={`Step ${index + 1}: ${label}${index < step ? ", completed" : index === step ? ", current" : ""}`} disabled={index > step}
              className="group flex items-center gap-2 rounded-md text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${index < step ? "border-primary bg-primary text-primary-foreground" : index === step ? "border-primary bg-background text-primary" : "border-border bg-card text-muted-foreground"}`}>{index < step ? <Check aria-hidden="true" className="size-4" /> : index + 1}</span>
              <span className={`hidden text-xs font-medium sm:inline ${index === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </button>
            {index < steps.length - 1 && <span aria-hidden="true" className={`mx-2 h-px flex-1 ${index < step ? "bg-primary" : "bg-border"}`} />}
          </li>)}
        </ol>
      </nav>

      <section aria-labelledby="step-heading" className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6 lg:p-8">
        <div className="mb-6 border-b border-border pb-5">
          <p className="text-eyebrow">STEP {step + 1}</p>
          <h2 id="step-heading" ref={stepHeadingRef} tabIndex={-1} className="mt-1 rounded-sm font-display text-2xl font-black tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{steps[step]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{["Give your tournament a name and choose its format.", "Choose a game and a team configuration supported by that game.", "Set entry capacity and the event timeline.", "Add optional prizes and the rules participants will follow.", "Check every section before keeping this as a draft."][step]}</p>
        </div>

        {step === 0 && <div className="grid gap-5">
          <Field id="name" label="Tournament name" required error={error("name")}><InputControl id="name" value={form.name} onChange={(value) => { update("name", value); if (!slugTouched) update("slug", slugify(value)); }} placeholder="e.g. Arena Open #1" invalid={Boolean(error("name"))} aria-describedby={error("name") ? "name-error" : undefined} /></Field>
          <Field id="slug" label="Slug" required error={error("slug")} hint="Used in the tournament URL. You can edit it at any time before saving." ><div className="flex min-w-0 items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"><span className="hidden shrink-0 pl-3 text-sm text-muted-foreground sm:inline">arena.gg/tournaments/</span><InputControl id="slug" value={form.slug} onChange={(value) => { setSlugTouched(true); update("slug", value); }} placeholder="arena-open-1" autoCapitalize="none" autoCorrect="off" spellCheck={false} invalid={Boolean(error("slug"))} aria-describedby={error("slug") ? "slug-error" : undefined} className="border-0 focus-visible:border-0 focus-visible:ring-0" /></div></Field>
          <Field id="description" label="Description" hint="Optional. A short overview for participants."><Textarea id="description" value={form.description} onChange={(event) => update("description", event.target.value)} rows={4} placeholder="What should participants know about this tournament?" /></Field>
          <Field id="tournament_format" label="Tournament format" required error={error("tournament_format")} hint="Choose whether the event runs in one stage or multiple stages."><SelectControl id="tournament_format" value={form.tournament_format} onChange={(value) => update("tournament_format", value as Form["tournament_format"])} invalid={Boolean(error("tournament_format"))}><option value="">Select a format</option><option value="single_stage">Single stage</option><option value="multi_stage">Multi-stage</option></SelectControl></Field>
        </div>}

        {step === 1 && <div className="grid gap-5">
          <Field id="game_id" label="Game" required error={error("game_id")} hint="Only active game modes and their team configurations can be selected.">
            <SelectControl id="game_id" value={form.game_id} invalid={Boolean(error("game_id"))} onChange={(value) => { update("game_id", value); update("mode_team_configuration_id", ""); setSelectedModeId(""); }}><option value="">Select a game</option>{games.filter((game) => game.status === "active").map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</SelectControl>
            {gamesQuery.isLoading && <p role="status" className="text-xs text-muted-foreground">Loading available games…</p>}
            {gamesQuery.isError && <p role="alert" className="text-sm text-destructive">Game choices are unavailable. Try again later.</p>}
            {!gamesQuery.isLoading && !gamesQuery.isError && games.filter((game) => game.status === "active").length === 0 && <p role="status" className="text-sm text-muted-foreground">No active games are available yet.</p>}
          </Field>
          {form.game_id && <>
          <Field id="mode_id" label="Game mode" required hint="Choose a mode to see its configured team sizes.">
            <SelectControl id="mode_id" value={selectedModeId} onChange={(value) => { setSelectedModeId(value); update("mode_team_configuration_id", ""); }}><option value="">Select a mode</option>{modes.filter((mode) => mode.active).map((mode) => <option key={mode.id} value={mode.id}>{mode.name}</option>)}</SelectControl>
            {modesQuery.isLoading && <p role="status" className="text-xs text-muted-foreground">Loading available modes…</p>}
            {!modesQuery.isLoading && !modesQuery.isError && modes.filter((mode) => mode.active).length === 0 && <p role="status" className="text-sm text-muted-foreground">No active modes are available for this game.</p>}
          </Field>
          <Field id="mode_team_configuration_id" label="Team configuration" required error={error("mode_team_configuration_id")} hint="This is the configuration stored for the tournament.">
            <SelectControl id="mode_team_configuration_id" value={form.mode_team_configuration_id} invalid={Boolean(error("mode_team_configuration_id"))} onChange={(value) => update("mode_team_configuration_id", value)}><option value="">{selectedModeId ? "Select a team configuration" : "Select a game mode first"}</option>{configs.map((config) => <option key={config.id} value={config.id}>{config.name} · {config.team_size} {config.team_size === 1 ? "player" : "players"}</option>)}</SelectControl>
            {(modesQuery.isLoading || actualConfigsQuery.isLoading) && <p role="status" className="text-xs text-muted-foreground">Loading modes and team configurations…</p>}
            {modesQuery.isError || actualConfigsQuery.isError ? <p role="alert" className="text-sm text-destructive">Mode or team configuration choices are unavailable. Try again later.</p> : null}
            {!busy && !modesQuery.isError && !actualConfigsQuery.isError && configs.length === 0 && <p role="status" className="text-sm text-muted-foreground">This mode does not have a team configuration yet.</p>}
          </Field>
          </>}
          {selectedConfig && <div className="rounded-lg border border-border bg-background p-4"><p className="text-eyebrow">SELECTED CONFIGURATION</p><p className="mt-1 font-medium">{selectedGame?.name} · {selectedMode?.name}</p><p className="mt-1 text-sm text-muted-foreground">{selectedConfig.name} · {selectedConfig.team_size} {selectedConfig.team_size === 1 ? "player" : "players"} per team</p></div>}
          {!form.game_id && <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Choose a game to see its available modes and team sizes.</div>}
        </div>}

        {step === 2 && <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field id="max_entries" label="Maximum entries" required error={error("max_entries")} hint="Enter the maximum number of teams or entries for this tournament."><InputControl id="max_entries" type="number" min="1" step="1" inputMode="numeric" value={form.max_entries} onChange={(value) => update("max_entries", value)} placeholder="64" invalid={Boolean(error("max_entries"))} /></Field></div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">Date and time values use your local timezone.</p>
          <Field id="registration_opens_at" label="Registration opens" required error={error("registration_opens_at")}><InputControl id="registration_opens_at" type="datetime-local" value={form.registration_opens_at} onChange={(value) => update("registration_opens_at", value)} invalid={Boolean(error("registration_opens_at"))} /></Field>
          <Field id="registration_closes_at" label="Registration closes" required error={error("registration_closes_at")}><InputControl id="registration_closes_at" type="datetime-local" value={form.registration_closes_at} onChange={(value) => update("registration_closes_at", value)} invalid={Boolean(error("registration_closes_at"))} /></Field>
          <Field id="starts_at" label="Tournament starts" required error={error("starts_at")}><InputControl id="starts_at" type="datetime-local" value={form.starts_at} onChange={(value) => update("starts_at", value)} invalid={Boolean(error("starts_at"))} /></Field>
          <Field id="ends_at" label="Tournament ends" error={error("ends_at")} hint="Optional. Leave blank if the end time is not known yet."><InputControl id="ends_at" type="datetime-local" value={form.ends_at} onChange={(value) => update("ends_at", value)} invalid={Boolean(error("ends_at"))} /></Field>
        </div>}

        {step === 3 && <div className="space-y-9">
          <section aria-labelledby="prizes-heading">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 id="prizes-heading" className="font-display text-xl font-black tracking-[-0.04em]">Prizes <span className="font-body text-sm font-normal text-muted-foreground">(optional)</span></h3><p className="mt-1 text-sm text-muted-foreground">Define prizes by finishing place.</p></div><Button type="button" variant="outline" onClick={() => update("prizes", [...form.prizes, makePrize()])}><Plus aria-hidden="true" />Add prize</Button></div>
            {!form.prizes.length ? <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center"><p className="text-sm font-medium">No prizes added</p><p className="mt-1 text-sm text-muted-foreground">Add prize details when they are ready. Prizes can also be left empty.</p></div> : <div className="space-y-4">
              {form.prizes.map((prize, index) => { const key = `prizes.${prize.id}`; return <fieldset key={prize.id} className="min-w-0 rounded-lg border border-border p-4 sm:p-5"><legend className="sr-only">Prize {index + 1}</legend>
                <div className="mb-4 flex items-center justify-between gap-3"><p className="font-medium">Prize {index + 1}</p><Button type="button" variant="ghost" size="sm" aria-label={`Remove prize ${index + 1}`} onClick={() => removePrize(prize.id)}><Trash2 aria-hidden="true" />Remove</Button></div>
                <div className="grid gap-4 sm:grid-cols-2"><Field id={`${fieldId(`${key}.place`)}`} label="Place" required error={prizeErrors[`${key}.place`]}><InputControl id={fieldId(`${key}.place`)} type="number" min="1" step="1" value={prize.place} onChange={(value) => updatePrize(prize.id, { place: value })} invalid={Boolean(prizeErrors[`${key}.place`])} /></Field>
                  <Field id={fieldId(`${key}.prize_type`)} label="Prize type" required error={prizeErrors[`${key}.prize_type`]}><SelectControl id={fieldId(`${key}.prize_type`)} value={prize.prize_type} onChange={(value) => { const type = value as PrizeType; updatePrize(prize.id, { prize_type: type, ...(type !== "cash" ? { cash_amount: "", currency: "" } : {}) }); }}><option value="">Select a prize type</option><option value="cash">Cash</option><option value="physical_goods">Physical goods</option><option value="coupon">Coupon</option><option value="other">Other</option></SelectControl></Field>
                  <div className="sm:col-span-2"><Field id={fieldId(`${key}.description`)} label="Description" required error={prizeErrors[`${key}.description`]}><Textarea id={fieldId(`${key}.description`)} rows={2} value={prize.description} onChange={(event) => updatePrize(prize.id, { description: event.target.value })} placeholder="Describe the prize" aria-invalid={Boolean(prizeErrors[`${key}.description`])} /></Field></div>
                  {prize.prize_type === "cash" ? <><Field id={fieldId(`${key}.cash_amount`)} label="Cash amount" required error={prizeErrors[`${key}.cash_amount`]}><InputControl id={fieldId(`${key}.cash_amount`)} type="number" min="0" step="0.01" value={prize.cash_amount} onChange={(value) => updatePrize(prize.id, { cash_amount: value })} placeholder="0.00" invalid={Boolean(prizeErrors[`${key}.cash_amount`])} /></Field><Field id={fieldId(`${key}.currency`)} label="Currency" required error={prizeErrors[`${key}.currency`]} hint="Three uppercase letters, for example USD."><InputControl id={fieldId(`${key}.currency`)} value={prize.currency} onChange={(value) => updatePrize(prize.id, { currency: value.toUpperCase().slice(0, 3) })} maxLength={3} placeholder="ABC" invalid={Boolean(prizeErrors[`${key}.currency`])} /></Field></> : prize.prize_type ? <Field id={fieldId(`${key}.quantity`)} label="Quantity" error={prizeErrors[`${key}.quantity`]} hint="Optional; if set, use a positive whole number."><InputControl id={fieldId(`${key}.quantity`)} type="number" min="1" step="1" value={prize.quantity} onChange={(value) => updatePrize(prize.id, { quantity: value })} placeholder="Optional" invalid={Boolean(prizeErrors[`${key}.quantity`])} /></Field> : null}
                </div>
              </fieldset>; })}
            </div>}
          </section>
          <section aria-labelledby="rules-heading" className="border-t border-border pt-7">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 id="rules-heading" className="font-display text-xl font-black tracking-[-0.04em]">Tournament rules <span className="font-body text-sm font-normal text-muted-foreground">(optional)</span></h3><p className="mt-1 text-sm text-muted-foreground">Add rules in the order participants should read them.</p></div><Button type="button" variant="outline" onClick={() => update("rules", [...form.rules, makeRule()])}><Plus aria-hidden="true" />Add rule</Button></div>
            {!form.rules.length ? <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center"><p className="text-sm font-medium">No rules added</p><p className="mt-1 text-sm text-muted-foreground">Rules are optional. Add them when you have tournament-specific guidance.</p></div> : <div className="space-y-4">
              {form.rules.map((rule, index) => { const key = `rules.${rule.id}`; return <fieldset key={rule.id} className="min-w-0 rounded-lg border border-border p-4 sm:p-5"><legend className="sr-only">Rule {index + 1}</legend><div className="mb-4 flex items-center justify-between gap-3"><p className="font-medium">Rule {index + 1}</p><Button type="button" variant="ghost" size="sm" aria-label={`Remove rule ${index + 1}`} onClick={() => removeRule(rule.id)}><Trash2 aria-hidden="true" />Remove</Button></div>
                <div className="grid gap-4 sm:grid-cols-2"><Field id={fieldId(`${key}.title`)} label="Title" required error={prizeErrors[`${key}.title`]}><InputControl id={fieldId(`${key}.title`)} value={rule.title} onChange={(value) => updateRule(rule.id, { title: value })} placeholder="Short rule title" invalid={Boolean(prizeErrors[`${key}.title`])} /></Field><Field id={fieldId(`${key}.category`)} label="Category" required error={prizeErrors[`${key}.category`]}><SelectControl id={fieldId(`${key}.category`)} value={rule.category} onChange={(value) => updateRule(rule.id, { category: value as RuleCategory })}><option value="">Select a category</option>{["eligibility", "gameplay", "conduct", "technical", "other"].map((value) => <option key={value} value={value}>{optionLabels[value]}</option>)}</SelectControl></Field>
                  <div className="sm:col-span-2"><Field id={fieldId(`${key}.description`)} label="Full description" required error={prizeErrors[`${key}.description`]}><Textarea id={fieldId(`${key}.description`)} rows={3} value={rule.description} onChange={(event) => updateRule(rule.id, { description: event.target.value })} placeholder="Explain the rule clearly" aria-invalid={Boolean(prizeErrors[`${key}.description`])} /></Field></div>
                  <Field id={fieldId(`${key}.severity`)} label="Severity" required error={prizeErrors[`${key}.severity`]}><SelectControl id={fieldId(`${key}.severity`)} value={rule.severity} onChange={(value) => updateRule(rule.id, { severity: value as RuleSeverity })}><option value="">Select severity</option>{["info", "minor", "major", "critical"].map((value) => <option key={value} value={value}>{optionLabels[value]}</option>)}</SelectControl></Field><Field id={fieldId(`${key}.penalty_policy`)} label="Penalty" required error={prizeErrors[`${key}.penalty_policy`]}><SelectControl id={fieldId(`${key}.penalty_policy`)} value={rule.penalty_policy} onChange={(value) => updateRule(rule.id, { penalty_policy: value as Penalty })}><option value="">Select a penalty</option>{["none", "warning", "point_deduction", "match_forfeit", "disqualification", "other"].map((value) => <option key={value} value={value}>{optionLabels[value] ?? "Other"}</option>)}</SelectControl></Field>
                </div></fieldset>; })}
            </div>}
          </section>
        </div>}

        {step === 4 && <div className="space-y-4">
          <ReviewSection title="Basic details" onEdit={() => editStep(0)}><ReviewRow label="Name" value={form.name} /><ReviewRow label="Slug" value={form.slug ? `/tournaments/${form.slug}` : "Missing"} /><ReviewRow label="Format" value={optionLabels[form.tournament_format]} /><ReviewRow label="Description" value={form.description || "Not provided"} /></ReviewSection>
          <ReviewSection title="Game & team configuration" onEdit={() => editStep(1)}><ReviewRow label="Game" value={selectedGame?.name ?? "Not selected"} /><ReviewRow label="Mode" value={selectedMode?.name ?? "Not selected"} /><ReviewRow label="Team setup" value={selectedConfig ? `${selectedConfig.name} · ${selectedConfig.team_size} ${selectedConfig.team_size === 1 ? "player" : "players"}` : "Not selected"} /></ReviewSection>
          <ReviewSection title="Registration & schedule" onEdit={() => editStep(2)}><ReviewRow label="Maximum entries" value={form.max_entries || "Not set"} /><ReviewRow label="Registration opens" value={formatDate(form.registration_opens_at)} /><ReviewRow label="Registration closes" value={formatDate(form.registration_closes_at)} /><ReviewRow label="Starts" value={formatDate(form.starts_at)} /><ReviewRow label="Ends" value={formatDate(form.ends_at)} /></ReviewSection>
          <ReviewSection title="Prizes" onEdit={() => editStep(3)}>{form.prizes.length ? form.prizes.map((prize) => <ReviewRow key={prize.id} label={`Place ${prize.place} · ${optionLabels[prize.prize_type]}`} value={`${prize.description}${prize.prize_type === "cash" ? ` · ${prize.currency} ${prize.cash_amount}` : prize.quantity ? ` · Qty ${prize.quantity}` : ""}`} />) : <p className="text-sm text-muted-foreground">No prizes added.</p>}</ReviewSection>
          <ReviewSection title="Rules" onEdit={() => editStep(3)}>{form.rules.length ? form.rules.map((rule) => <ReviewRow key={rule.id} label={`${rule.title} · ${optionLabels[rule.severity]}`} value={`${rule.description} · ${optionLabels[rule.category]} · ${optionLabels[rule.penalty_policy] ?? "Other"}`} />) : <p className="text-sm text-muted-foreground">No rules added.</p>}</ReviewSection>
          <div className="flex gap-3 rounded-lg border border-border bg-background p-4 text-sm"><CircleHelp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="text-muted-foreground">This workflow is UI-only. Saving to Arena is not connected yet; the button below validates your details and shows a local confirmation only.</p></div>
        </div>}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>{step > 0 && <Button type="button" variant="ghost" onClick={() => editStep(step - 1)}><ArrowLeft aria-hidden="true" />Back</Button>}</div>
          {step < 4 ? <Button type="button" onClick={continueStep}>Continue<ArrowRight aria-hidden="true" /></Button> : <Button type="button" onClick={finish}><Check aria-hidden="true" />Save as draft</Button>}
        </div>
        {notice && <div role="status" className="mt-4 rounded-lg border border-live/40 bg-live/10 p-4 text-sm"><p className="font-semibold">Draft check complete</p><p className="mt-1 text-muted-foreground">Your tournament details are valid in this page. Nothing has been saved to the database.</p></div>}
      </section>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">All tournaments in this setup are drafts. You can review and revise details before any future publishing workflow.</p>
    </div>
  </main>;
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-background p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold">{title}</h3><Button type="button" variant="ghost" size="sm" onClick={onEdit}>Edit</Button></div><div className="space-y-2">{children}</div></section>;
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-t border-border/70 pt-2 first:border-0 first:pt-0 sm:grid-cols-[minmax(130px,0.35fr)_1fr] sm:gap-4"><span className="text-xs text-muted-foreground">{label}</span><span className="break-words text-sm">{value}</span></div>;
}
