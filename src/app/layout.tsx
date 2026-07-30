import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "FirstBite - Gourmet Restaurant Management System",
  description: "Full-stack restaurant management system with Next.js, Drizzle, and real-time operations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-slate-950 text-white antialiased font-sans selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
