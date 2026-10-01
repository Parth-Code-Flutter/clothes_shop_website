import type { ReactNode } from "react";

/** A titled dashboard band; `id` is the jump target used by the toolbar. */
export function DashboardSection({
  id,
  title,
  description,
  aside,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-[150px] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-adm-line pb-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-[17px] leading-tight font-semibold tracking-[-0.015em]">
            {title}
          </h2>
          {description ? <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-adm-ink-soft">{description}</p> : null}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
