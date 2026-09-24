import { Phone, MapPin, ShieldCheck } from "lucide-react";
import { serviceItems } from "@/features/home/data";
import { siteConfig } from "@/config/site";

const ICONS = {
  support: Phone,
  secure: ShieldCheck,
  picks: MapPin,
} as const;

export function HomeServices() {
  return (
    <section className="border-y border-border bg-surface px-4 py-14 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {serviceItems.map((item) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? MapPin;
          return (
            <div key={item.id} className="flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl tracking-wide text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                {item.id === "support" ? (
                  <p className="mt-3 text-sm text-foreground">
                    <a
                      href={siteConfig.contact.phoneHref}
                      className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {siteConfig.contact.phoneDisplay}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
