import { Field, InputControl } from "./tournament-wizard-fields";
import type { TournamentErrors, TournamentForm } from "./tournament-wizard-types";

export function ScheduleStep({
  form,
  errors,
  onChange,
}: {
  form: TournamentForm;
  errors: TournamentErrors;
  onChange: <K extends keyof TournamentForm>(key: K, value: TournamentForm[K]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field
          id="max_entries"
          label="Maximum entries"
          required
          error={errors.max_entries}
          hint="Enter the maximum number of teams or entries for this tournament."
        >
          <InputControl
            id="max_entries"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.max_entries}
            onChange={(value) => onChange("max_entries", value)}
            placeholder="64"
            invalid={Boolean(errors.max_entries)}
          />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">Date and time values use your local timezone.</p>
      <Field id="registration_opens_at" label="Registration opens" required error={errors.registration_opens_at}>
        <InputControl
          id="registration_opens_at"
          type="datetime-local"
          value={form.registration_opens_at}
          onChange={(value) => onChange("registration_opens_at", value)}
          invalid={Boolean(errors.registration_opens_at)}
        />
      </Field>
      <Field id="registration_closes_at" label="Registration closes" required error={errors.registration_closes_at}>
        <InputControl
          id="registration_closes_at"
          type="datetime-local"
          value={form.registration_closes_at}
          onChange={(value) => onChange("registration_closes_at", value)}
          invalid={Boolean(errors.registration_closes_at)}
        />
      </Field>
      <Field id="starts_at" label="Tournament starts" required error={errors.starts_at}>
        <InputControl
          id="starts_at"
          type="datetime-local"
          value={form.starts_at}
          onChange={(value) => onChange("starts_at", value)}
          invalid={Boolean(errors.starts_at)}
        />
      </Field>
      <Field
        id="ends_at"
        label="Tournament ends"
        error={errors.ends_at}
        hint="Optional. Leave blank if the end time is not known yet."
      >
        <InputControl
          id="ends_at"
          type="datetime-local"
          value={form.ends_at}
          onChange={(value) => onChange("ends_at", value)}
          invalid={Boolean(errors.ends_at)}
        />
      </Field>
    </div>
  );
}
