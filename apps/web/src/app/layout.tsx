import "./globals.css";

import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Instrument_Sans } from "next/font/google";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Taj Band — Wedding Band & Baraat, Delhi",
    template: "%s | Taj Band — Wedding Band & Baraat, Delhi",
  },
  description:
    "Taj Band, New Delhi — brass band, dhol, DJ on wheels, umbrella lights, vintage cars and baggi. One booking for your whole baraat across Delhi-NCR.",
};

export const viewport: Viewport = {
  themeColor: "#1E0A06",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${dmSerif.variable} ${instrumentSans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
