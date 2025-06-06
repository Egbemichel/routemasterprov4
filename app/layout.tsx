import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import MainLayout from "@/usercomponents/MainLayout";
import dynamic from "next/dynamic";


const ClientWrapper = dynamic(() => import('@/usercomponents/ClientWrapper'), {
  ssr: false,
});

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
      <ClientWrapper />
      <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
