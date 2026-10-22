import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Field, InputControl, SelectControl, SmoothTextControl } from "./tournament-wizard-fields";
import type { Prize, TournamentErrors } from "./tournament-wizard-types";

export function PrizeList({
  prizes,
  errors,
  onRemove,
  onChange,
}: {
  prizes: Prize[];
  errors: TournamentErrors;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Prize>) => void;
}) {
  if (prizes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm font-medium">No prizes added</p>
        <p className="mt-1 text-sm text-muted-foreground">Add prize details when they are ready. Prizes can also be left empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prizes.map((prize, index) => (
        <PrizeFields
          key={prize.id}
          prize={prize}
          index={index}
          errors={errors}
          onRemove={() => onRemove(prize.id)}
          onChange={(patch) => onChange(prize.id, patch)}
        />
      ))}
    </div>
  );
}

function PrizeFields({
  prize,
  index,
  errors,
  onRemove,
  onChange,
}: {
  prize: Prize;
  index: number;
  errors: TournamentErrors;
  onRemove: () => void;
  onChange: (patch: Partial<Prize>) => void;
}) {
  const prefix = `prizes.${prize.id}`;
  const fieldId = (field: string) => `${prefix}.${field}`.replaceAll(".", "-");

  return (
    <fieldset className="min-w-0 rounded-lg border border-border p-4 sm:p-5">
      <legend className="sr-only">Prize {index + 1}</legend>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-medium">Prize {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" aria-label={`Remove prize ${index + 1}`} onClick={onRemove}>
          <Trash2 aria-hidden="true" />Remove
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={fieldId("place")} label="Place" required error={errors[`${prefix}.place`]}>
          <InputControl
            id={fieldId("place")}
            type="number"
            min="1"
            step="1"
            value={prize.place}
            onChange={(value) => onChange({ place: value })}
            invalid={Boolean(errors[`${prefix}.place`])}
          />
        </Field>
        <Field id={fieldId("prize_type")} label="Prize type" required error={errors[`${prefix}.prize_type`]}>
          <SelectControl
            id={fieldId("prize_type")}
            value={prize.prize_type}
            onChange={(value) => {
              const prizeType = value as Prize["prize_type"];
              onChange({
                prize_type: prizeType,
                ...(prizeType !== "cash" ? { cash_amount: "", currency: "" } : {}),
              });
            }}
          >
            <option value="">Select a prize type</option>
            <option value="cash">Cash</option>
            <option value="physical_goods">Physical goods</option>
            <option value="coupon">Coupon</option>
            <option value="other">Other</option>
          </SelectControl>
        </Field>

        <div className="sm:col-span-2">
          <Field id={fieldId("description")} label="Description" required error={errors[`${prefix}.description`]}>
            <Textarea
              id={fieldId("description")}
              rows={2}
              value={prize.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="Describe the prize"
              aria-invalid={Boolean(errors[`${prefix}.description`])}
            />
          </Field>
        </div>

        {prize.prize_type === "cash" ? (
          <>
            <Field id={fieldId("cash_amount")} label="Cash amount" required error={errors[`${prefix}.cash_amount`]}>
              <InputControl
                id={fieldId("cash_amount")}
                type="number"
                min="0"
                step="0.01"
                value={prize.cash_amount}
                onChange={(value) => onChange({ cash_amount: value })}
                placeholder="0.00"
                invalid={Boolean(errors[`${prefix}.cash_amount`])}
              />
            </Field>
            <Field
              id={fieldId("currency")}
              label="Currency"
              required
              error={errors[`${prefix}.currency`]}
              hint="Three uppercase letters, for example USD."
            >
              <SmoothTextControl
                id={fieldId("currency")}
                value={prize.currency}
                onChange={(event) => onChange({ currency: event.target.value.toUpperCase().slice(0, 3) })}
                maxLength={3}
                placeholder="ABC"
                invalid={Boolean(errors[`${prefix}.currency`])}
              />
            </Field>
          </>
        ) : prize.prize_type ? (
          <Field
            id={fieldId("quantity")}
            label="Quantity"
            error={errors[`${prefix}.quantity`]}
            hint="Optional; if set, use a positive whole number."
          >
            <InputControl
              id={fieldId("quantity")}
              type="number"
              min="1"
              step="1"
              value={prize.quantity}
              onChange={(value) => onChange({ quantity: value })}
              placeholder="Optional"
              invalid={Boolean(errors[`${prefix}.quantity`])}
            />
          </Field>
        ) : null}
      </div>
    </fieldset>
  );
}
