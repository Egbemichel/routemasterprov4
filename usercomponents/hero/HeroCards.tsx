"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Car, Phone, Truck, Bus, User } from "lucide-react";

const card = "rounded-[22px] bg-white shadow-[0_24px_50px_-24px_rgba(18,18,63,0.35)]";

/** Counts a number up from 0 once mounted. */
function useCountUp(to: number, decimals = 0, delay = 1.6) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const o = { v: 0 };
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const tween = gsap.to(o, {
            v: to,
            duration: reduce ? 0 : 2,
            delay: reduce ? 0 : delay,
            ease: "power2.out",
            onUpdate: () => (el.textContent = o.v.toFixed(decimals)),
            onComplete: () => (el.textContent = to.toFixed(decimals)),
        });
        if (reduce) el.textContent = to.toFixed(decimals);
        return () => {
            tween.kill();
        };
    }, [to, decimals, delay]);
    return ref;
}

function VanIllustration() {
    return (
        <svg viewBox="0 0 220 90" className="h-full w-full" aria-hidden="true">
            <ellipse cx="110" cy="82" rx="92" ry="5" fill="#12123f" opacity=".12" />
            <rect x="12" y="14" width="124" height="56" rx="6" fill="#f6f6fb" stroke="#d9dbec" />
            <rect x="20" y="22" width="108" height="40" rx="3" fill="#ff6a14" />
            {[0, 1, 2].map((i) => (
                <rect key={i} x={26 + i * 34} y="28" width="28" height="12" rx="2" fill="#ffb27a" />
            ))}
            {[0, 1, 2].map((i) => (
                <rect key={i} x={26 + i * 34} y="44" width="28" height="12" rx="2" fill="#ffb27a" />
            ))}
            <path d="M136 26h36l22 20v24h-58V26Z" fill="#f6f6fb" stroke="#d9dbec" />
            <path d="M142 32h26l14 14h-40V32Z" fill="#cfd4ef" />
            <circle cx="52" cy="72" r="10" fill="#12123f" />
            <circle cx="52" cy="72" r="4" fill="#ff6a14" />
            <circle cx="166" cy="72" r="10" fill="#12123f" />
            <circle cx="166" cy="72" r="4" fill="#ff6a14" />
        </svg>
    );
}

export function TruckCard({ className = "" }: { className?: string }) {
    const tabs = [
        { id: "Truck", Icon: Truck },
        { id: "Van", Icon: Bus },
        { id: "Car", Icon: Car },
    ];
    const [active, setActive] = useState("Truck");
    return (
        <div className={`${card} w-[270px] p-4 ${className}`}>
            <div className="flex items-center gap-4 border-b border-[#12123f]/10 text-[12px] text-[#12123f]/55">
                {tabs.map(({ id, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActive(id)}
                        className={`-mb-px flex items-center gap-1 border-b-2 pb-2 transition-colors ${
                            active === id ? "border-[#ff5a0a] text-[#12123f]" : "border-transparent hover:text-[#12123f]"
                        }`}
                    >
                        <Icon size={13} />
                        {id}
                    </button>
                ))}
            </div>
            <div className="mt-3 h-[92px]">
                <VanIllustration />
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-[#12123f]">
                <span className="font-medium">LOG7614390</span>
                <span className="text-[#12123f]/60">
                    1,185 mi <b className="ml-2 font-semibold text-[#12123f]">8,500</b> / 15,000 lb
                </span>
            </div>
        </div>
    );
}

export function DeliveryCard({ className = "" }: { className?: string }) {
    const progress = useCountUp(68);
    const tiles = [
        { value: "28 kg", label: "Weight" },
        { value: "24,6 km", label: "Distance" },
    ];
    return (
        <div className={`${card} w-[300px] p-4 ${className}`}>
            <p className="text-[15px] font-medium text-[#12123f]">Active Delivery</p>
            <p className="text-[12px] text-[#12123f]/50">Arriving soon</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-xl bg-[#eef0fb] py-2.5 text-center">
                        <p className="text-[13px] font-medium text-[#12123f]">{t.value}</p>
                        <p className="text-[10px] text-[#12123f]/50">{t.label}</p>
                    </div>
                ))}
                <div className="rounded-xl bg-[#eef0fb] py-2.5 text-center">
                    <p className="text-[13px] font-medium text-[#12123f]">
                        <span ref={progress}>0</span>%
                    </p>
                    <p className="text-[10px] text-[#12123f]/50">Progress</p>
                </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef0fb]">
                <div data-progress className="h-full w-[68%] origin-left rounded-full bg-[#ff5a0a]" />
            </div>
            <p className="mt-3 text-[12px] font-medium text-[#12123f]">Receiver</p>
            <div className="mt-2 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb27a] to-[#ff5a0a] text-[14px] font-semibold text-white">
                    EC
                </span>
                <div className="flex-1 leading-tight">
                    <p className="text-[14px] font-medium text-[#12123f]">Emily Carter</p>
                    <p className="text-[12px] text-[#12123f]/50">+1 415 782 6384</p>
                </div>
                <button
                    type="button"
                    aria-label="Call receiver"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12123f] text-white transition-transform hover:scale-110"
                >
                    <Phone size={16} />
                </button>
            </div>
        </div>
    );
}

