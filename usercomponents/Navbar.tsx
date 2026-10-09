"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { Home, Info, Briefcase, Heart, HelpCircle, Menu, X } from "lucide-react";
import Logo from "@/usercomponents/Logo";

const navLinks = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/about", label: "About", Icon: Info },
    { href: "/services", label: "Services", Icon: Briefcase },
    { href: "/testimonials", label: "Testimonials", Icon: Heart },
    { href: "/faq", label: "FAQ", Icon: HelpCircle },
];

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const isActive = (href: string) => pathname === href;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-nav-logo]", { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" });
            gsap.fromTo(
                "[data-nav-pill]",
                { y: -24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.15, ease: "back.out(1.6)", clearProps: "all" },
            );
        }, navRef);
        return () => ctx.revert();
    }, []);

    return (
        <nav
            ref={navRef}
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled ? "bg-[#eef0fb]/75 backdrop-blur-md shadow-[0_8px_30px_-18px_rgba(18,18,63,0.35)]" : "bg-transparent"
            }`}
        >
            <div className="mx-auto flex h-[88px] max-w-[1600px] items-center justify-between px-5 md:px-8">
                <Link href="/" data-nav-logo aria-label="GlobexiaCorp home" className="rounded-full bg-white/80 py-2 pl-3 pr-4 shadow-[0_8px_20px_-12px_rgba(18,18,63,0.5)] backdrop-blur-md">
                    <Logo />
                </Link>

                {/* Desktop */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
                    {navLinks.map(({ href, label, Icon }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                data-nav-pill
                                className={`group flex items-center gap-2 rounded-full border px-5 py-[11px] text-[14px] font-medium transition-all duration-300 ${
                                    active
                                        ? "border-[#12123f] bg-[#12123f] text-white shadow-[0_10px_24px_-10px_rgba(18,18,63,0.7)]"
                                        : "border-white bg-white/90 text-[#12123f] shadow-[0_8px_20px_-12px_rgba(18,18,63,0.5)] backdrop-blur-md hover:-translate-y-0.5 hover:border-[#ff5a0a] hover:bg-white hover:text-[#ff5a0a]"
                                }`}
                            >
                                {active && <Icon size={16} strokeWidth={2} />}
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((p) => !p)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    data-nav-pill
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#12123f]/25 bg-white/90 text-[#12123f] shadow-md lg:hidden"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile panel */}
            {menuOpen && (
                <div className="mx-4 flex flex-col gap-2 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-md lg:hidden">
                    {navLinks.map(({ href, label, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-full px-5 py-3 text-[15px] font-medium ${
                                isActive(href) ? "bg-[#12123f] text-white" : "text-[#12123f] hover:bg-[#12123f]/5"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
