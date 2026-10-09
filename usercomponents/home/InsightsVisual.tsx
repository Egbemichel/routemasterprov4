"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Headphones, MapPin, Handshake } from "lucide-react";
import SectionHeading, { Hl } from "@/usercomponents/home/SectionHeading";

const C = 2 * Math.PI * 54;

/** "What the numbers say" told with motion instead of a paragraph. */
export default function InsightsVisual() {
    const root = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            const pct = el.querySelector<HTMLElement>("[data-pct]")!;
            const ring = el.querySelector<SVGCircleElement>("[data-ring]")!;
            const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", el);
            const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
            const chips = gsap.utils.toArray<HTMLElement>("[data-chip]", el);
            const parcels = gsap.utils.toArray<HTMLElement>("[data-parcel]", el);

            if (reduce) return;

            gsap.set(ring, { strokeDashoffset: C });
            gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
            gsap.set([...cards, ...chips], { opacity: 0, y: 40 });
            pct.textContent = "0";

            // endless parcel conveyor
            parcels.forEach((p, i) => {
                gsap.fromTo(p, { xPercent: -140 }, { xPercent: 900, duration: 4.4, ease: "none", repeat: -1, delay: -i * 1.5 });
            });
            gsap.to("[data-pulse]", { scale: 2.4, opacity: 0, duration: 1.6, ease: "power1.out", repeat: -1 });
            gsap.to("[data-clock]", { rotate: 360, duration: 8, ease: "none", repeat: -1, transformOrigin: "50% 50%" });

            const counter = { v: 0 };
            const play = () => {
                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
                tl.to(cards, { opacity: 1, y: 0, duration: 0.9, stagger: 0.14 })
                    .to(ring, { strokeDashoffset: C * 0.02, duration: 2.2, ease: "power2.inOut" }, 0.2)
                    .to(counter, { v: 98, duration: 2.2, ease: "power2.inOut", onUpdate: () => (pct.textContent = String(Math.round(counter.v))) }, 0.2)
                    .to(bars, { scaleY: 1, duration: 0.7, stagger: 0.12, ease: "back.out(2)" }, 0.5)
                    .to(chips, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, 1.2);
            };
            const io = new IntersectionObserver(
                ([e]) => {
                    if (e.isIntersecting) {
                        io.disconnect();
                        play();
                    }
                },
                { threshold: 0.25 },
            );
            io.observe(el);
            return () => io.disconnect();
        }, el);
        return () => ctx.revert();
    }, []);

    const card = "relative overflow-hidden rounded-[30px] bg-white p-7 shadow-[0_24px_50px_-30px_rgba(18,18,63,0.45)]";
    const chip =
        "flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[15px] font-medium text-[#12123f] shadow-[0_14px_30px_-20px_rgba(18,18,63,0.5)]";

    return (
        <section ref={root} className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
            <SectionHeading eyebrow="Shipping insights">
                What the <Hl>numbers</Hl> say!
            </SectionHeading>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
                {/* success ring */}
                <div data-card className={`${card} flex flex-col items-center justify-center text-center`}>
                    <div className="relative h-[190px] w-[190px]">
                        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#eef0fb" strokeWidth="9" />
                            <circle
                                data-ring
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="#ff5a0a"
                                strokeWidth="9"
                                strokeLinecap="round"
                                strokeDasharray={C}
                                strokeDashoffset={C * 0.02}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-display text-[56px] font-medium tracking-tight text-[#12123f]">
                            <span data-pct>98</span>
                            <span className="text-[28px] text-[#ff5a0a]">%</span>
                        </div>
                    </div>
                    <p className="mt-3 text-[16px] font-medium text-[#12123f]">Success rate</p>
                </div>

                {/* packages */}
                <div data-card className={`${card} flex flex-col justify-between bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00]`}>
                    <p className="font-display text-[clamp(4rem,8vw,6.5rem)] font-medium leading-none tracking-[-0.05em] text-white">
                        1M<span className="text-[#12123f]">+</span>
                    </p>
                    <div>
                        <div className="relative my-6 h-12 overflow-hidden">
                            <div className="absolute inset-x-0 bottom-2 border-t-2 border-dashed border-white/50" />
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    data-parcel
                                    className="absolute bottom-[10px] left-0 block h-9 w-9 rounded-md bg-[#f3d6a8] shadow-md before:absolute before:inset-y-0 before:left-1/2 before:w-2 before:-translate-x-1/2 before:bg-[#12123f]"
                                />
                            ))}
                        </div>
                        <p className="text-[16px] font-medium text-white">Packages delivered</p>
                    </div>
                </div>

                {/* years */}
                <div data-card className={`${card} flex flex-col justify-between`}>
                    <p className="font-display text-[clamp(4rem,8vw,6.5rem)] font-medium leading-none tracking-[-0.05em] text-[#12123f]">
                        10<span className="text-[#ff5a0a]">+</span>
                    </p>
                    <div>
                        <div className="my-6 flex h-14 items-end gap-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <span
                                    key={i}
                                    data-bar
                                    className="flex-1 rounded-t-md"
                                    style={{ height: `${28 + i * 8}%`, opacity: i === 9 ? 1 : 0.25 + i * 0.075, backgroundColor: i === 9 ? "#ff5a0a" : "#12123f" }}
                                />
                            ))}
                        </div>
                        <p className="text-[16px] font-medium text-[#12123f]">Years delivering</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div data-chip className={chip}>
                    <span className="relative flex h-6 w-6 items-center justify-center">
                        <span data-pulse className="absolute inset-0 rounded-full bg-[#ff5a0a]/60" />
                        <MapPin size={16} className="relative text-[#ff5a0a]" />
                    </span>
                    Real-time tracking
                </div>
                <div data-chip className={chip}>
                    <span data-clock className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-[#ff5a0a]">
                        <Headphones size={12} className="text-[#12123f]" />
                    </span>
                    24/7 support
                </div>
                <div data-chip className={chip}>
                    <Handshake size={20} className="text-[#ff5a0a]" />
                    Top local carriers
                </div>
            </div>
        </section>
    );
}
