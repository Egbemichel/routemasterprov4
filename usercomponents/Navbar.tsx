"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import MenuIcon from '../public/icons/menu-collapse.svg';
import XIcon from '../public/icons/cancel-01.svg';

const navLinks = [
    { href: "/", label: "Home", icon: "/icons/home-01.svg" },
    { href: "/about", label: "About", icon: "/icons/information-circle.svg" },
    { href: "/services", label: "Services", icon: "/icons/customer-service-02.svg" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 w-full bg-primary-200 px-6 md:px-[100px] py-[16px] flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <Image
                    src="/icons/logo-orange.svg"
                    alt="RouteMasterPro logo"
                    width={143}
                    height={40}
                    className="h-auto"
                />
            </div>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 mx-auto">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center space-x-1 px-[16px] py-[8px] rounded-[16px] gap-[10px] transition font-pilcrow text-[14px] ${
                                isActive(href)
                                    ? "bg-[#415078] text-white-color"
                                    : "text-gray-color hover:text-white-color"
                            }`}
                        >
                            <Image src={icon} alt={`${label} Icon`} width={24} height={24} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>

                {/* Sign In */}
                <div className='flex items-center gap-[30px]'>
                    <div className="flex items-center">
                        <Link
                            href="/testimonials"
                            className={`flex items-center text-white-color px-[16px] py-[8px] rounded-[16px] bg-primary-100 hover:bg-blue-700 transition gap-[10px] ${
                                isActive("/testimonials") ? "ring-2 ring-[#E4EDFF] ring-opacity-40" : ""
                            }`}
                        >
                            <Image src="/icons/in-love.svg" alt="Sign In Icon" width={24} height={24} />
                            <span className="text-neutral-50">Testimonials</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Link
                            href="/faq"
                            className={`flex items-center text-white-color px-[16px] py-[8px] rounded-[16px] bg-primary-100 hover:bg-blue-700 transition gap-[10px] ${
                                isActive("/faq") ? "ring-2 ring-[#E4EDFF] ring-opacity-40" : ""
                            }`}
                        >
                            <Image src="/icons/message-question.svg" alt="Sign In Icon" width={24} height={24} />
                            <span className="text-neutral-50">FAQ</span>
                        </Link>
                    </div>
                </div>
                </div>

            {/* Mobile Menu Toggle */}
            <div className="sm:hidden">
                <button onClick={toggleMenu}>
                    <Image src={menuOpen ? XIcon : MenuIcon} alt="Menu Toggle" width={24} height={24} />
                </button>
            </div>

            {/* Mobile Sidebar */}
            {menuOpen && (
                <div className="sm:hidden fixed top-16 left-0 right-0 bg-primary-200 text-white-color flex flex-col space-y-4 px-6 py-4 shadow-md z-40 animate-slide-down">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={toggleMenu}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] ${
                                isActive(href) ? "bg-[#415078] text-white-color" : "text-gray-color hover:text-white-color"
                            }`}
                        >
                            <Image src={icon} alt={`${label} Icon`} width={24} height={24} />
                            <span>{label}</span>
                        </Link>
                    ))}

                    <Link
                        href="/testimonials"
                        onClick={toggleMenu}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[12px] ${
                            isActive("/login") ? "bg-[#E4EDFF] opacity-[20%]" : ""
                        }`}
                    >
                        <Image src="/icons/in-love.svg" alt="Testimonial Icon" width={24} height={24} />
                        <span>Testimonials</span>
                    </Link>
                    <Link
                        href="/faq"
                        onClick={toggleMenu}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[12px] ${
                            isActive("/login") ? "bg-[#E4EDFF] opacity-[20%]" : ""
                        }`}
                    >
                        <Image src="/icons/message-question.svg" alt="FAQ Icon" width={24} height={24} />
                        <span>Faq</span>
                    </Link>
                </div>
            )}
        </nav>
    );
}
