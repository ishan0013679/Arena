import { CircleHelp } from "lucide-react";

import type { Game } from "@/modules/games/queries/games";
import type { GameMode, ModeTeamConfiguration } from "@/modules/games/queries/modes";

import { ReviewRow, ReviewSection } from "./tournament-wizard-fields";
import { optionLabels, type TournamentForm } from "./tournament-wizard-types";

function formatDate(value: string) {
  return value
    ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not set";
}

export function ReviewStep({
  form,
  game,
  mode,
  configuration,
  onEditStep,
}: {
  form: TournamentForm;
  game?: Game;
  mode?: GameMode;
  configuration?: ModeTeamConfiguration;
  onEditStep: (step: number) => void;
}) {
  return (
    <div className="space-y-4">
      <ReviewSection title="Basic details" onEdit={() => onEditStep(0)}>
        <ReviewRow label="Name" value={form.name} />
        <ReviewRow label="Slug" value={form.slug ? `/tournaments/${form.slug}` : "Missing"} />
        <ReviewRow label="Format" value={optionLabels[form.tournament_format] ?? "Not selected"} />
        <ReviewRow label="Description" value={form.description || "Not provided"} />
      </ReviewSection>

      <ReviewSection title="Game & team configuration" onEdit={() => onEditStep(1)}>
        <ReviewRow label="Game" value={game?.name ?? "Not selected"} />
        <ReviewRow label="Mode" value={mode?.name ?? "Not selected"} />
        <ReviewRow
          label="Team setup"
          value={configuration
            ? `${configuration.name} · ${configuration.team_size} ${configuration.team_size === 1 ? "player" : "players"}`
            : "Not selected"}
        />
      </ReviewSection>

      <ReviewSection title="Registration & schedule" onEdit={() => onEditStep(2)}>
        <ReviewRow label="Maximum entries" value={form.max_entries || "Not set"} />
        <ReviewRow label="Registration opens" value={formatDate(form.registration_opens_at)} />
        <ReviewRow label="Registration closes" value={formatDate(form.registration_closes_at)} />
        <ReviewRow label="Starts" value={formatDate(form.starts_at)} />
        <ReviewRow label="Ends" value={formatDate(form.ends_at)} />
      </ReviewSection>

      <ReviewSection title="Prizes" onEdit={() => onEditStep(3)}>
        {form.prizes.length ? form.prizes.map((prize) => (
          <ReviewRow
            key={prize.id}
            label={`Place ${prize.place} · ${optionLabels[prize.prize_type] ?? "Prize"}`}
            value={`${prize.description}${prize.prize_type === "cash"
              ? ` · ${prize.currency} ${prize.cash_amount}`
              : prize.quantity ? ` · Qty ${prize.quantity}` : ""}`}
          />
        )) : <p className="text-sm text-muted-foreground">No prizes added.</p>}
      </ReviewSection>

      <ReviewSection title="Rules" onEdit={() => onEditStep(3)}>
        {form.rules.length ? form.rules.map((rule) => (
          <ReviewRow
            key={rule.id}
            label={`${rule.title} · ${optionLabels[rule.severity] ?? "Severity not set"}`}
            value={`${rule.description} · ${optionLabels[rule.category] ?? "Category not set"} · ${optionLabels[rule.penalty_policy] ?? "Other"}`}
          />
        )) : <p className="text-sm text-muted-foreground">No rules added.</p>}
      </ReviewSection>

      <div className="flex gap-3 rounded-lg border border-border bg-background p-4 text-sm">
        <CircleHelp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">
          This workflow is UI-only. Saving to Arena is not connected yet; the button below validates your details and shows a local confirmation only.
        </p>
      </div>
    </div>
  );
}
