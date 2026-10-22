import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Field, RadioCardGroup, SmoothTextControl } from "./tournament-wizard-fields";
import type { TournamentErrors, TournamentForm } from "./tournament-wizard-types";

export function BasicDetailsStep({
  form,
  errors,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onFormatChange,
}: {
  form: TournamentForm;
  errors: TournamentErrors;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
  onFormatChange: (format: TournamentForm["tournament_format"]) => void;
}) {
  return (
    <div className="grid gap-5 sm:max-w-3xl">
      <Field id="name" label="Tournament name" required error={errors.name}>
        <SmoothTextControl
          id="name"
          value={form.name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Arena Open #1"
          invalid={Boolean(errors.name)}
        />
      </Field>

      <Field
        id="slug"
        label="Slug"
        required
        error={errors.slug}
        hint="Used in the tournament URL. You can edit it at any time before saving."
      >
        <div className={cn(
          "flex min-w-0 items-center rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          errors.slug && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        )}>
          <span className="hidden shrink-0 pl-3 text-sm text-muted-foreground sm:inline">arena.gg/tournaments/</span>
          <SmoothTextControl
            id="slug"
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
            placeholder="arena-open-1"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            invalid={Boolean(errors.slug)}
            aria-describedby={errors.slug ? "slug-error" : undefined}
            wrapperClassName="border-0 focus-within:border-0 focus-within:ring-0"
            className="h-10 px-3 sm:px-2"
          />
        </div>
      </Field>

      <Field id="description" label="Description" hint="Optional. A short overview for participants.">
        <Textarea
          id="description"
          value={form.description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={4}
          placeholder="What should participants know about this tournament?"
        />
      </Field>

      <RadioCardGroup
        id="tournament_format"
        name="tournament_format"
        label="Tournament format"
        value={form.tournament_format}
        error={errors.tournament_format}
        onChange={(value) => onFormatChange(value as TournamentForm["tournament_format"])}
        options={[
          { value: "single_stage", label: "Single stage", description: "One continuous stage of play." },
          { value: "multi_stage", label: "Multi-stage", description: "Multiple stages within the same event." },
        ]}
      />
    </div>
  );
}
