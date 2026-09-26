"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Package,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAccount } from "@/features/account/account-provider";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type AuthFieldName = "name" | "email" | "password" | "confirmPassword" | "terms";
type AuthErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nameFromEmail(email: string) {
  const raw = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Guest";
  return raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AccountView() {
  const { account, signedIn, saveAccount, signOut } = useAccount();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(account?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

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

    const nextErrors: AuthErrors = {};
    if (!cleanEmail) nextErrors.email = "Email address is required.";
    else if (!EMAIL_PATTERN.test(cleanEmail)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (mode === "signup") {
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
      name: mode === "signup" ? cleanName : account?.name ?? nameFromEmail(cleanEmail),
      email: cleanEmail,
    });
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setNotice(mode === "signup" ? "Your local preview account is ready." : "Welcome back.");
  }

  if (signedIn && account) {
    return (
      <div className="bg-background text-foreground">
        <header className="border-b border-border bg-[#180805] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto flex max-w-[1360px] flex-wrap items-end justify-between gap-6">
            <div><p className="text-[10px] font-bold tracking-[0.3em] text-[#ff5c53] uppercase">Your private wardrobe</p><h1 className="mt-3 font-display text-6xl leading-none tracking-wide sm:text-8xl">Hey, {account.name.split(" ")[0]}.</h1></div>
            <button type="button" onClick={() => { signOut(); setNotice("Signed out on this device."); }} className="min-h-11 border border-white/25 px-5 text-xs font-bold tracking-[0.14em] uppercase hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Sign out</button>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-12 lg:py-14">
          <aside className="h-fit border border-border bg-[#f3eee7] p-6 text-[#160604] dark:bg-surface dark:text-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#180805] text-white dark:bg-background"><UserRound size={19} aria-hidden="true" /></span>
            <p className="mt-5 font-display text-3xl tracking-wide">{account.name}</p>
            <p className="mt-1 break-all text-xs opacity-60">{account.email}</p>
            <div className="mt-6 border-t border-black/10 pt-5 text-[11px] leading-5 opacity-60 dark:border-white/10">Profile is saved locally on this device. Server account sync will be connected before launch.</div>
          </aside>

          <section aria-labelledby="account-overview-title">
            <p className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">Account overview</p>
            <h2 id="account-overview-title" className="mt-2 font-display text-5xl tracking-wide">Your scene, organised.</h2>
            {notice ? <p className="mt-3 text-sm text-muted" role="status">{notice}</p> : null}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <AccountTile href="/cart" icon={ShoppingBag} label="Shopping bag" value={`${itemCount} ${itemCount === 1 ? "piece" : "pieces"}`} action="Open bag" />
              <AccountTile href="/wishlist" icon={Heart} label="Saved edit" value={`${wishlistCount} saved`} action="View saves" />
            </div>
            <div className="mt-8 border border-border p-6 sm:p-8">
              <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"><Package size={18} aria-hidden="true" /></span><div><p className="font-display text-3xl tracking-wide">No orders yet.</p><p className="mt-2 max-w-lg text-sm leading-6 text-muted">When live checkout is connected, order status, delivery progress, invoices, and returns will live here.</p><Link href="/shop" className="mt-5 inline-flex min-h-10 items-center gap-3 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Explore the wardrobe <ArrowRight size={15} aria-hidden="true" /></Link></div></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-76px)] bg-[#f4efe8] text-foreground dark:bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative isolate hidden overflow-hidden bg-[#180805] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-28 -bottom-28 -z-10 size-[520px] rounded-full border border-white/10" aria-hidden="true"><div className="absolute inset-16 rounded-full border border-white/10" /><div className="absolute inset-32 rounded-full border border-accent/35" /></div>
        <span className="absolute top-8 right-8 rotate-6 border border-[#ff5c53]/60 px-4 py-3 text-center font-mono text-[9px] leading-4 tracking-[0.2em] text-[#ff5c53] uppercase" aria-hidden="true">House pass<br />No. 001</span>
        <span className="pointer-events-none absolute top-1/2 -left-8 -z-10 -translate-y-1/2 rotate-90 font-display text-[10rem] leading-none text-white/[0.025]" aria-hidden="true">MEMBER</span>
        <div><p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-[#ff5c53] uppercase"><Sparkles size={13} aria-hidden="true" /> Members of the house</p><h1 className="mt-5 max-w-xl font-display text-7xl leading-[0.88] tracking-wide xl:text-8xl">Your wardrobe,<br /><span className="text-[#ff3b30]">remembered.</span></h1><p className="mt-6 max-w-md text-sm leading-7 text-white/55">Save the pieces you love, keep your bag close, and find every order in one private space.</p></div>
        <ul className="grid gap-3 text-xs text-white/70"><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Keep your saved edit together</li><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Move through checkout faster</li><li className="flex items-center gap-3"><Check className="text-[#ff5c53]" size={15} aria-hidden="true" /> Track future orders in one place</li></ul>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-8 lg:px-12">
        <span className="pointer-events-none absolute top-7 right-8 font-mono text-[9px] tracking-[0.2em] text-muted uppercase">01 — Member access</span>
        <div className="w-full max-w-lg border border-black/10 bg-background p-6 shadow-[0_28px_80px_rgba(22,6,4,0.08)] dark:border-white/10 sm:p-9">
          <div className="flex items-center gap-3"><span className="h-px w-8 bg-accent" /><p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">House of Bollywood</p></div>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-wide sm:text-6xl">{mode === "signin" ? "Welcome back." : "Join the house."}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{mode === "signin" ? "Sign in to continue your edit." : "Create your private wardrobe in a minute."}</p>

          <div className="mt-7 grid grid-cols-2 gap-1 bg-surface p-1" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchMode("signin")} className={cn("min-h-11 text-xs font-bold tracking-[0.12em] uppercase transition-colors", mode === "signin" ? "bg-[#180805] text-white" : "text-muted hover:text-foreground")}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")} className={cn("min-h-11 text-xs font-bold tracking-[0.12em] uppercase transition-colors", mode === "signup" ? "bg-[#180805] text-white" : "text-muted hover:text-foreground")}>Create account</button>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            {mode === "signup" ? <AuthField label="Full name" type="text" value={name} onChange={(value) => { setName(value); clearError("name"); }} autoComplete="name" placeholder="How should we address you?" error={errors.name} /> : null}
            <AuthField label="Email address" type="email" value={email} onChange={(value) => { setEmail(value); clearError("email"); }} autoComplete="email" placeholder="you@email.com" error={errors.email} />
            <div>
              <div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="account-password" className="text-xs font-bold tracking-[0.08em] uppercase">Password</label>{mode === "signin" ? <button type="button" onClick={() => setNotice("Password recovery will be connected with live authentication.")} className="text-xs text-muted underline decoration-border underline-offset-4 hover:text-foreground">Forgot password?</button> : null}</div>
              <div className="relative"><input id="account-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); clearError("password"); }} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="8 characters minimum" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "account-password-error" : undefined} className={cn("h-13 w-full border bg-background px-4 pr-12 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", errors.password ? "border-accent" : "border-border focus:border-foreground")} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent">{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></div>
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

function AccountTile({ href, icon: Icon, label, value, action }: { href: string; icon: typeof Heart; label: string; value: string; action: string }) {
  return <Link href={href} className="group flex min-h-40 flex-col justify-between border border-border p-5 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><div className="flex items-start justify-between"><Icon size={19} aria-hidden="true" /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></div><div><p className="text-[10px] font-bold tracking-[0.16em] text-muted uppercase">{label}</p><p className="mt-1 font-display text-4xl tracking-wide">{value}</p><span className="mt-2 block text-[11px] text-muted">{action}</span></div></Link>;
}