function TopDownTruck() {
    return (
        <svg viewBox="0 0 140 190" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="140" height="190" fill="#cfd1d8" />
            <rect x="12" y="0" width="3" height="190" fill="#fff" opacity=".75" />
            <rect x="125" y="0" width="3" height="190" fill="#fff" opacity=".75" />
            {[10, 60, 110, 160].map((y) => (
                <rect key={y} x="69" y={y} width="3" height="26" fill="#fff" opacity=".7" />
            ))}
            <rect x="42" y="14" width="64" height="104" rx="4" fill="#12123f" opacity=".18" transform="translate(8 6)" />
            <rect x="38" y="8" width="62" height="110" rx="4" fill="#ff6a14" />
            <rect x="38" y="8" width="62" height="110" rx="4" fill="url(#g)" />
            <rect x="42" y="124" width="54" height="52" rx="8" fill="#f4f5f8" />
            <rect x="47" y="132" width="44" height="14" rx="3" fill="#2a2f4a" />
            <defs>
                <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity=".18" />
                    <stop offset="1" stopColor="#000" stopOpacity=".12" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function ToolsCard({ className = "" }: { className?: string }) {
    return (
        <div className={`${card} flex w-full max-w-[444px] gap-4 p-3.5 ${className}`}>
            <div className="h-[170px] w-[130px] shrink-0 overflow-hidden rounded-[18px] sm:h-[190px] sm:w-[140px]">
                <TopDownTruck />
            </div>
            <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                <div>
                    <h3 className="text-[19px] font-medium leading-tight text-[#12123f]">
                        Our Precision Tools
                        <br />
                        for Modern Fleets
                    </h3>
                    <p className="mt-2 text-[13px] leading-snug text-[#12123f]/60">
                        Take control of your fleet with a powerful suite of tools designed to optimize routes and
                        ensure safety.
                    </p>
                </div>
                <Link
                    href="/services"
                    className="mt-3 inline-flex w-fit items-center rounded-full bg-[#12123f] px-6 py-3 text-[14px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#ff5a0a]"
                >
                    Learn More
                </Link>
            </div>
        </div>
    );
}

export function UsersBadge({ className = "" }: { className?: string }) {
    const count = useCountUp(25, 0, 1.2);
    return (
        <div className={className}>
            <div className="flex -space-x-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#eceef9] bg-gradient-to-br from-[#ffd6b8] to-[#e8a070] text-[#12123f]">
                    <User size={18} />
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#eceef9] bg-gradient-to-br from-[#c9ceee] to-[#8e96cf] text-white">
                    <User size={18} />
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#eceef9] bg-[#ff5a0a] text-white">
                    <User size={18} />
                </span>
            </div>
            <p className="mt-2 text-[28px] font-medium leading-none tracking-tight text-[#12123f]">
                +<span ref={count}>0</span>k
            </p>
            <p className="mt-1 text-[14px] text-[#12123f]/60">Satisfied Users</p>
        </div>
    );
}
