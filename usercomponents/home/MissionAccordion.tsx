"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Model3D, { LazyMount } from "@/usercomponents/three/Model3D";
import SectionHeading from "@/usercomponents/home/SectionHeading";
import { useReveal } from "@/usercomponents/home/useReveal";

const PANELS = [
    {
        id: "intro",
        closed: "Who we are",
        label: "GlobexiaCorp",
        title: "Locally Rooted, Globally Inspired",
        text: "We are a UK-based logistics platform blending local knowledge with international shipping standards.",
        bg: "bg-gradient-to-br from-[#ff8a3d] via-[#ff6a14] to-[#ff4d00]",
        image: null as string | null,
    },
    {
        id: "mission",
        closed: "Our Mission",
        label: "Our Mission",
        title: "Simple is best",
        text: "To simplify logistics and empower businesses and individuals with fast, quality, and reliable shipping solutions, locally and globally. We are on a mission to make every delivery seamless, trackable, and stress-free.",
        bg: "bg-[#12123f]",
        image: "/images/image8.jpg",
    },
    {
        id: "values",
        closed: "Our Core Values",
        label: "Our Core Values",
        title: "What drives us?",
        text: "We are driven by reliability, customer focus, and transparency, delivering every package with speed, care, and integrity. Our tech-powered approach ensures quality, security, and sustainable logistics you can count on.",
        bg: "bg-[#12123f]",
        image: "/images/image9.jpg",
    },
];

export default function MissionAccordion({ withHeading = false }: { withHeading?: boolean }) {
    const [active, setActive] = useState(0);
    const ref = useRef<HTMLElement>(null);
    useReveal(ref, "[data-reveal]");

    return (
        <section ref={ref} className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
            {withHeading && (
                <SectionHeading eyebrow="About us" className="mb-10 md:mb-14">
                    Simple is <span className="text-[#ff5a0a]">best</span>
                </SectionHeading>
            )}
            <div data-reveal className="flex flex-col gap-3 lg:h-[560px] lg:flex-row">
                {PANELS.map((p, i) => {
                    const open = active === i;
                    return (
                        <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            aria-expanded={open}
                            aria-label={p.closed}
                            onClick={() => setActive(i)}
                            onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(i)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(i)}
                            style={{ flex: open ? "6 1 0%" : "0.55 1 0%" }}
                            className={`group relative cursor-pointer overflow-hidden rounded-[32px] outline-none transition-[flex,height] duration-[800ms] ease-[cubic-bezier(.7,0,.2,1)] focus-visible:ring-4 focus-visible:ring-[#ff5a0a]/40 ${p.bg} ${
                                open ? "max-lg:h-[520px]" : "max-lg:h-[92px]"
                            }`}
                        >
                            {p.image && (
                                <Image
                                    src={p.image}
                                    alt=""
                                    fill
                                    sizes="(min-width:1024px) 60vw, 100vw"
                                    className={`object-cover transition-all duration-[900ms] ${open ? "scale-100 opacity-70" : "scale-110 opacity-40 group-hover:opacity-55"}`}
                                />
                            )}
                            <div
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    p.image ? "bg-gradient-to-t from-[#12123f] via-[#12123f]/50 to-[#12123f]/10" : "bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_55%)]"
                                }`}
                            />

                            {/* closed label */}
                            <div
                                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                                    open ? "pointer-events-none opacity-0" : "opacity-100 delay-300"
                                }`}
                            >
                                <span className="font-display text-[22px] font-medium text-white max-lg:text-[20px] lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-[28px]">
                                    {p.closed}
                                </span>
                            </div>

                            {/* open content */}
                            <div
                                className={`absolute inset-0 flex flex-col justify-between p-6 text-white transition-all duration-700 md:p-9 ${
                                    open ? "translate-y-0 opacity-100 delay-[350ms]" : "pointer-events-none translate-y-6 opacity-0"
                                }`}
                            >
                                <div className="max-w-[520px] lg:w-[520px]">
                                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/80">{p.label}</p>
                                    <h3 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,3.2rem)] font-medium leading-[1] tracking-[-0.03em]">
                                        {p.title}
                                    </h3>
                                    <p className="mt-4 text-[15px] leading-relaxed text-white/85 md:text-[16px]">{p.text}</p>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActive((i + 1) % PANELS.length);
                                    }}
                                    className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#12123f] text-white transition-transform duration-300 hover:scale-110 hover:bg-white hover:text-[#12123f]"
                                >
                                    <ArrowRight size={22} />
                                </button>
                            </div>

                            {/* 3D object for the intro card */}
                            {p.id === "intro" && (
                                <div
                                    className={`pointer-events-none absolute bottom-0 right-0 h-[60%] w-[70%] transition-all duration-700 lg:h-[88%] lg:w-[52%] ${
                                        open ? "translate-x-0 opacity-100 delay-500" : "translate-x-10 opacity-0"
                                    }`}
                                >
                                    <LazyMount className="absolute inset-0">{open && <Model3D kind="container" tilt={0.25} />}</LazyMount>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
