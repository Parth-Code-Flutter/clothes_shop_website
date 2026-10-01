"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { loginAction, type LoginState } from "@/features/admin/auth/actions";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  next?: string;
  devCredentials?: { email: string; password: string } | null;
};

const fieldShell =
  "group flex h-12 items-center gap-3 rounded-lg border bg-adm-surface px-3.5 transition-colors focus-within:border-adm-accent focus-within:ring-4 focus-within:ring-adm-accent/12";

export function LoginForm({ next, devCredentials }: LoginFormProps) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState(state.email ?? "");
  const [password, setPassword] = useState("");

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? (
        <p role="alert" className="rounded-lg border border-adm-danger/25 bg-adm-danger-soft px-4 py-3 text-sm text-adm-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="admin-email" className="text-[13px] font-medium text-adm-ink">
          Email address
        </label>
        <div className={cn(fieldShell, state.fieldErrors?.email ? "border-adm-danger" : "border-adm-line")}>
          <Mail className="size-[18px] shrink-0 text-adm-ink-faint group-focus-within:text-adm-accent" strokeWidth={1.6} aria-hidden="true" />
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@yourstore.com"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "admin-email-error" : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-adm-ink outline-none placeholder:text-adm-ink-faint"
          />
        </div>
        {state.fieldErrors?.email ? (
          <p id="admin-email-error" className="text-[13px] text-adm-danger">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="admin-password" className="text-[13px] font-medium text-adm-ink">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowReset((value) => !value)}
            aria-expanded={showReset}
            className="text-[13px] font-medium text-adm-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent"
          >
            Forgot password?
          </button>
        </div>
        <div className={cn(fieldShell, state.fieldErrors?.password ? "border-adm-danger" : "border-adm-line")}>
          <Lock className="size-[18px] shrink-0 text-adm-ink-faint group-focus-within:text-adm-accent" strokeWidth={1.6} aria-hidden="true" />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? "admin-password-error" : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-adm-ink outline-none placeholder:text-adm-ink-faint"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="-mr-1.5 inline-flex size-9 items-center justify-center rounded-md text-adm-ink-faint transition-colors hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-adm-accent"
          >
            {showPassword ? <EyeOff className="size-[18px]" strokeWidth={1.6} /> : <Eye className="size-[18px]" strokeWidth={1.6} />}
          </button>
        </div>
        {state.fieldErrors?.password ? (
          <p id="admin-password-error" className="text-[13px] text-adm-danger">
            {state.fieldErrors.password}
          </p>
        ) : null}
        {showReset ? (
          <p className="rounded-lg bg-adm-surface-muted px-3.5 py-3 text-[13px] leading-relaxed text-adm-ink-soft">
            Owner passwords are managed by your developer. Ask them to update <code className="font-mono text-[12px] text-adm-ink">ADMIN_PASSWORD</code> on the server, then sign in again.
          </p>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-[14px] text-adm-ink-soft select-none">
        <input type="checkbox" name="remember" className="peer sr-only" />
        <span
          aria-hidden="true"
          className="flex size-[18px] items-center justify-center rounded-[5px] border border-adm-line-strong bg-adm-surface transition-colors peer-checked:border-adm-accent peer-checked:bg-adm-accent peer-focus-visible:ring-4 peer-focus-visible:ring-adm-accent/20 peer-checked:[&>svg]:opacity-100"
        >
          <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-adm-accent-ink stroke-2 opacity-0">
            <path d="M2.5 6.2 5 8.5l4.5-5" />
          </svg>
        </span>
        Keep me signed in for 30 days
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-adm-ink text-[15px] font-medium text-adm-canvas transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Sign in to console
            <ArrowRight className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
          </>
        )}
      </button>

      {devCredentials ? (
        <div className="rounded-lg border border-dashed border-adm-line-strong px-4 py-3.5 text-[13px] text-adm-ink-soft">
          <p className="font-medium text-adm-ink">Local development login</p>
          <p className="mt-1">
            <span className="font-mono text-[12px]">{devCredentials.email}</span> ·{" "}
            <span className="font-mono text-[12px]">{devCredentials.password}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail(devCredentials.email);
              setPassword(devCredentials.password);
            }}
            className="mt-2 font-medium text-adm-accent underline-offset-4 hover:underline"
          >
            Fill these in
          </button>
        </div>
      ) : null}
    </form>
  );
}
