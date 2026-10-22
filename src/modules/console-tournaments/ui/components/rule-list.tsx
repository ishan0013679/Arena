import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Field, SelectControl, SmoothTextControl } from "./tournament-wizard-fields";
import { optionLabels, type Rule, type TournamentErrors } from "./tournament-wizard-types";

export function RuleList({
  rules,
  errors,
  onRemove,
  onChange,
}: {
  rules: Rule[];
  errors: TournamentErrors;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Rule>) => void;
}) {
  if (rules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm font-medium">No rules added</p>
        <p className="mt-1 text-sm text-muted-foreground">Rules are optional. Add them when you have tournament-specific guidance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <RuleFields
          key={rule.id}
          rule={rule}
          index={index}
          errors={errors}
          onRemove={() => onRemove(rule.id)}
          onChange={(patch) => onChange(rule.id, patch)}
        />
      ))}
    </div>
  );
}

function RuleFields({
  rule,
  index,
  errors,
  onRemove,
  onChange,
}: {
  rule: Rule;
  index: number;
  errors: TournamentErrors;
  onRemove: () => void;
  onChange: (patch: Partial<Rule>) => void;
}) {
  const prefix = `rules.${rule.id}`;
  const fieldId = (field: string) => `${prefix}.${field}`.replaceAll(".", "-");

  return (
    <fieldset className="min-w-0 rounded-lg border border-border p-4 sm:p-5">
      <legend className="sr-only">Rule {index + 1}</legend>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-medium">Rule {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" aria-label={`Remove rule ${index + 1}`} onClick={onRemove}>
          <Trash2 aria-hidden="true" />Remove
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={fieldId("title")} label="Title" required error={errors[`${prefix}.title`]}>
          <SmoothTextControl
            id={fieldId("title")}
            value={rule.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Short rule title"
            invalid={Boolean(errors[`${prefix}.title`])}
          />
        </Field>
        <Field id={fieldId("category")} label="Category" required error={errors[`${prefix}.category`]}>
          <SelectControl
            id={fieldId("category")}
            value={rule.category}
            onChange={(value) => onChange({ category: value as Rule["category"] })}
          >
            <option value="">Select a category</option>
            {["eligibility", "gameplay", "conduct", "technical", "other"].map((value) => (
              <option key={value} value={value}>{optionLabels[value]}</option>
            ))}
          </SelectControl>
        </Field>

        <div className="sm:col-span-2">
          <Field id={fieldId("description")} label="Full description" required error={errors[`${prefix}.description`]}>
            <Textarea
              id={fieldId("description")}
              rows={3}
              value={rule.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="Explain the rule clearly"
              aria-invalid={Boolean(errors[`${prefix}.description`])}
            />
          </Field>
        </div>

        <Field id={fieldId("severity")} label="Severity" required error={errors[`${prefix}.severity`]}>
          <SelectControl
            id={fieldId("severity")}
            value={rule.severity}
            onChange={(value) => onChange({ severity: value as Rule["severity"] })}
          >
            <option value="">Select severity</option>
            {["info", "minor", "major", "critical"].map((value) => (
              <option key={value} value={value}>{optionLabels[value]}</option>
            ))}
          </SelectControl>
        </Field>
        <Field id={fieldId("penalty_policy")} label="Penalty" required error={errors[`${prefix}.penalty_policy`]}>
          <SelectControl
            id={fieldId("penalty_policy")}
            value={rule.penalty_policy}
            onChange={(value) => onChange({ penalty_policy: value as Rule["penalty_policy"] })}
          >
            <option value="">Select a penalty</option>
            {["none", "warning", "point_deduction", "match_forfeit", "disqualification", "other"].map((value) => (
              <option key={value} value={value}>{optionLabels[value] ?? "Other"}</option>
            ))}
          </SelectControl>
        </Field>
      </div>
    </fieldset>
  );
}
