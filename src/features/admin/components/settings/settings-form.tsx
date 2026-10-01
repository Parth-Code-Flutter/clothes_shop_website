"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";
import { saveSettingsAction, type SettingsFormState } from "@/features/admin/settings/actions";
import { buttonClass, inputClass } from "@/features/admin/components/ui";
import { SETTINGS_META, type SettingsSection } from "@/features/admin/lib/settings-meta";
import { cn } from "@/lib/utils";

export type SettingsContext<T> = {
  values: T;
  set: (update: (current: T) => T) => void;
  patch: (partial: Partial<T>) => void;
  errors: Record<string, string>;
  /** Stable element id for a field key such as `zone.0.name`. */
  id: (key: string) => string;
  aria: (key: string) => { "aria-invalid"?: true; "aria-describedby"?: string };
};

export function SettingsForm<T>({
  section,
  initial,
  children,
  aside,
}: {
  section: SettingsSection;
  initial: T;
  children: (context: SettingsContext<T>) => ReactNode;
  aside?: (context: SettingsContext<T>) => ReactNode;
}) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: SettingsFormState, formData: FormData) => {
    const result = await saveSettingsAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as SettingsFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const id = (key: string) => `${uid}-${key.replace(/\./g, "-")}`;
  const context: SettingsContext<T> = {
    values,
    set: setValues,
    patch: (partial) => setValues((current) => ({ ...current, ...partial })),
    errors,
    id,
    aria: (key) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${id(key)}-error` } : {}),
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="payload" value={JSON.stringify(values)} />

      <div className="adm-rise sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/settings" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Settings
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em]">{SETTINGS_META[section].label}</h1>
          {dirty ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!dirty || pending} onClick={() => setValues(JSON.parse(baseline))} className={buttonClass.secondary}>
            Discard
          </button>
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save changes
          </button>
        </div>
      </div>

      {state.status !== "idle" && state.message ? (
        <div
          key={state.at}
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "adm-rise flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]",
            state.status === "error" && "border-adm-danger/30 bg-adm-danger-soft text-adm-danger",
            state.status === "preview" && "border-adm-info/25 bg-adm-info-soft text-adm-info",
            state.status === "saved" && "border-adm-success/25 bg-adm-success-soft text-adm-success",
          )}
        >
          {state.status === "error" ? (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          ) : state.status === "preview" ? (
            <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={cn("grid gap-6", aside && "lg:grid-cols-[minmax(0,1fr)_340px]")}>
        <div className="flex min-w-0 flex-col gap-6">{children(context)}</div>
        {aside ? <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">{aside(context)}</aside> : null}
      </div>
    </form>
  );
}

const SWITCH =
  "relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4";

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
  badge,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: ReactNode;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-4 py-3", disabled ? "cursor-default" : "cursor-pointer")}>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[13px] font-medium">
          {label}
          {badge}
        </span>
        {hint ? <span className="mt-0.5 block text-[12px] text-adm-ink-faint">{hint}</span> : null}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={SWITCH} />
    </label>
  );
}

/** Edits a paise amount as whole rupees. */
export function RupeeInput({
  id,
  valuePaise,
  onChange,
  placeholder,
  ...rest
}: {
  id: string;
  valuePaise: number;
  onChange: (paise: number) => void;
  placeholder?: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-label"?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-adm-ink-faint">₹</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={Math.round(valuePaise / 100)}
        onChange={(event) => onChange(event.target.value === "" ? 0 : Math.round(Number(event.target.value) * 100))}
        placeholder={placeholder}
        className={cn(inputClass, "pl-7 tabular-nums")}
        {...rest}
      />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={`${id}-error`} className="text-[12px] text-adm-danger">
      {message}
    </p>
  ) : null;
}
