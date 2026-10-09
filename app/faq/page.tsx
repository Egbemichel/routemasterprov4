"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Clock3, CreditCard, Headphones, Plus, Search, Truck, MapPinned } from "lucide-react";
import FloatingScene, { FloatItem } from "@/usercomponents/three/FloatingScene";
import Model3D, { LazyMount } from "@/usercomponents/three/Model3D";
import { PageHero, FloatingActions } from "@/usercomponents/home/PageParts";
import { useReveal } from "@/usercomponents/home/useReveal";

const CATEGORIES = [
    { id: "all", label: "All", Icon: Search },
    { id: "shipping", label: "Shipping", Icon: Truck },
    { id: "tracking", label: "Tracking", Icon: MapPinned },
    { id: "pricing", label: "Pricing", Icon: CreditCard },
    { id: "support", label: "Support", Icon: Headphones },
] as const;

const FAQS = [
    { cat: "shipping", q: "Where do you deliver?", a: "We deliver across 50+ cities worldwide, from local and regional drop-offs to national and international shipping, for individuals and businesses alike." },
    { cat: "shipping", q: "How long does a delivery take?", a: "Local deliveries are typically same or next day. National and international timelines depend on the route, and you will see an estimated delivery window when you book." },
    { cat: "shipping", q: "Can you handle bulk or business shipments?", a: "Yes. We support SMEs, e-commerce vendors and corporate clients with high-volume deliveries, scheduled pickups and tailored logistics plans." },
    { cat: "tracking", q: "How do I track my package?", a: "Press Track Now, enter your tracking number and you will see live updates from pickup to delivery, including GPS location on the map." },
    { cat: "tracking", q: "Where do I find my tracking number?", a: "It is sent to you as soon as your parcel is booked and is also printed on your shipping label." },
    { cat: "pricing", q: "How much does shipping cost?", a: "Pricing depends on weight, size and destination. Use Get a Quote for a clear price up front, with no hidden fees, ever." },
    { cat: "pricing", q: "Is my package insured?", a: "Every shipment is handled with care by our trained team. Ask us about added cover for high-value or fragile items when you request your quote." },
    { cat: "support", q: "Can I speak to a real person?", a: "Absolutely. Our support team is just a call away and ready to help, anytime." },
    { cat: "support", q: "What if my package is delayed or damaged?", a: "Contact support with your tracking number and we will investigate straight away and make it right." },
];

const BACKDROP: FloatItem[] = [
    { kind: "question", at: [-0.86, 0.6, -2], scale: 1.3 },
    { kind: "question", at: [0.9, 0.2, -4], scale: 1.0, speed: 0.7 },
    { kind: "parcels", at: [0.84, 0.85, -3], scale: 0.9 },
    { kind: "pallet", at: [-0.88, -0.25, -3], scale: 1.0, speed: 0.8 },
    { kind: "question", at: [-0.8, -0.85, -5], scale: 0.9 },
    { kind: "globe", at: [0.88, -0.75, -3], scale: 1.0 },
    { kind: "container", at: [0.7, -0.15, -7], scale: 1.4, speed: 0.5 },
];

