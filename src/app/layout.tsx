import type { Metadata } from "next";
import { Montserrat, Open_Sans, Roboto_Condensed } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-heading',
  weight: ['400', '600', '700', '800'],
  display: 'swap'
});

const openSans = Open_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

const robotoCondensed = Roboto_Condensed({ 
  subsets: ['latin'], 
  variable: '--font-game-ui',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: "GameHub - Your Ultimate Mini-Games Platform",
  description: "Discover, play, and compete in hundreds of browser-based mini-games. Join our gaming community with leaderboards, achievements, and social features.",
  keywords: ["mini games", "browser games", "online games", "gaming platform", "leaderboards", "achievements"],
  authors: [{ name: "GameHub Team" }],
  creator: "GameHub",
  metadataBase: new URL("https://gamehub.example.com"),
  openGraph: {
    title: "GameHub - Your Ultimate Mini-Games Platform",
    description: "Discover, play, and compete in hundreds of browser-based mini-games with friends.",
    url: "https://gamehub.example.com",
    siteName: "GameHub",
    images: [
      {
        url: "/generated/logo.png",
        width: 1200,
        height: 630,
        alt: "GameHub - Mini Games Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameHub - Your Ultimate Mini-Games Platform",
    description: "Discover, play, and compete in hundreds of browser-based mini-games with friends.",
    images: ["/generated/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${openSans.variable} ${robotoCondensed.variable} font-body antialiased`}
      >
        <Script src="/phoenix-tracking.js" strategy="afterInteractive" />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Navigation />
              {children}
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
