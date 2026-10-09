"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Star } from "lucide-react";
import FloatingScene, { FloatItem } from "@/usercomponents/three/FloatingScene";
import { LazyMount } from "@/usercomponents/three/Model3D";
import { PageHero } from "@/usercomponents/home/PageParts";
import { useReveal } from "@/usercomponents/home/useReveal";
import NewsletterSignup from "@/usercomponents/NewsletterSignup";

const REVIEWS = [
    {
        name: "Amelia Hart",
        role: "Owner, Hart & Co. Candles",
        avatar: "/images/avatars/t1.png",
        text: "Our parcels used to vanish into a black hole. With GlobexiaCorp I watch every package move in real time, and my customers stopped emailing me asking where their order is.",
    },
    {
        name: "Daniel Okafor",
        role: "Operations Lead, Brightway Retail",
        avatar: "/images/avatars/t2.png",
        text: "We ship hundreds of orders a week and the bulk pricing plus pickup scheduling saved us hours every Monday. Deliveries are on time and nothing arrives crushed.",
    },
    {
        name: "Sofia Marin",
        role: "Founder, Casa Marin Ceramics",
        avatar: "/images/avatars/t3.png",
        text: "Fragile pottery across three countries and not a single broken piece. The handling team clearly cares as much about my work as I do.",
    },
    {
        name: "Liam Fraser",
        role: "Freelance Photographer",
        avatar: "/images/avatars/t4.png",
        text: "I booked a quote in minutes and tracked the camera gear to the client's door. Support answered at 2am when I had a question. That is rare.",
    },
    {
        name: "Priya Nair",
        role: "Supply Chain Manager, Novatec",
        avatar: "/images/avatars/t5.png",
        text: "Clear pricing, no hidden fees, and the live GPS updates make planning easy. It feels like a logistics partner, not just a courier.",
    },
    {
        name: "Marcus Bell",
        role: "Small Business Owner",
        avatar: "/images/avatars/t6.png",
        text: "International shipping always scared me. GlobexiaCorp made it simple, fast and stress-free. I will keep shipping with them.",
    },
];

const BACKDROP: FloatItem[] = [
    { kind: "quote", at: [-0.88, 0.75, -2], scale: 1.1 },
    { kind: "star", at: [0.9, 0.55, -3], scale: 0.9 },
    { kind: "parcels", at: [0.86, -0.2, -4], scale: 1.1, speed: 0.8 },
    { kind: "container", at: [-0.9, -0.35, -5], scale: 1.4, speed: 0.6 },
    { kind: "star", at: [-0.82, -0.85, -2], scale: 0.7 },
    { kind: "globe", at: [0.88, -0.9, -3], scale: 1.0 },
];

const Stars = ({ n = 5, size = 16 }: { n?: number; size?: number }) => (
    <span className="inline-flex gap-0.5 text-[#ffb12b]" aria-label={`${n} out of 5 stars`}>
        {Array.from({ length: n }).map((_, i) => (
            <Star key={i} data-star size={size} fill="currentColor" strokeWidth={0} />
        ))}
    </span>
);

function Featured() {
    const [i, setI] = useState(0);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setInterval(() => setI((p) => (p + 1) % REVIEWS.length), 6500);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-f]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" });
            gsap.fromTo("[data-star]", { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.5, stagger: 0.07, delay: 0.3, ease: "back.out(3)" });
        }, el);
        return () => ctx.revert();
    }, [i]);

    const r = REVIEWS[i];
    return (
        <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[40px] bg-[#12123f] p-8 text-white md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#ff5a0a]/40 blur-[90px]" />
            <div ref={box} className="relative min-h-[260px]">
                <div data-f>
                    <Stars />
                </div>
                <p data-f className="mt-5 font-display text-[clamp(1.4rem,2.8vw,2.1rem)] font-medium leading-[1.2] tracking-[-0.02em]">
                    &ldquo;{r.text}&rdquo;
                </p>
                <div data-f className="mt-8 flex items-center gap-4">
                    <Image src={r.avatar} alt={r.name} width={56} height={56} className="h-14 w-14 rounded-full bg-white/10 object-cover" />
                    <div>
                        <p className="text-[16px] font-medium">{r.name}</p>
                        <p className="text-[13px] text-white/60">{r.role}</p>
                    </div>
                </div>
            </div>
            <div className="relative mt-6 flex gap-2">
                {REVIEWS.map((_, k) => (
                    <button
                        key={k}
                        type="button"
                        aria-label={`Show review ${k + 1}`}
                        onClick={() => setI(k)}
                        className={`h-2 rounded-full transition-all duration-500 ${k === i ? "w-10 bg-[#ff5a0a]" : "w-2 bg-white/30 hover:bg-white/60"}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function TestimonialsPage() {
    const grid = useRef<HTMLElement>(null);
    useReveal(grid, "[data-card]", { stagger: 0.1 });

    return (
        <>
            <PageHero
                eyebrow="Testimonials"
                title="Loved by"
                highlight="shippers"
                text="Real stories from the people and businesses who trust us with what matters most."
                model="star"
            />

            <section className="relative overflow-hidden py-14 md:py-20">
                <LazyMount className="absolute inset-0" rootMargin="400px">
                    <FloatingScene items={BACKDROP} className="opacity-40 md:opacity-90" />
                </LazyMount>

                <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
                    <Featured />

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[#12123f]">
                        <span className="flex items-center gap-2 text-[15px] font-medium">
                            <Stars /> 4.9 average rating
                        </span>
                        <span className="text-[15px] font-medium">98% on-time delivery</span>
                        <span className="text-[15px] font-medium">1M+ packages delivered</span>
                    </div>

                    <section ref={grid} className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5">
                        {REVIEWS.map((r, i) => (
                            <article
                                key={r.name}
                                data-card
                                className="group break-inside-avoid rounded-[30px] bg-white p-7 shadow-[0_24px_50px_-32px_rgba(18,18,63,0.5)] transition-all duration-500 hover:-translate-y-2 hover:rotate-[-0.6deg] hover:shadow-[0_34px_60px_-28px_rgba(255,90,10,0.45)]"
                            >
                                <Stars size={15} />
                                <p className={`mt-4 leading-relaxed text-[#12123f]/80 ${i % 3 === 0 ? "text-[17px]" : "text-[15px]"}`}>{r.text}</p>
                                <div className="mt-6 flex items-center gap-3">
                                    <Image src={r.avatar} alt={r.name} width={44} height={44} className="h-11 w-11 rounded-full bg-[#eef0fb] object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="leading-tight">
                                        <p className="text-[14px] font-medium text-[#12123f]">{r.name}</p>
                                        <p className="text-[12px] text-[#12123f]/50">{r.role}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </section>

            <NewsletterSignup />
        </>
    );
}
