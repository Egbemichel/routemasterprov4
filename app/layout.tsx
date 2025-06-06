import type { Metadata } from "next";
import "./globals.css";
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

    <script type="text/javascript">
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/6810f8c4e616e1190d99eaf5/1iq14ngnf';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
    </script>

      <body
      >
      <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
