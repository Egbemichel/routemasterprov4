"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Calculator, Route } from "lucide-react";
import TrackingDialog from "@/usercomponents/TrackingDialog";
import Model3D, { LazyMount, ModelKind } from "@/usercomponents/three/Model3D";
import { useReveal } from "@/usercomponents/home/useReveal";

/** Top-of-page banner shared by inner pages: big title, one line, and a floating 3D object. */
export function PageHero({
    eyebrow,
    title,
    highlight,
    text,
    model = "container",
}: {
    eyebrow: string;
    title: string;
    highlight: string;
    text?: string;
    model?: ModelKind;
}) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.from("[data-ph]", { yPercent: 110, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.1 });
            gsap.from("[data-ph-sub]", { y: 20, opacity: 0, duration: 0.8, delay: 0.5, ease: "power3.out" });
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} className="relative -mt-[88px] overflow-hidden bg-gradient-to-b from-[#eceef9] to-[#eef0fb] pt-[88px]">
            <div className="pointer-events-none absolute -left-20 top-10 h-[360px] w-[460px] rounded-full bg-[#ff5a0a]/10 blur-[110px]" />
            <div className="mx-auto grid min-h-[420px] max-w-[1400px] items-center gap-6 px-5 py-14 md:px-10 lg:grid-cols-[1.3fr_1fr]">
                <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#ff5a0a]">{eyebrow}</p>
                    <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#12123f]">
                        <span className="block overflow-hidden pb-[0.12em]">
                            <span data-ph className="block">
                                {title}
                            </span>
                        </span>
                        <span className="block overflow-hidden pb-[0.12em]">
                            <span data-ph className="block text-[#ff5a0a]">
                                {highlight}
                            </span>
                        </span>
                    </h1>
                    {text && (
                        <p data-ph-sub className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-[#12123f]/60">
                            {text}
                        </p>
                    )}
                </div>
                <div className="relative h-[260px] lg:h-[380px]">
                    <LazyMount className="absolute inset-0">
                        <Model3D kind={model} tilt={0.3} />
                    </LazyMount>
                </div>
            </div>
        </section>
    );
}

export type Step = { title: string; description: string; mediaType?: string; mediaSrc: string };

/** Alternating text / image rows with numbered badges and a hover zoom. */
export function FeatureRows({ steps }: { steps: Step[] }) {
    const ref = useRef<HTMLElement>(null);
    useReveal(ref, "[data-row]", { stagger: 0.18, duration: 1 });

    return (
        <section ref={ref} className="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-14 md:space-y-8 md:px-10 md:py-20">
            {steps.map((step, i) => (
                <article
                    key={step.title}
                    data-row
                    className={`group grid items-center gap-6 rounded-[36px] bg-white p-4 shadow-[0_26px_60px_-36px_rgba(18,18,63,0.45)] md:grid-cols-2 md:gap-10 md:p-5 ${
                        i % 2 ? "md:[&>div:first-child]:order-2" : ""
                    }`}
                >
                    <div className="px-3 py-2 md:px-8">
                        <span className="font-display text-[56px] font-medium leading-none tracking-tight text-[#ff5a0a]/25 transition-colors duration-500 group-hover:text-[#ff5a0a]">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-2 font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[#12123f]">
                            {step.title}
                        </h3>
                        <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#12123f]/60">{step.description}</p>
                        <span className="mt-5 block h-[3px] w-10 origin-left rounded-full bg-[#ff5a0a] transition-all duration-500 group-hover:w-24" />
                    </div>
                    <div className="relative aspect-[575/348] overflow-hidden rounded-[26px]">
                        <Image
                            src={step.mediaSrc}
                            alt={step.title}
                            fill
                            sizes="(min-width:768px) 560px, 100vw"
                            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                        />
                    </div>
                </article>
            ))}
        </section>
    );
}

/** Floating Track Now / Get a Quote pill kept from the old inner pages, restyled. */
export function FloatingActions() {
    return (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 p-2 shadow-[0_24px_50px_-18px_rgba(18,18,63,0.55)]">
            <TrackingDialog
                trigger={
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] whitespace-nowrap px-4 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.04] sm:px-6 sm:text-[15px] active:scale-95"
                    >
                        <Route size={18} />
                        Track Now
                    </button>
                }
            />
            <button
                type="button"
                className="flex items-center gap-2 rounded-full whitespace-nowrap bg-[#12123f] px-4 py-3 text-[14px] font-medium text-white transition-all hover:bg-[#ff5a0a] sm:px-6 sm:text-[15px] active:scale-95"
            >
                <Calculator size={18} />
                Get a Quote
            </button>
        </div>
    );
}
