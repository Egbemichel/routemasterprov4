"use client";

import React, { useEffect, useRef } from "react";
import { Calculator, Route } from "lucide-react";
import { gsap } from "gsap";
import TrackingDialog from "@/usercomponents/TrackingDialog";
import ContainerScene from "@/usercomponents/hero/ContainerScene";
import { DeliveryCard, ToolsCard, TruckCard, UsersBadge } from "@/usercomponents/hero/HeroCards";

/** A headline line that slides up out of a mask. */
const Line = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`block overflow-hidden pb-[0.22em] -mb-[0.14em] ${className}`}>
        <span data-line className="block will-change-transform">
            {children}
        </span>
    </span>
);

const HeroSection = () => {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // follow wall-clock time even when frames are slow, so the intro always finishes on schedule
        gsap.ticker.lagSmoothing(0);
        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.25 });
            tl.from("[data-line]", { yPercent: 115, rotate: 2, duration: 1.1, stagger: 0.12 })
                .from("[data-sub]", { y: 24, opacity: 0, duration: 0.9 }, "-=0.7")
                .from("[data-cta]", { y: 30, opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.6")
                .from("[data-float]", { y: 50, opacity: 0, duration: 1, stagger: 0.12 }, "-=0.8")
                .from("[data-progress]", { scaleX: 0, duration: 1.6, ease: "power2.out" }, "-=0.6");

            // cards bob gently once they have landed
            gsap.utils.toArray<HTMLElement>("[data-bob]").forEach((el, i) => {
                gsap.to(el, {
                    y: i % 2 ? 8 : -8,
                    duration: 2.6 + i * 0.4,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                    delay: 2.2,
                });
            });

            gsap.to("[data-pulse]", { scale: 1.12, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out", delay: 2 });

            const onMove = (e: PointerEvent) => {
                const x = e.clientX / window.innerWidth - 0.5;
                const y = e.clientY / window.innerHeight - 0.5;
                gsap.to("[data-parallax]", { x: x * -18, y: y * -10, duration: 1.2, ease: "power3.out" });
            };
            window.addEventListener("pointermove", onMove);
            return () => window.removeEventListener("pointermove", onMove);
        }, root);
        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={root}
            className="relative -mt-[88px] overflow-hidden bg-gradient-to-b from-[#eceef9] via-[#e7e9f7] to-[#eef0fb] pt-[88px] font-display lg:h-[max(100svh,880px)]"
        >
            <div className="pointer-events-none absolute -left-[10%] top-[8%] h-[70%] w-[60%] rounded-full bg-[#ff5a0a]/10 blur-[120px]" />

            {/* 3D swinging container stack */}
            <div className="absolute inset-0 z-0">
                <ContainerScene />
            </div>

            {/* Headline */}
            <div
                data-parallax
                className="pointer-events-none relative z-10 mx-auto w-full max-w-[1600px] px-5 pt-20 md:px-10 lg:absolute lg:inset-x-0 lg:top-[21%] lg:pt-0"
            >
                <h1 className="text-[clamp(2.4rem,6.3vw,7.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-[#12123f] md:whitespace-nowrap">
                    <Line>
                        Moving What Matters <span className="text-[#ff5a0a]">Most</span>
                    </Line>
                    <Line className="md:pl-[12%]">Anywere.</Line>
                    <Line className="md:text-right">
                        <span className="text-[#ff5a0a]">On Time.</span> Every Time.
                    </Line>
                </h1>
            </div>

            {/* Side copy */}
            <div
                data-sub
                className="relative z-10 mt-6 px-5 md:px-10 lg:absolute lg:right-[3%] lg:top-[120px] lg:mt-0 lg:w-[250px] lg:px-0 lg:text-right"
            >
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#ff5a0a]">
                    Delivering beyond borders
                </p>
                <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-[#12123f]/60 lg:ml-auto">
                    Optimize your supply chain with <b className="font-medium text-[#12123f]">real-time tracking</b> and
                    smart fleet analytics.
                </p>
            </div>

            {/* CTAs */}
            <div className="relative z-20 mt-6 flex flex-wrap items-center gap-3 px-5 md:px-10 lg:absolute lg:left-[50%] lg:top-[61%] lg:mt-0 lg:px-0">
                <div data-cta className="relative">
                    <span data-pulse className="pointer-events-none absolute inset-0 rounded-full bg-[#ff5a0a]/50" />
                    <TrackingDialog
                        trigger={
                            <button
                                type="button"
                                className="relative flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-8 py-4 text-[16px] font-medium text-white shadow-[0_14px_30px_-10px_rgba(255,90,10,0.8)] ring-4 ring-[#ff5a0a]/20 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03] active:scale-95"
                            >
                                <Route size={20} />
                                Track Now
                            </button>
                        }
                    />
                </div>
                <button
                    type="button"
                    data-cta
                    className="flex items-center gap-2 rounded-full border border-[#12123f]/25 bg-white px-8 py-4 text-[16px] font-medium text-[#12123f] transition-all duration-300 hover:-translate-y-1 hover:border-[#12123f] hover:bg-[#12123f] hover:text-white active:scale-95"
                >
                    <Calculator size={20} />
                    Get a Quote
                </button>
            </div>

            {/* Floating UI cards */}
            <div className="relative z-10 mt-10 flex flex-col items-start gap-5 px-5 pb-10 md:px-10 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:p-0 lg:pb-0 [&>*]:pointer-events-auto">
                <div data-float className="lg:absolute lg:left-[3%] lg:top-[38%]">
                    <div data-bob>
                        <TruckCard />
                    </div>
                </div>
                <div data-float className="lg:absolute lg:bottom-[5%] lg:left-[37%]">
                    <div data-bob>
                        <DeliveryCard />
                    </div>
                </div>
                <div data-float className="w-full lg:absolute lg:bottom-[5%] lg:right-[3%] lg:w-auto">
                    <ToolsCard />
                </div>
                <div data-float className="lg:absolute lg:bottom-[5%] lg:left-[3%]">
                    <UsersBadge />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
