import { siteConfig } from "@/config/site";
import { serviceItems } from "@/features/home/data";

/** Quiet house notes — verified support, checkout, and catalog copy only. */
export function HomeServices() {
  return (
    <section
      aria-label="House notes"
      className="border-y border-border bg-background px-6 py-16 text-foreground sm:px-8 sm:py-20 lg:pr-20"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-3 md:gap-0">
        {serviceItems.map((item, index) => (
          <div
            key={item.id}
            className="md:px-8 md:first:pl-0 md:last:pr-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-border"
          >
            <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-wide">
              {item.title}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{item.body}</p>
            {item.id === "support" ? (
              <p className="mt-4 text-sm">
                <a
                  href={siteConfig.contact.phoneHref}
                  className="underline decoration-gold/70 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
                <span className="text-muted"> · {siteConfig.contact.city}</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
