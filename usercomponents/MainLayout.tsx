"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/usercomponents/Navbar";
import Footer from "@/usercomponents/Footer";
import Image from "next/image";
import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isTrackingPage = pathname.startsWith("/track/");
    const isAdminPage = pathname.startsWith("/admin/");

    // Show Navbar and Footer only on home or pages that are NOT tracking or admin
    const showNavFooter = isHome || (!isTrackingPage && !isAdminPage);

    return (
        <>
            {showNavFooter && <Navbar />}
            <main>{children}</main>
            {showNavFooter && (
                <Footer
                    leftContent={
                        <Image
                            src="/icons/logo-black.svg"
                            alt="RouteMasterPro Logo"
                            width={143}
                            height={40}
                        />
                    }
                    rightContent={
                        <p className="text-gray-color text-body">
                            © 2025 - RouteMasterPro. All rights reserved.
                        </p>
                    }
                />
            )}
        </>
    );
}
