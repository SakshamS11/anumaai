import type { Metadata } from "next";
import { IBM_Plex_Sans, Noto_Sans_Devanagari } from "next/font/google";
import type { ReactNode } from "react";

import { AuthFragmentGuard } from "@/components/auth/auth-fragment-guard";

import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex", display: "swap" });
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ANUMA | Frontline Interaction Intelligence",
    template: "%s | ANUMA",
  },
  description: "Evidence-backed intelligence for high-value frontline customer interactions.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plex.variable} ${devanagari.variable}`}>
        <AuthFragmentGuard />
        {children}
      </body>
    </html>
  );
}
