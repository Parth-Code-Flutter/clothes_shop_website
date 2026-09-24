"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { siteConfig } from "@/config/site";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
] as const;

const PREVIEW_LINKS = [
  { label: "About", action: "About" },
  { label: "Blog", action: "Blog" },
] as const;

export function SiteFooter() {
  const [preview, setPreview] = useState<string | null>(null);
  const { contact } = siteConfig;

  return (
    <footer className="mt-auto border-t border-border bg-footer text-footer-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <Link href="/" className="inline-flex rounded-md bg-white px-3 py-2">
            <Image
              src="/brand/house-of-bollywood-logo.png"
              alt={siteConfig.name}
              width={1024}
              height={341}
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-footer-foreground/70">
            {siteConfig.tagline}. Graphic tees from the House of Bollywood
            catalog.
          </p>
        </div>

        <div>
          <p className="font-display text-lg tracking-[0.2em] uppercase text-gold">
            Explore
          </p>
          <ul className="mt-4 space-y-3">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-footer-foreground/80 transition-colors hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {PREVIEW_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => setPreview(link.action)}
                  className="text-sm text-footer-foreground/80 transition-colors hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-lg tracking-[0.2em] uppercase text-gold">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm text-footer-foreground/80">
            <li>{contact.city}</li>
            <li>
              <a
                href={contact.phoneHref}
                className="hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={contact.emailHref}
                className="hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-footer-foreground/10 px-4 py-5 text-center text-xs text-footer-foreground/50 sm:px-6 lg:px-10">
        © {new Date().getFullYear()} {siteConfig.name}. Homepage preview.
      </div>

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </footer>
  );
}
