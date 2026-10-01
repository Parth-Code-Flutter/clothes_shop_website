"use client";

import { startTransition, useActionState, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Info, Loader2, Monitor, Moon, Sun, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { changePasswordAction, saveProfileAction, type ProfileFormState } from "@/features/admin/profile/actions";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { cn } from "@/lib/utils";

const IDLE: ProfileFormState = { status: "idle" };

function Notice({ state }: { state: ProfileFormState }) {
  if (state.status === "idle" || !state.message) return null;
  const error = state.status === "error";
  const Icon = error ? TriangleAlert : state.message === "Nothing changed." ? CheckCircle2 : Info;
  return (
    <p
      key={state.at}
      role={error ? "alert" : "status"}
      className={cn(
        "adm-rise flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[12.5px] leading-relaxed",
        error ? "border-adm-danger/30 bg-adm-danger-soft text-adm-danger" : "border-adm-info/25 bg-adm-info-soft text-adm-info",
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      {state.message}
    </p>
  );
}

function submitWith(action: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  };
}

export function ProfileDetailsForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(saveProfileAction, IDLE);
  const errors = state.fieldErrors ?? {};
  return (
    <Card title="Your details" description="Shown in the top bar and on activity like order notes.">
      <form onSubmit={submitWith(action)} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="profile-name" error={errors.name}>
            <input id="profile-name" name="name" defaultValue={name} maxLength={60} autoComplete="name" className={inputClass} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "profile-name-error" : undefined} />
          </Field>
          <Field label="Sign-in email" htmlFor="profile-email" error={errors.email}>
            <input id="profile-email" name="email" type="email" defaultValue={email} autoComplete="email" className={inputClass} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "profile-email-error" : undefined} />
          </Field>
        </div>
        <Notice state={state} />
        <div>
          <button type="submit" disabled={pending} className={buttonClass.secondary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save details
          </button>
        </div>
      </form>
    </Card>
  );
}

function strength(password: string) {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (!password) return { score: 0, label: "" };
  if (password.length < 10) return { score: 1, label: "Too short" };
  return score >= 4 ? { score: 4, label: "Strong" } : score >= 3 ? { score: 3, label: "Good" } : { score: 2, label: "Fair" };
}

export function PasswordForm() {
  const [next, setNext] = useState("");
  const [state, action, pending] = useActionState(async (previous: ProfileFormState, formData: FormData) => {
    const result = await changePasswordAction(previous, formData);
    if (result.status === "preview") setNext("");
    return result;
  }, IDLE);
  const [visible, setVisible] = useState(false);
  const errors = state.fieldErrors ?? {};
  const meter = strength(next);

  const passwordInput = (id: string, name: string, autoComplete: string, extra: Record<string, unknown> = {}) => (
    <input
      id={id}
      name={name}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      className={inputClass}
      aria-invalid={errors[name] ? true : undefined}
      aria-describedby={errors[name] ? `${id}-error` : undefined}
      {...extra}
    />
  );

  return (
    <Card
      title="Password"
      description="Use at least 10 characters with letters and numbers."
      action={
        <button type="button" onClick={() => setVisible((value) => !value)} className={cn(buttonClass.ghost, "h-8 px-2 text-[12px]")} aria-pressed={visible}>
          {visible ? <EyeOff className="size-3.5" strokeWidth={1.8} aria-hidden="true" /> : <Eye className="size-3.5" strokeWidth={1.8} aria-hidden="true" />}
          {visible ? "Hide" : "Show"}
        </button>
      }
    >
      <form key={state.status === "preview" ? state.at : "form"} onSubmit={submitWith(action)} className="flex flex-col gap-4" noValidate>
        <Field label="Current password" htmlFor="password-current" error={errors.current}>
          {passwordInput("password-current", "current", "current-password")}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="password-next" error={errors.next}>
            {passwordInput("password-next", "next", "new-password", { value: next, onChange: (event: ChangeEvent<HTMLInputElement>) => setNext(event.target.value) })}
          </Field>
          <Field label="Confirm new password" htmlFor="password-confirm" error={errors.confirm}>
            {passwordInput("password-confirm", "confirm", "new-password")}
          </Field>
        </div>
        {next ? (
          <div className="flex items-center gap-3" aria-live="polite">
            <span className="flex flex-1 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    step <= meter.score ? (meter.score <= 1 ? "bg-adm-danger" : meter.score === 2 ? "bg-adm-warning" : "bg-adm-success") : "bg-adm-surface-muted",
                  )}
                />
              ))}
            </span>
            <span className="w-16 text-right text-[12px] text-adm-ink-soft">{meter.label}</span>
          </div>
        ) : null}
        <Notice state={state} />
        <div>
          <button type="submit" disabled={pending} className={buttonClass.secondary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Change password
          </button>
        </div>
      </form>
    </Card>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match device", icon: Monitor },
] as const;

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const current = mounted ? (theme ?? "system") : null;
  return (
    <Card title="Appearance" description="Applies to this browser.">
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
        {THEMES.map((option) => {
          const selected = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-adm-accent",
                selected ? "border-adm-accent bg-adm-accent-soft/60 text-adm-ink" : "border-adm-line text-adm-ink-soft hover:border-adm-line-strong hover:text-adm-ink",
              )}
            >
              <option.icon className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
