"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { Car, Phone, Truck, Bus } from "lucide-react";

const TruckRoadScene = dynamic(() => import("@/usercomponents/hero/TruckRoadScene"), { ssr: false });

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

export function TruckCard({ className = "" }: { className?: string }) {
    const tabs = [
        { id: "Truck", Icon: Truck, img: "/images/truck.jpg" },
        { id: "Van", Icon: Bus, img: "/images/van.jpg" },
        { id: "Car", Icon: Car, img: "/images/van.jpg" },
    ];
    const [active, setActive] = useState("Truck");
    return (
        <div className={`${card} w-full max-w-[340px] p-4 lg:w-[270px] ${className}`}>
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
            <div className="relative mt-2 h-[116px] overflow-hidden rounded-xl">
                {tabs.map(({ id, img }) => (
                    <Image
                        key={id}
                        src={img}
                        alt={`${id} delivery vehicle`}
                        fill
                        sizes="240px"
                        className={`object-contain mix-blend-multiply transition-all duration-500 ${
                            active === id ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
                        }`}
                    />
                ))}
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
        <div className={`${card} w-full max-w-[340px] p-4 lg:w-[300px] ${className}`}>
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
                <Image
                    src="/images/avatars/emily.png"
                    alt="Emily Carter"
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full bg-[#eef0fb] object-cover"
                />
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

export function ToolsCard({ className = "" }: { className?: string }) {
    return (
        <div className={`${card} flex w-full max-w-[480px] flex-col gap-4 p-3.5 sm:flex-row ${className}`}>
            <div className="relative h-[170px] w-full shrink-0 overflow-hidden rounded-[18px] bg-[#e3e6f4] sm:h-[190px] sm:w-[230px]">
                <TruckRoadScene />
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
                {["/images/avatars/user1.png", "/images/avatars/user2.png", "/images/avatars/user3.png"].map((src) => (
                    <Image
                        key={src}
                        src={src}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full border-2 border-[#eceef9] bg-white object-cover"
                    />
                ))}
            </div>
            <p className="mt-2 text-[28px] font-medium leading-none tracking-tight text-[#12123f]">
                +<span ref={count}>0</span>k
            </p>
            <p className="mt-1 text-[14px] text-[#12123f]/60">Satisfied Users</p>
        </div>
    );
}
