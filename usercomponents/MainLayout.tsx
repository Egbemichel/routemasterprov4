'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/usercomponents/Navbar';
import Footer from '@/usercomponents/Footer';
import Image from 'next/image';
import React from 'react';
import FaviconSwitcher from '@/usercomponents/FaviconSwitcher';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isTrackingPage = pathname.startsWith('/track/');
    const isAdminPage = pathname.startsWith('/admin/');

    const showNavFooter = isHome || (!isTrackingPage && !isAdminPage);
    const showChatWidget = isHome || (!isTrackingPage && !isAdminPage);

    useEffect(() => {
        if (!showChatWidget) return;

        // Prevent injecting the script multiple times
        if (document.getElementById('momentcrm-script')) return;

        const script = document.createElement('script');
        script.id = 'momentcrm-script';
        script.src = 'https://www.momentcrm.com/embed';
        script.async = true;

        script.onload = () => {
            if (typeof window !== 'undefined' && typeof (window as any).MomentCRM !== 'undefined') {
                (window as any).MomentCRM('init', {
                    teamVanityId: 'routemasterpro',
                    doChat: true,
                    doTimeTravel: true,
                    quadClickForFeedback: true,
                });
            }
        };

        document.body.appendChild(script);

        return () => {
            // Optional cleanup if you want to disable chat on route change
            const existing = document.getElementById('momentcrm-script');
            if (existing) existing.remove();
        };
    }, [showChatWidget]);

    return (
        <>
            {showNavFooter && <Navbar />}
            <FaviconSwitcher />
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
