import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { adminBrand, adminThemeCss } from "@/features/admin/config/admin-brand";

const display = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  variable: "--font-adm-display",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-adm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${adminBrand.consoleLabel} · ${adminBrand.name}`,
    template: `%s · ${adminBrand.consoleLabel}`,
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-admin
      className={`${display.variable} ${sans.variable} flex min-h-dvh flex-1 flex-col bg-adm-canvas font-adm-sans text-adm-ink`}
    >
      <style>{adminThemeCss()}</style>
      {children}
    </div>
  );
}
