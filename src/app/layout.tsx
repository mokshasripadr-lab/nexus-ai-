import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus AI - AI Site Builder",
  description: "Generate and publish beautiful websites instantly with AI.",
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
      </body>
    </html>
  );
}
