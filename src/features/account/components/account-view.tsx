"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAccount } from "@/features/account/account-provider";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type AuthFieldName = "name" | "email" | "password" | "confirmPassword" | "terms";
type AuthErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
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

  if (signedIn) return <div className="min-h-screen bg-[#f4efe8]" aria-label="Opening your dashboard" />;

  return (
    <div className="relative grid min-h-screen bg-[#f4efe8] text-foreground dark:bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <Link href="/" aria-label="Back to House of Bollywood" className="absolute top-5 left-5 z-20 rounded bg-white px-2 py-1 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:top-7 sm:left-8"><Image src="/brand/house-of-bollywood-logo.png" alt="House of Bollywood" width={1024} height={341} priority className="h-auto w-[112px]" /></Link>
      <Link href="/shop" className="absolute top-6 right-5 z-20 inline-flex min-h-10 items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:top-8 sm:right-8"><ArrowLeft size={14} aria-hidden="true" /> Back to store</Link>
      <section className="relative isolate hidden overflow-hidden bg-[#180805] px-12 pt-28 pb-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:pb-16">
        <div className="absolute -right-28 -bottom-28 -z-10 size-[520px] rounded-full border border-white/10" aria-hidden="true"><div className="absolute inset-16 rounded-full border border-white/10" /><div className="absolute inset-32 rounded-full border border-accent/35" /></div>
        <span className="absolute top-8 right-8 rotate-6 border border-[#ff5c53]/60 px-4 py-3 text-center font-mono text-[9px] leading-4 tracking-[0.2em] text-[#ff5c53] uppercase" aria-hidden="true">House pass<br />No. 001</span>
        <span className="pointer-events-none absolute top-1/2 -left-8 -z-10 -translate-y-1/2 rotate-90 font-display text-[10rem] leading-none text-white/[0.025]" aria-hidden="true">MEMBER</span>
        <div><p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-[#ff5c53] uppercase"><Sparkles size={13} aria-hidden="true" /> Members of the house</p><h1 className="mt-5 max-w-xl font-display text-7xl leading-[0.88] tracking-wide xl:text-8xl">Your wardrobe,<br /><span className="text-[#ff3b30]">remembered.</span></h1><p className="mt-6 max-w-md text-sm leading-7 text-white/55">Save the pieces you love, keep your bag close, and find every order in one private space.</p></div>
        <ul className="grid gap-3 text-xs text-white/70"><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Keep your saved edit together</li><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Move through checkout faster</li><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Track future orders in one place</li></ul>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-5 pt-24 pb-10 sm:px-8 lg:px-12 lg:pt-20">
        <div className="w-full max-w-lg border border-black/10 bg-background p-6 shadow-[0_28px_80px_rgba(22,6,4,0.08)] dark:border-white/10 sm:p-9">
          <div className="flex items-center gap-3"><span className="h-px w-8 bg-accent" /><p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">House of Bollywood</p></div>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-wide sm:text-6xl">{mode === "signin" ? "Welcome back." : "Join the house."}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{mode === "signin" ? "Sign in to continue your edit." : "Create your private wardrobe in a minute."}</p>

          <div className="mt-7 grid grid-cols-2 gap-1 bg-surface p-1" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchMode("signin")} className={cn("min-h-11 text-xs font-bold tracking-[0.12em] uppercase transition-colors", mode === "signin" ? "bg-[#180805] text-white" : "text-muted hover:text-foreground")}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")} className={cn("min-h-11 text-xs font-bold tracking-[0.12em] uppercase transition-colors", mode === "signup" ? "bg-[#180805] text-white" : "text-muted hover:text-foreground")}>Create account</button>
          </div>

          {mode === "signin" ? <div className="mt-5 border border-dashed border-accent/40 bg-accent/[0.04] px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[8px] tracking-[0.18em] text-accent uppercase">Temporary house passes</p><p className="mt-1 text-xs text-muted">Choose a persona to test the flow.</p></div><div className="grid shrink-0 gap-1 text-right"><code className="bg-[#180805] px-2 py-1 text-[10px] text-white">admin / admin</code><code className="bg-accent px-2 py-1 text-[10px] text-white">house / house</code></div></div></div> : null}

          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            {mode === "signup" ? <AuthField label="Full name" type="text" value={name} onChange={(value) => { setName(value); clearError("name"); }} autoComplete="name" placeholder="How should we address you?" error={errors.name} /> : null}
            <AuthField label={mode === "signin" ? "Username" : "Email address"} type={mode === "signin" ? "text" : "email"} value={email} onChange={(value) => { setEmail(value); clearError("email"); }} autoComplete={mode === "signin" ? "username" : "email"} placeholder={mode === "signin" ? "Enter admin" : "you@email.com"} error={errors.email} />
            <div>
              <div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="account-password" className="text-xs font-bold tracking-[0.08em] uppercase">Password</label>{mode === "signin" ? <button type="button" onClick={() => setNotice("Password recovery will be connected with live authentication.")} className="text-xs text-muted underline decoration-border underline-offset-4 hover:text-foreground">Forgot password?</button> : null}</div>
              <div className="relative"><input id="account-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); clearError("password"); }} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Enter admin" : "8 characters minimum"} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "account-password-error" : undefined} className={cn("h-13 w-full border bg-background px-4 pr-12 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", errors.password ? "border-accent" : "border-border focus:border-foreground")} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent">{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></div>
              {errors.password ? <p id="account-password-error" className="mt-1.5 flex items-center gap-1.5 text-[11px] text-accent" role="alert"><span className="size-1 rounded-full bg-accent" />{errors.password}</p> : null}
            </div>
            {mode === "signup" ? <AuthField label="Confirm password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(value) => { setConfirmPassword(value); clearError("confirmPassword"); }} autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword} /> : null}
            {mode === "signup" ? <div><label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); clearError("terms"); }} className="mt-0.5 size-4 accent-[var(--accent)]" /><span>I agree to the terms and privacy policy for this storefront preview.</span></label>{errors.terms ? <p className="mt-1.5 pl-7 text-[11px] text-accent" role="alert">{errors.terms}</p> : null}</div> : null}
            {notice ? <p className="text-xs leading-5 text-muted" role="status">{notice}</p> : null}
            <button type="submit" className="flex min-h-14 w-full items-center justify-between bg-accent px-5 text-xs font-bold tracking-[0.14em] text-white uppercase hover:bg-[#c41010] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"><span>{mode === "signin" ? "Sign in" : "Create my account"}</span><ArrowRight size={17} aria-hidden="true" /></button>
          </form>

          <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-muted"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> Preview mode: details stay on this device. Passwords are validated but never stored or sent.</p>
        </div>
      </section>
    </div>
  );
}

function AuthField({ label, type, value, onChange, autoComplete, placeholder, error }: { label: string; type: string; value: string; onChange: (value: string) => void; autoComplete: string; placeholder: string; error?: string }) {
  const id = `account-${label.toLowerCase().replaceAll(" ", "-")}`;
  const errorId = `${id}-error`;
  return <label htmlFor={id} className="block"><span className="mb-2 block text-xs font-bold tracking-[0.08em] uppercase">{label}</span><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cn("h-13 w-full border bg-background px-4 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", error ? "border-accent" : "border-border focus:border-foreground")} />{error ? <span id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[11px] text-accent" role="alert"><span className="size-1 rounded-full bg-accent" />{error}</span> : null}</label>;
}
