import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import TextCursor from "@/components/TextCursor/TextCursor";
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
        <CustomCursor />
        <TextCursor 
          text="CUBEX"
          spacing={130}
          followMouseDirection={true}
          randomFloat={true}
          exitDuration={0.6}
          removalInterval={40}
          maxPoints={6}
        />
        {children}
      </body>
    </html>
  );
}