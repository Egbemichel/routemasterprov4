import type { Metadata } from "next";
import "./globals.css";
import FaviconSwitcher from "@/usercomponents/FaviconSwitcher";
import React from "react";
import MainLayout from "@/usercomponents/MainLayout";

export const metadata: Metadata = {
  title: "RouteMasterPro",
  description: "Shipping near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
      <body
      >
      <FaviconSwitcher />
      <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
