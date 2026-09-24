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
    <section className="border-y border-border bg-surface px-6 py-12 sm:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-3">
        {serviceItems.map((item, index) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? MapPin;
          return (
            <div key={item.id} className="flex gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="size-4 text-accent" />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                {item.id === "support" ? (
                  <p className="mt-2 text-sm text-foreground">
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
