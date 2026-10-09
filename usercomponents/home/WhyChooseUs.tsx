"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Globe2, PackageCheck, Radar, ShieldCheck } from "lucide-react";
import ShipyardWorld from "@/usercomponents/home/ShipyardWorld";
import { LazyMount } from "@/usercomponents/three/Model3D";
import SectionHeading, { Hl } from "@/usercomponents/home/SectionHeading";

const FEATURES = [
    {
        Icon: Radar,
        title: "24/7 real time tracking",
        text: "Across international borders, with automatic updates and premium customer support.",
        pos: "lg:left-[3%] lg:top-[6%]",
    },
    {
        Icon: ShieldCheck,
        title: "Reliable Delivery, Every Time.",
        text: "Your packages are safe with us, on time, every time, guaranteed.",
        pos: "lg:right-[3%] lg:top-[6%]",
    },
    {
        Icon: PackageCheck,
        title: "Superior Package handling.",
        text: "You care and so do we. A world class team to ensure all your packages remain intact.",
        pos: "lg:bottom-[5%] lg:left-[3%]",
    },
    {
        Icon: Globe2,
        title: "Nationwide and International Reach.",
        text: "From local deliveries to global shipping, we cover it all.",
        pos: "lg:bottom-[5%] lg:right-[3%]",
    },
];

export default function WhyChooseUs() {
    const root = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>("[data-why]", el);
            gsap.set(cards, { opacity: 0, y: 50, scale: 0.94 });
            const io = new IntersectionObserver(
                ([e]) => {
                    if (!e.isIntersecting) return;
                    io.disconnect();
                    gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15, ease: "back.out(1.5)", clearProps: "transform,opacity" });
                    cards.forEach((c, i) => {
                        const bob = c.querySelector<HTMLElement>("[data-bob]");
                        if (bob) gsap.to(bob, { y: i % 2 ? 7 : -7, duration: 2.6 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
                    });
                },
                { threshold: 0.2 },
            );
            io.observe(el);
            return () => io.disconnect();
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={root} className="relative w-full overflow-hidden pb-16 pt-16 md:pb-24 md:pt-24">
            <div className="relative z-10 mb-4 px-5">
                <SectionHeading eyebrow="Why us">
                    Why Choose <Hl>Us?</Hl>
                </SectionHeading>
            </div>

            <div className="relative lg:h-[760px]">
                {/* the 3D world sits behind the cards */}
                <div className="relative h-[420px] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] md:h-[560px] lg:absolute lg:inset-0 lg:h-auto">
                    <LazyMount className="absolute inset-0" rootMargin="200px">
                        <ShipyardWorld />
                    </LazyMount>
                </div>

                <div className="relative z-10 mx-auto mt-4 grid max-w-[1400px] gap-3 px-5 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0 lg:block lg:max-w-none lg:px-0">
                {FEATURES.map(({ Icon, title, text, pos }) => (
                    <div key={title} data-why className={`lg:absolute ${pos}`}>
                        <div
                            data-bob
                            className="flex w-full gap-4 rounded-[24px] bg-white p-5 shadow-[0_24px_50px_-26px_rgba(18,18,63,0.5)] lg:w-[330px]"
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#ff4d00] text-white">
                                <Icon size={22} />
                            </span>
                            <div>
                                <h3 className="text-[16px] font-medium leading-tight text-[#12123f]">{title}</h3>
                                <p className="mt-1.5 text-[13px] leading-snug text-[#12123f]/60">{text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
}
