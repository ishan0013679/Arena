import { cloneElement, isValidElement, type ReactNode } from "react";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Field({
  label,
  id,
  error,
  children,
  required = false,
  hint,
}: {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-primary">*</span>}
      </label>
      {control}
      {hint && !error && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SelectControl({
  id,
  value,
  onChange,
  children,
  invalid,
  "aria-invalid": ariaInvalid,
  "aria-describedby": describedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  invalid?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid || ariaInvalid || undefined}
      aria-describedby={describedBy}
      className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
    >
      {children}
    </select>
  );
}

export function InputControl({
  id,
  value,
  onChange,
  type = "text",
  invalid,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      aria-invalid={invalid || undefined}
      {...props}
      className={`h-10 ${props.className ?? ""}`}
    />
  );
}

const smoothInputWrapperClassName =
  "w-full min-w-0 max-w-full rounded-lg border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50";
const smoothInputClassName =
  "h-10 w-full min-w-0 max-w-full px-3 text-sm text-foreground placeholder:text-muted-foreground";

export function SmoothTextControl({
  id,
  value,
  onChange,
  invalid = false,
  className,
  wrapperClassName,
  ...props
}: Omit<React.ComponentProps<typeof SmoothInput>, "value" | "onChange" | "id" | "className" | "wrapperClassName"> & {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  invalid?: boolean;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <SmoothInput
      id={id}
      value={value}
      onChange={onChange}
      aria-invalid={invalid || undefined}
      style={{ fontSize: 14 }}
      className={cn(smoothInputClassName, className)}
      wrapperClassName={cn(
        smoothInputWrapperClassName,
        invalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        wrapperClassName,
      )}
      {...props}
    />
  );
}

export type RadioCardOption = {
  value: string;
  label: string;
  description?: string | null;
  detail?: string;
  leading?: ReactNode;
};

export function RadioCardGroup({
  id,
  name,
  label,
  value,
  options,
  onChange,
  error,
  columns = "sm:grid-cols-2",
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: RadioCardOption[];
  onChange: (value: string) => void;
  error?: string;
  columns?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <fieldset className="min-w-0" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm font-medium">
        {label}<span aria-hidden="true" className="ml-1 text-primary">*</span>
      </legend>
      <div className={cn("grid min-w-0 gap-3", columns)} role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const selected = value === option.value;

          return (
            <label key={option.value} htmlFor={optionId} className="group min-w-0 cursor-pointer">
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                required
                aria-describedby={error ? errorId : undefined}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span className={cn(
                "flex min-h-[76px] min-w-0 items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors duration-150",
                "group-hover:border-border-strong group-hover:bg-muted/40",
                "peer-checked:border-primary peer-checked:bg-primary/5",
                "peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
              )}>
                {option.leading && (
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card text-muted-foreground">
                    {option.leading}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold text-foreground">{option.label}</span>
                  {(option.description || option.detail) && (
                    <span className="mt-1 block break-words text-xs leading-5 text-muted-foreground">
                      {option.description || option.detail}
                    </span>
                  )}
                </span>
                <span className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border text-transparent transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                )} aria-hidden="true">
                  {selected && <Check className="size-3" />}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </fieldset>
  );
}

export function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-border/70 pt-2 first:border-0 first:pt-0 sm:grid-cols-[minmax(130px,0.35fr)_1fr] sm:gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="break-words text-sm">{value}</span>
    </div>
  );
}
