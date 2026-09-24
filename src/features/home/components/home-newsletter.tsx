"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      setMessage("Enter a valid email to preview the form.");
      return;
    }
    setMessage(
      "Subscriptions are not connected yet. Your email was not saved or sent.",
    );
  }

  return (
    <section className="bg-background px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 border border-border bg-surface px-6 py-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-lg">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Next screening
          </p>
          <h2 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Stay on the list
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Preview only. Nothing is subscribed, stored, or emailed from this
            form.
          </p>
        </div>
        <form onSubmit={onSubmit} className="w-full max-w-md" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage(null);
              }}
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            <Button type="submit">Preview join</Button>
          </div>
          {message ? (
            <p className="mt-3 text-sm text-muted" role="status">
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
