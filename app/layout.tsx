import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corporate Giving Hub",
  description: "AAPLE Corporate Giving competition — leaderboard, analytics, and more.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await prisma.campaignSettings.findFirst();
  const campaignName = settings?.campaignName ?? "Corporate Giving Hub";
  const committeeName = settings?.committeeName ?? "AAPLE Corporate Giving Committee";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Navbar campaignName={campaignName} />
        <main className="flex-1">{children}</main>
        <Footer committeeName={committeeName} />
      </body>
    </html>
  );
}
