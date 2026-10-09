'use client';

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReveal } from "@/usercomponents/home/useReveal";
import { Send, CheckCircle2 } from "lucide-react";
import Model3D, { LazyMount } from "@/usercomponents/three/Model3D";

export default function NewsletterSignup() {
    const root = useRef<HTMLElement>(null);
    const plane = useRef<HTMLSpanElement>(null);
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    useReveal(root, "[data-news]");

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const ctx = gsap.context(() => {
            gsap.to("[data-orb]", { y: -18, x: 10, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.6 });
            // a paper plane that loops across the card
            gsap.fromTo(
                "[data-flyby]",
                { x: "-20%", y: 40, rotate: 8, opacity: 0 },
                { x: "120%", y: -30, rotate: -6, opacity: 1, duration: 7, ease: "none", repeat: -1, repeatDelay: 2 },
            );
        }, el);
        return () => ctx.revert();
    }, []);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        const p = plane.current;
        if (p) gsap.to(p, { x: 120, y: -90, rotate: 25, opacity: 0, duration: 0.9, ease: "power2.in" });
        setTimeout(() => setSent(true), 700);
    };

    return (
        <section ref={root} className="mx-auto my-16 w-full max-w-[1300px] px-5 md:my-24 md:px-10">
            <div className="relative isolate overflow-hidden rounded-[40px] bg-[#12123f] px-6 py-14 text-white md:px-14 md:py-20">
                {/* glow + floating orbs */}
                <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-[420px] w-[420px] rounded-full bg-[#ff5a0a]/35 blur-[110px]" />
                <div className="pointer-events-none absolute -bottom-32 right-10 -z-10 h-[380px] w-[380px] rounded-full bg-[#4b52ff]/30 blur-[120px]" />
                {[
                    "left-[8%] top-[18%] h-3 w-3",
                    "left-[44%] top-[10%] h-2 w-2",
                    "left-[30%] bottom-[16%] h-4 w-4",
                    "right-[34%] bottom-[22%] h-2.5 w-2.5",
                ].map((c) => (
                    <span key={c} data-orb className={`absolute rounded-full bg-[#ff7a1a] ${c}`} />
                ))}
                <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 overflow-hidden">
                    <svg data-flyby viewBox="0 0 64 64" className="h-14 w-14 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                        <path d="M58 6 6 28l18 8 8 18Z" />
                        <path d="m24 36 34-30" />
                    </svg>
                </div>

                <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                    <div>
                        <p data-news className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#ff8a3d]">
                            Newsletter
                        </p>
                        <h2 data-news className="mt-3 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">
                            Sign up to our <span className="text-[#ff7a1a]">newsletter</span>
                        </h2>
                        <p data-news className="mt-4 max-w-[420px] text-[15px] text-white/65">
                            Fresh shipping news, delivered. No spam, we promise.
                        </p>

                        <div data-news className="mt-8 min-h-[72px] max-w-[560px]">
                            {sent ? (
                                <div className="flex items-center gap-3 rounded-full bg-white/10 px-6 py-5 text-[17px] font-medium">
                                    <CheckCircle2 className="text-[#ff7a1a]" />
                                    You&apos;re on the list. Watch your inbox!
                                </div>
                            ) : (
                                <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-white sm:p-2 sm:pl-6">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email..."
                                        className="h-14 w-full rounded-full bg-white px-6 text-[16px] text-[#12123f] placeholder:text-[#12123f]/45 focus:outline-none sm:h-auto sm:flex-1 sm:rounded-none sm:bg-transparent sm:px-0"
                                    />
                                    <button
                                        type="submit"
                                        className="group flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-8 text-[16px] font-medium text-white shadow-[0_12px_26px_-10px_rgba(255,90,10,0.9)] transition-transform hover:scale-[1.03] active:scale-95"
                                    >
                                        Submit
                                        <span ref={plane} className="inline-flex">
                                            <Send size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        </span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="relative mx-auto h-[260px] w-full max-w-[420px] md:h-[340px]">
                        <LazyMount className="absolute inset-0">
                            <Model3D kind="parcels" tilt={0.25} />
                        </LazyMount>
                    </div>
                </div>
            </div>
        </section>
    );
}
