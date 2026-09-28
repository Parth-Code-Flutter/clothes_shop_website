"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Eye,
  EyeOff,
  LockKeyhole,
  Ticket,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAccount } from "@/features/account/account-provider";
import fieldStyles from "@/features/checkout/components/checkout-view.module.css";
import { cn } from "@/lib/utils";
import styles from "./account-view.module.css";

type AuthMode = "signin" | "signup";
type AuthFieldName = "name" | "email" | "password" | "confirmPassword" | "terms";
type AuthErrors = Partial<Record<AuthFieldName, string>>;

const FIELD_ORDER: AuthFieldName[] = ["name", "email", "password", "confirmPassword", "terms"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_PASSES = [
  { user: "admin", name: "Admin pass", icon: Crown },
  { user: "house", name: "Customer pass", icon: Ticket },
] as const;

export function AccountView() {
  const router = useRouter();
  const { account, signedIn, saveAccount } = useAccount();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(account?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (signedIn) router.replace("/dashboard");
  }, [router, signedIn]);

  const cleanEmail = email.trim();
  const passName =
    mode === "signup"
      ? name.trim()
      : cleanEmail === "admin"
        ? "Admin"
        : cleanEmail === "house"
          ? "House Customer"
          : "";
  const passType = mode === "signin" && cleanEmail === "admin" ? "Admin pass" : "Member pass";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setNotice(null);
  }

  function clearError(field: AuthFieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fillDemoPass(user: string) {
    setEmail(user);
    setPassword(user);
    setErrors({});
    setNotice(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const previewRole = cleanEmail === "admin" && password === "admin" ? "admin" : cleanEmail === "house" && password === "house" ? "customer" : null;

    const nextErrors: AuthErrors = {};
    if (mode === "signin") {
      if (!cleanEmail) nextErrors.email = "Username is required.";
      else if (cleanEmail !== "admin" && cleanEmail !== "house") nextErrors.email = "Use admin or house for temporary access.";
      if (!password) nextErrors.password = "Password is required.";
      else if (!previewRole) nextErrors.password = "Password must match the selected preview user.";
    } else {
      if (!cleanEmail) nextErrors.email = "Email address is required.";
      else if (!EMAIL_PATTERN.test(cleanEmail)) nextErrors.email = "Enter a valid email address.";
      if (!password) nextErrors.password = "Password is required.";
      else if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
      if (!cleanName) nextErrors.name = "Full name is required.";
      else if (cleanName.length < 2) nextErrors.name = "Use at least 2 characters.";
      if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
      else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
      if (!accepted) nextErrors.terms = "Please accept the terms to continue.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) document.getElementById(`account-${firstInvalid === "confirmPassword" ? "confirm" : firstInvalid}`)?.focus();
      return;
    }

    saveAccount({
      name: mode === "signup" ? cleanName : previewRole === "admin" ? "Admin" : "House Customer",
      email: cleanEmail,
      role: mode === "signup" ? "customer" : previewRole ?? "customer",
    });
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setNotice(mode === "signup" ? "Your local preview account is ready." : "Welcome back.");
    router.push("/dashboard");
  }

  if (signedIn) return <div className="min-h-screen bg-background" aria-label="Opening your dashboard" />;

  return (
    <div className="grid min-h-screen text-foreground lg:grid-cols-[0.95fr_1.05fr]">
      <section className={cn(styles.stage, "flex flex-col px-5 pt-6 pb-8 sm:px-8 lg:min-h-screen lg:justify-between lg:px-12 lg:pt-8 lg:pb-12 xl:px-16")}>
        <span className={styles.bulbs} aria-hidden="true" />
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Back to House of Bollywood" className="rounded bg-white px-2 py-1 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7bd62]">
            <Image src="/brand/house-of-bollywood-logo.png" alt="House of Bollywood" width={1024} height={341} priority className="h-auto w-[104px] sm:w-[112px]" />
          </Link>
          <Link href="/shop" className={cn(styles.back, "inline-flex text-[#fbf1de] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7bd62] lg:hidden")}>
            <ArrowLeft size={14} aria-hidden="true" /> Store
          </Link>
        </div>

        <div className="mt-8 lg:mt-0">
          <p className={styles.onAir}>Members of the house</p>
          <p className={cn(styles.headline, "mt-4 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl")}>
            Your wardrobe,<br /><em>remembered.</em>
          </p>
          <p className="mt-5 hidden max-w-md text-sm leading-7 text-[#fbf1de]/60 lg:block">Save the pieces you love, keep your bag close, and find every order in one private space.</p>
        </div>

        <div className="mt-10 hidden lg:block" aria-hidden="true">
          <div className={styles.passWrap}>
            <div className={styles.passPaper}>
              <p className={styles.passTop}><span>House of Bollywood</span><span>{passType}</span></p>
              <p className={styles.passAdmit}>Admit one</p>
              <p className={styles.passLabel}>Presented to</p>
              <p className={styles.passName} data-empty={!passName}>{passName || "Your name here"}</p>
              <p className={styles.passMeta}><span>Row M</span><span>Seat 01</span><span>Valid every show</span></p>
            </div>
            <div className={styles.passStub}>
              <span className={styles.stubText}>Member</span>
              <span className={styles.stubNo}>No. 001</span>
              <span className={styles.barcode} />
            </div>
          </div>
        </div>

        <ul className={cn(styles.perks, "mt-10 hidden lg:grid")}>
          <li><Check size={15} aria-hidden="true" /> Keep your saved edit together</li>
          <li><Check size={15} aria-hidden="true" /> Move through checkout faster</li>
          <li><Check size={15} aria-hidden="true" /> Track future orders in one place</li>
        </ul>
      </section>

      <section className="relative flex flex-col items-center justify-center px-4 pt-8 pb-12 sm:px-8 lg:px-12 lg:py-16">
        <Link href="/shop" className={cn(styles.back, "absolute top-6 right-8 hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:inline-flex")}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to store
        </Link>

        <div className={styles.desk}>
          <p className={styles.eyebrow}>Box office</p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">{mode === "signin" ? "Welcome back." : "Join the house."}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{mode === "signin" ? "Sign in to continue your edit." : "Create your member pass in a minute."}</p>

          <div className={cn(styles.tabs, "mt-7")} role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchMode("signin")} className={cn(styles.tab, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}><b>01</b> Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")} className={cn(styles.tab, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}><b>02</b> Create account</button>
          </div>

          {mode === "signin" ? (
            <div className="mt-6">
              <p className="mb-2 font-mono text-[9px] tracking-[0.16em] text-muted uppercase">Preview passes · tap to fill</p>
              <div className={styles.passes}>
                {DEMO_PASSES.map(({ user, name: label, icon: Icon }) => (
                  <button key={user} type="button" onClick={() => fillDemoPass(user)} data-active={cleanEmail === user && password === user} className={cn(styles.demo, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                    <span className={styles.demoIcon} aria-hidden="true"><Icon size={14} /></span>
                    <span className="min-w-0">
                      <span className={styles.demoName}>{label}</span>
                      <span className={styles.demoCode}>{user} / {user}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
            {mode === "signup" ? <AuthField id="account-name" label="Full name" type="text" value={name} onChange={(value) => { setName(value); clearError("name"); }} autoComplete="name" placeholder="How should we address you?" error={errors.name} /> : null}
            <AuthField id="account-email" label={mode === "signin" ? "Username" : "Email address"} type={mode === "signin" ? "text" : "email"} value={email} onChange={(value) => { setEmail(value); clearError("email"); }} autoComplete={mode === "signin" ? "username" : "email"} placeholder={mode === "signin" ? "admin or house" : "you@email.com"} error={errors.email} />
            <div className={fieldStyles.field}>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="account-password" className={fieldStyles.label}>Password</label>
                {mode === "signin" ? <button type="button" onClick={() => setNotice("Password recovery connects with live sign-in.")} className="text-[11px] text-muted underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Forgot password?</button> : null}
              </div>
              <div className="relative">
                <input id="account-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); clearError("password"); }} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Same as username" : "8 characters minimum"} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "account-password-error" : undefined} className={cn(fieldStyles.input, "pr-12")} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent">{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button>
              </div>
              {errors.password ? <span id="account-password-error" className={fieldStyles.error} role="alert"><AlertCircle size={12} aria-hidden="true" />{errors.password}</span> : null}
            </div>
            {mode === "signup" ? <AuthField id="account-confirm" label="Confirm password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(value) => { setConfirmPassword(value); clearError("confirmPassword"); }} autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword} /> : null}
            {mode === "signup" ? (
              <div>
                <label className={styles.check}>
                  <input id="account-terms" type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); clearError("terms"); }} aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? "account-terms-error" : undefined} />
                  <span>I agree to the terms and privacy policy for this storefront preview.</span>
                </label>
                {errors.terms ? <p id="account-terms-error" className={cn(fieldStyles.error, "mt-1.5 pl-[26px]")} role="alert"><AlertCircle size={12} aria-hidden="true" />{errors.terms}</p> : null}
              </div>
            ) : null}
            {notice ? <p className="text-xs leading-5 text-muted" role="status">{notice}</p> : null}
            <button type="submit" className={cn(styles.cta, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent")}>
              {mode === "signin" ? "Sign in" : "Create my pass"} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          <p className={cn(styles.fine, "mt-6")}><LockKeyhole className="size-3.5" aria-hidden="true" /> Preview mode: details stay on this device. Passwords are checked here and never stored or sent.</p>
        </div>
      </section>
    </div>
  );
}

function AuthField({ id, label, type, value, onChange, autoComplete, placeholder, error }: { id: string; label: string; type: string; value: string; onChange: (value: string) => void; autoComplete: string; placeholder: string; error?: string }) {
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className={fieldStyles.field}>
      <span className={fieldStyles.label}>{label}</span>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={fieldStyles.input} />
      {error ? <span id={errorId} className={fieldStyles.error} role="alert"><AlertCircle size={12} aria-hidden="true" />{error}</span> : null}
    </label>
  );
}
