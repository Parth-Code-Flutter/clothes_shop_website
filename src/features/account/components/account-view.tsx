"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/account/account-provider";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

export function AccountView() {
  const { account, signedIn, saveAccount, signOut } = useAccount();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    if (!nextName || !nextEmail) {
      setError("Name and email are required.");
      setNote(null);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email.");
      setNote(null);
      return;
    }
    saveAccount({ name: nextName, email: nextEmail });
    setError(null);
    setNote(
      "Saved on this device only. No password, server account, or email was sent.",
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
        Account
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
        {signedIn ? `Hey, ${account?.name}` : "Your space"}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        Local profile preview for Gen Z checkout vibes. This is not live login —
        nothing hits a server yet.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/cart"
          className="rounded-3xl border border-border bg-surface px-5 py-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="block text-xs tracking-[0.18em] text-muted uppercase">
            Bag
          </span>
          <span className="mt-1 font-display text-3xl tracking-wide">
            {itemCount} {itemCount === 1 ? "piece" : "pieces"}
          </span>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-3xl border border-border bg-surface px-5 py-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="block text-xs tracking-[0.18em] text-muted uppercase">
            Wishlist
          </span>
          <span className="mt-1 font-display text-3xl tracking-wide">
            {wishlistCount} saved
          </span>
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 space-y-4 rounded-3xl border border-border bg-surface p-6"
        noValidate
      >
        <p className="font-display text-3xl tracking-wide text-foreground">
          {signedIn ? "Edit local profile" : "Save a local profile"}
        </p>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Name</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            autoComplete="name"
            className={cn(
              "h-12 rounded-full border border-border bg-background px-4 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            autoComplete="email"
            className="h-12 rounded-full border border-border bg-background px-4 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
        {error ? <p className="text-xs text-accent">{error}</p> : null}
        {note ? (
          <p className="text-xs leading-5 text-muted" role="status">
            {note}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="w-full sm:w-auto">
            {signedIn ? "Update profile" : "Save profile"}
          </Button>
          {signedIn ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                signOut();
                setName("");
                setEmail("");
                setNote("Signed out on this device.");
                setError(null);
              }}
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
