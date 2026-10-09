"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Package, Repeat2, Building2 } from "lucide-react";
import { WORLD, WORLD_ROWS } from "@/usercomponents/home/worldDots";

const CELL = 10;
const COLS = WORLD_ROWS[0].length;
const ROWS = WORLD_ROWS.length;

const CITIES = [
    { name: "United Kingdom", city: "London", lon: -0.12, lat: 51.5 },
    { name: "United States", city: "New York", lon: -74, lat: 40.7 },
    { name: "United States", city: "Los Angeles", lon: -118.2, lat: 34.05 },
    { name: "Brazil", city: "Rio De Janeiro", lon: -43.2, lat: -22.9 },
    { name: "Nigeria", city: "Lagos", lon: 3.4, lat: 6.5 },
    { name: "South Africa", city: "Johannesburg", lon: 28, lat: -26.2 },
    { name: "UAE", city: "Dubai", lon: 55.3, lat: 25.2 },
    { name: "India", city: "Mumbai", lon: 72.9, lat: 19.1 },
    { name: "Singapore", city: "Singapore", lon: 103.8, lat: 1.35 },
    { name: "Japan", city: "Tokyo", lon: 139.7, lat: 35.7 },
    { name: "Australia", city: "Sydney", lon: 151.2, lat: -33.9 },
];

const project = (lon: number, lat: number) => ({
    x: ((lon - WORLD.lon0) / (WORLD.lon1 - WORLD.lon0)) * 100,
    y: ((WORLD.lat1 - lat) / (WORLD.lat1 - WORLD.lat0)) * 100,
});

const STATS = [
    { Icon: Package, value: 1, suffix: "million +", label: "Packages delivered." },
    { Icon: Repeat2, value: 85, suffix: "%", label: "Of customers ship with us again." },
    { Icon: Building2, value: 50, suffix: "+", label: "Cities that we deliver to." },
];

/** Decorative dotted world map (not interactive) with a pin tour, plus count-up stats. */
export default function StatsMap() {
    const root = useRef<HTMLElement>(null);
    const tip = useRef<HTMLDivElement>(null);
    const [idx, setIdx] = useState(3);

    const dots = useMemo(() => {
        const out: React.ReactNode[] = [];
        WORLD_ROWS.forEach((row, r) => {
            for (let c = 0; c < row.length; c++)
                if (row[c] === "1") out.push(<circle key={`${r}-${c}`} cx={c * CELL + CELL / 2} cy={r * CELL + CELL / 2} r={2.7} />);
        });
        return out;
    }, []);

    // cycle the tooltip through the pins
    useEffect(() => {
        const t = setInterval(() => setIdx((i) => (i + 1) % CITIES.length), 3200);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const el = tip.current;
        if (!el) return;
        const p = project(CITIES[idx].lon, CITIES[idx].lat);
        gsap.to(el, { left: `${p.x}%`, top: `${p.y}%`, duration: 0.9, ease: "power3.inOut" });
        gsap.fromTo(el.firstElementChild, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5 });
    }, [idx]);

    // count-up + reveal
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            const nums = gsap.utils.toArray<HTMLElement>("[data-num]", el);
            const items = gsap.utils.toArray<HTMLElement>("[data-stat]", el);
            const pins = gsap.utils.toArray<HTMLElement>("[data-pin]", el);
            gsap.to("[data-ping]", { scale: 2.6, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out", stagger: 0.25 });
            if (reduce) return;
            gsap.set(items, { opacity: 0, y: 30 });
            gsap.set(pins, { scale: 0 });
            gsap.set("[data-map]", { opacity: 0 });
            const io = new IntersectionObserver(
                ([e]) => {
                    if (!e.isIntersecting) return;
                    io.disconnect();
                    gsap.to("[data-map]", { opacity: 1, duration: 1.2 });
                    gsap.to(pins, { scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(3)", delay: 0.4 });
                    gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, delay: 0.5, ease: "power3.out" });
                    nums.forEach((n, i) => {
                        const o = { v: 0 };
                        gsap.to(o, { v: STATS[i].value, duration: 2.2, delay: 0.6, ease: "power2.out", onUpdate: () => (n.textContent = String(Math.round(o.v))) });
                    });
                },
                { threshold: 0.2 },
            );
            io.observe(el);
            return () => io.disconnect();
        }, el);
        return () => ctx.revert();
    }, []);

    const cur = CITIES[idx];

    return (
        <section ref={root} className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-10 md:py-24" aria-label="Where we deliver">
            <div data-map className="pointer-events-none relative w-full select-none" style={{ aspectRatio: `${COLS}/${ROWS}` }}>
                <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="absolute inset-0 h-full w-full fill-[#cdd0dc]" aria-hidden="true">
                    {dots}
                </svg>
                {CITIES.map((c, i) => {
                    const p = project(c.lon, c.lat);
                    return (
                        <span key={c.city} data-pin className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                            <span data-ping className="absolute inset-0 rounded-full bg-[#ff5a0a]/50" />
                            <span className={`relative block rounded-full bg-[#ff5a0a] ring-4 ring-white/70 ${i === idx ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} transition-all duration-500`} />
                        </span>
                    );
                })}
                <div ref={tip} className="absolute z-10" style={{ left: `${project(cur.lon, cur.lat).x}%`, top: `${project(cur.lon, cur.lat).y}%` }}>
                    <div className="absolute bottom-5 left-1/2 w-max -translate-x-1/2 rounded-2xl bg-white px-4 py-2.5 shadow-[0_20px_40px_-18px_rgba(18,18,63,0.5)]">
                        <p className="text-[13px] font-bold uppercase tracking-wide text-[#ff5a0a]">{cur.name}</p>
                        <p className="text-[13px] text-[#12123f]">{cur.city}</p>
                        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
                    </div>
                </div>
            </div>

            <div className="mt-10 grid gap-10 text-center sm:grid-cols-3">
                {STATS.map(({ Icon, value, suffix, label }) => (
                    <div key={label} data-stat className="flex flex-col items-center">
                        <Icon size={30} strokeWidth={1.6} className="text-[#ff5a0a]" />
                        <p className="mt-3 font-display text-[clamp(3rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.04em] text-[#1b1d2e]">
                            <span data-num>{value}</span>
                            <span className="ml-1 text-[0.55em] tracking-normal">{suffix}</span>
                        </p>
                        <span className="my-3 block h-[2px] w-9 bg-[#ff5a0a]" />
                        <p className="max-w-[200px] text-[13px] font-medium uppercase tracking-wide text-[#1b1d2e]/80">{label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
