import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CorpAI Portal | Agent workforce management",
  description: "The premium dashboard for the CorpAI open standard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-[#0a0a0b] text-white overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
