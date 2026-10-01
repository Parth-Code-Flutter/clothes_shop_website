import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { adminBrand, adminThemeCss } from "@/features/admin/config/admin-brand";

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
      className={`${sans.variable} flex min-h-dvh flex-1 flex-col bg-adm-canvas font-adm-sans text-adm-ink antialiased`}
    >
      <style>{adminThemeCss()}</style>
      {children}
    </div>
  );
}
