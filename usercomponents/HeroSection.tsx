"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import TrackingDialog from "@/usercomponents/TrackingDialog";
import ContainerScene from "@/usercomponents/hero/ContainerScene";

/** A headline line that slides up out of a mask. */
const Line = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
        <span data-line className="block will-change-transform">
            {children}
        </span>
    </span>
);

const HeroSection = () => {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) return;

            const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.25 });
            tl.from("[data-line]", { yPercent: 115, rotate: 2, duration: 1.1, stagger: 0.12 })
                .from("[data-sub]", { y: 24, opacity: 0, duration: 0.9 }, "-=0.7")
                .from("[data-cta]", { y: 30, opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.6");

            // gentle idle pulse on the primary CTA ring
            gsap.to("[data-pulse]", { scale: 1.12, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out", delay: 2 });

            // parallax: headline drifts against the pointer
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
            className="relative -mt-[88px] flex min-h-[100svh] flex-col justify-center overflow-hidden bg-gradient-to-b from-[#eceef9] via-[#e7e9f7] to-[#eef0fb] pt-[88px] font-display"
        >
            {/* soft glow behind the containers */}
            <div className="pointer-events-none absolute -left-[10%] top-[8%] h-[70%] w-[60%] rounded-full bg-[#ff5a0a]/10 blur-[120px]" />

            {/* 3D swinging container stack */}
            <div className="absolute inset-0 z-0">
                <ContainerScene />
            </div>

            <div data-parallax className="pointer-events-none relative z-10 mx-auto w-full max-w-[1600px] px-5 md:px-10">
                <h1 className="text-[#12123f] text-[clamp(2.4rem,7vw,8rem)] md:whitespace-nowrap font-medium leading-[0.92] tracking-[-0.045em]">
                    <Line>
                        Moving What Matters <span className="text-[#ff5a0a]">Most</span>
                    </Line>
                    <Line className="md:pl-[12%]">Anywere.</Line>
                    <Line className="md:text-right">
                        <span className="text-[#ff5a0a]">On Time.</span> Every Time.
                    </Line>
                </h1>
            </div>

            <div className="relative z-10 mx-auto mt-8 flex w-full max-w-[1600px] flex-col gap-8 px-5 md:mt-10 md:flex-row md:items-start md:justify-between md:px-10">
                <p
                    data-sub
                    className="max-w-[260px] text-[15px] leading-snug text-[#12123f]/60 md:order-2 md:max-w-[240px] md:text-right"
                >
                    Delivering beyond borders
                </p>

                <div className="flex flex-wrap items-center gap-3 md:order-1 md:ml-auto md:mr-[4%]">
                    <div data-cta className="relative">
                        <span
                            data-pulse
                            className="pointer-events-none absolute inset-0 rounded-full bg-[#ff5a0a]/50"
                        />
                        <TrackingDialog
                            trigger={
                                <button
                                    type="button"
                                    className="relative flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-8 py-4 text-[16px] font-medium text-white shadow-[0_14px_30px_-10px_rgba(255,90,10,0.8)] ring-4 ring-[#ff5a0a]/20 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03] active:scale-95"
                                >
                                    <Image src="/icons/route-03.svg" alt="" width={22} height={22} />
                                    Track Now
                                </button>
                            }
                        />
                    </div>
                    <button
                        type="button"
                        data-cta
                        className="flex items-center gap-2 rounded-full border border-[#12123f]/25 bg-white/40 px-8 py-4 text-[16px] font-medium text-[#12123f] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#12123f] hover:bg-[#12123f] hover:text-white active:scale-95"
                    >
                        <Image src="/icons/estimate-01.svg" alt="" width={22} height={22} className="invert-[.1]" />
                        Get Qoute
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
