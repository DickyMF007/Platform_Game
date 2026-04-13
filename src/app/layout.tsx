import { MobileNav, TopNav } from "@/components/site-nav";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eve Alliance Hub",
  description:
    "Platform informasi state, aliansi, player, leaderboard, dan pendaftaran Whiteout Survival.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 md:pb-8">
          <TopNav />
          <main className="flex-1 py-4">{children}</main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
