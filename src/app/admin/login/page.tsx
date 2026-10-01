import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DEV_ADMIN, usingDevCredentials } from "@/features/admin/auth/credentials";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { AdminMonogram } from "@/features/admin/components/admin-monogram";
import { AdminThemeToggle } from "@/features/admin/components/admin-theme-toggle";
import { LoginForm } from "@/features/admin/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/admin") ? next : undefined;
  const devCredentials = usingDevCredentials() ? { email: DEV_ADMIN.email, password: DEV_ADMIN.password } : null;

  return (
    <main className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <section className="relative flex flex-col px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-adm-ink-soft transition-colors hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-adm-accent"
          >
            <ArrowLeft className="size-4" strokeWidth={1.6} aria-hidden="true" />
            Back to store
          </Link>
          <AdminThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <AdminMonogram />
            <div className="leading-tight">
              <p className="font-adm-display text-[15px] font-semibold">{adminBrand.name}</p>
              <p className="text-[12px] text-adm-ink-faint">{adminBrand.consoleLabel}</p>
            </div>
          </div>

          <p className="text-[12px] font-semibold tracking-[0.08em] text-adm-accent uppercase">Owner access</p>
          <h1 className="mt-2 font-adm-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[2rem]">
            Welcome back
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-adm-ink-soft">
            Sign in to manage orders, catalogue and customers for {adminBrand.name}.
          </p>

          <div className="mt-9">
            <LoginForm next={nextPath} devCredentials={devCredentials} />
          </div>

          <p className="mt-8 flex items-center gap-2 text-[12px] text-adm-ink-faint">
            <ShieldCheck className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            Encrypted session · Repeated failed attempts are locked for 10 minutes
          </p>
        </div>

        <p className="text-center text-[12px] text-adm-ink-faint lg:text-left">
          © {new Date().getFullYear()} {adminBrand.name}. Restricted to authorised staff.
        </p>
      </section>
    </main>
  );
}

function BrandPanel() {
  return (
    <aside data-admin-dark className="relative hidden overflow-hidden bg-adm-sidebar p-10 text-adm-sidebar-ink lg:flex lg:flex-col xl:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[560px] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--adm-sidebar-accent), transparent 65%)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-6 rounded-[28px] border border-adm-sidebar-line xl:inset-8" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-6 font-adm-display text-[18rem] leading-none font-bold tracking-[-0.04em] text-adm-sidebar-ink opacity-[0.035] select-none"
      >
        {adminBrand.monogram}
      </span>

      <div className="relative flex items-center gap-3">
        <AdminMonogram onSidebar />
        <div className="leading-tight">
          <p className="font-adm-display text-[15px] font-semibold">{adminBrand.name}</p>
          <p className="text-[12px] text-adm-sidebar-ink-soft">{adminBrand.consoleLabel}</p>
        </div>
      </div>

      <div className="relative mt-auto max-w-lg">
        <span aria-hidden="true" className="block h-px w-14 bg-adm-sidebar-accent" />
        <h2 className="mt-8 font-adm-display text-4xl leading-[1.1] font-semibold tracking-[-0.025em] xl:text-[2.75rem]">
          Every collection,
          <br />
          <span className="text-adm-sidebar-accent">managed</span> from one desk.
        </h2>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-adm-sidebar-ink-soft">
          Orders, catalogue, inventory and customers in one quiet, considered workspace built for the person who runs the house.
        </p>
      </div>

      <dl className="relative mt-14 grid grid-cols-3 gap-6 border-t border-adm-sidebar-line pt-8">
        {[
          ["Orders", "Track & fulfil"],
          ["Catalogue", "Edit & publish"],
          ["Customers", "Know your regulars"],
        ].map(([title, body]) => (
          <div key={title}>
            <dt className="font-adm-display text-[15px] font-semibold">{title}</dt>
            <dd className="mt-1 text-[13px] text-adm-sidebar-ink-soft">{body}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
