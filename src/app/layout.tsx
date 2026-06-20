import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus AI - AI Developer Platform",
  description: "Nexus AI is a unified AI development platform. Generate production-ready React and Next.js code, chat with GPT-4, Claude, and Gemini, and automate workflows — all in one place.",
  openGraph: {
    title: "Nexus AI - AI Developer Platform",
    description: "Nexus AI is a unified AI development platform. Generate production-ready React and Next.js code, chat with GPT-4, Claude, and Gemini, and automate workflows — all in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexus AI",
      },
    ],
    url: "https://nexusai.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={outfit.className}>
        <AuthProvider>
          <div className="animated-bg" />
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
