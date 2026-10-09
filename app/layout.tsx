import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import MainLayout from "@/usercomponents/MainLayout";
import { Onest } from "next/font/google";

const onest = Onest({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "GlobexiaCorp",
  description: "Shipping near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={onest.variable}>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
      <body className="bg-[#eef0fb]">
      <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