export default function FaqPage() {
    const [cat, setCat] = useState<(typeof CATEGORIES)[number]["id"]>("all");
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState<string | null>(FAQS[0].q);
    const list = useRef<HTMLDivElement>(null);
    const help = useRef<HTMLElement>(null);
    useReveal(help, "[data-help]");

    const shown = useMemo(
        () =>
            FAQS.filter((f) => (cat === "all" || f.cat === cat) && (query.trim() === "" || (f.q + f.a).toLowerCase().includes(query.trim().toLowerCase()))),
        [cat, query],
    );

    // animate the open / closed state of every panel, and fade items in when the list changes
    useEffect(() => {
        const el = list.current;
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>("[data-panel]", el).forEach((p) => {
                const isOpen = p.dataset.panel === open;
                gsap.to(p, { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0, duration: reduce ? 0 : 0.5, ease: "power3.inOut" });
            });
            gsap.utils.toArray<HTMLElement>("[data-plus]", el).forEach((p) => {
                gsap.to(p, { rotate: p.dataset.plus === open ? 135 : 0, duration: reduce ? 0 : 0.5, ease: "back.out(2)" });
            });
        }, el);
        return () => ctx.revert();
    }, [open, shown]);

    useEffect(() => {
        const el = list.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.from("[data-item]", { y: 26, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" });
        }, el);
        return () => ctx.revert();
    }, [cat, query]);

    return (
        <>
            <PageHero eyebrow="FAQ" title="Questions," highlight="answered" text="Quick answers about shipping, tracking, pricing and support." model="question" />

            <section className="relative overflow-hidden py-12 md:py-16">
                <LazyMount className="absolute inset-0" rootMargin="400px">
                    <FloatingScene items={BACKDROP} />
                </LazyMount>

                <div className="relative mx-auto max-w-[860px] px-5 md:px-10">
                    {/* search + categories */}
                    <div className="rounded-[28px] bg-white p-3 shadow-[0_24px_50px_-32px_rgba(18,18,63,0.5)]">
                        <label className="flex items-center gap-3 rounded-full bg-[#eef0fb] px-5">
                            <Search size={18} className="text-[#12123f]/50" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search questions..."
                                className="h-12 w-full bg-transparent text-[15px] text-[#12123f] placeholder:text-[#12123f]/40 focus:outline-none"
                            />
                        </label>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {CATEGORIES.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setCat(id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300 ${
                                        cat === id ? "bg-[#12123f] text-white shadow-lg" : "bg-[#eef0fb] text-[#12123f] hover:bg-[#ffe3d3] hover:text-[#ff5a0a]"
                                    }`}
                                >
                                    <Icon size={15} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* accordion */}
                    <div ref={list} className="mt-6 space-y-3">
                        {shown.length === 0 && (
                            <p className="rounded-[24px] bg-white p-8 text-center text-[#12123f]/60">No questions match your search yet.</p>
                        )}
                        {shown.map((f, i) => {
                            const isOpen = open === f.q;
                            return (
                                <div
                                    key={f.q}
                                    data-item
                                    className={`overflow-hidden rounded-[26px] bg-white shadow-[0_20px_44px_-32px_rgba(18,18,63,0.5)] transition-shadow duration-500 ${
                                        isOpen ? "shadow-[0_28px_54px_-26px_rgba(255,90,10,0.45)] ring-2 ring-[#ff5a0a]/25" : ""
                                    }`}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? null : f.q)}
                                        className="flex w-full items-center gap-4 px-6 py-5 text-left"
                                    >
                                        <span className="font-display text-[15px] font-medium text-[#ff5a0a]/60">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="flex-1 text-[17px] font-medium text-[#12123f]">{f.q}</span>
                                        <span
                                            data-plus={f.q}
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? "bg-[#ff5a0a] text-white" : "bg-[#eef0fb] text-[#12123f]"}`}
                                        >
                                            <Plus size={18} />
                                        </span>
                                    </button>
                                    <div data-panel={f.q} style={{ height: f.q === FAQS[0].q ? "auto" : 0, opacity: f.q === FAQS[0].q ? 1 : 0 }} className="overflow-hidden">
                                        <p className="px-6 pb-6 pl-[3.9rem] text-[15px] leading-relaxed text-[#12123f]/65">{f.a}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section ref={help} className="mx-auto w-full max-w-[1100px] px-5 pb-24 md:px-10">
                <div data-help className="relative grid items-center overflow-hidden rounded-[40px] bg-gradient-to-br from-[#12123f] to-[#2a2f8f] p-8 text-white md:grid-cols-[1.3fr_1fr] md:p-12">
                    <div>
                        <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">Still have questions?</h2>
                        <p className="mt-3 max-w-[380px] text-[15px] text-white/85">Our support team is just a call away, ready to help anytime.</p>
                        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[14px] font-medium">
                            <Clock3 size={16} /> Available 24/7
                        </p>
                    </div>
                    <div className="relative mx-auto h-[220px] w-full max-w-[280px]">
                        <LazyMount className="absolute inset-0">
                            <Model3D kind="question" tilt={0.15} />
                        </LazyMount>
                    </div>
                </div>
            </section>
            <FloatingActions />
        </>
    );
}
