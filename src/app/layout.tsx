import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import { Tajawal, Playfair_Display } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wahaj-landing-page-cwxo.vercel.app"),
  title: "Wahaj — Launching Soon",
  description:
    "A new platform for buying certified physical gold and silver, built on transparency, responsible sourcing, and secure delivery.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070506",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tajawal.variable} ${playfair.variable}`}>
      <body className="appBody">{children}</body>
    </html>
  );
}
