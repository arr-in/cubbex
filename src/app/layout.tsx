import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import GlobalOverlays from "@/components/GlobalOverlays";
import RouteTransitionProvider from "@/components/RouteTransition/RouteTransitionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CUBEX - AI Rubik's Cube Solver",
  description: "Solve any cube in seconds with our advanced AI algorithm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} antialiased`}
      >
        <GlobalOverlays />
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </body>
    </html>
  );
}