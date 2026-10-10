"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, CheckCircle2, Clock3, PauseCircle, Plus, Search, Truck, Package, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/components/admin/AdminData";
import { AdminView } from "@/app/types/view";
import { Card, EmptyState, PageTitle, PrimaryButton, SkeletonRows, StatusBadge, inputCls } from "@/components/admin/ui";
import { statusLabel } from "@/components/admin/types";
import { cn } from "@/lib/utils";

function CountUp({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.textContent = String(value);
            return;
        }
        const o = { v: 0 };
        const t = gsap.to(o, { v: value, duration: 1.1, ease: "power2.out", onUpdate: () => (el.textContent = String(Math.round(o.v))) });
        return () => {
            t.kill();
        };
    }, [value]);
    return <span ref={ref}>0</span>;
}

const STATUS_BAR: Record<string, string> = {
    "in transit": "bg-[#ff5a0a]",
    "on hold": "bg-amber-400",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-500",
};

export default function DashboardOverview({
    go,
    openOrder,
    newOrder,
}: {
    go: (v: AdminView) => void;
    openOrder: (id: string) => void;
    newOrder: () => void;
}) {
    const { packages, couriers, loading, carrierName } = useAdminData();
    const router = useRouter();
    const [tn, setTn] = useState("");
    const root = useRef<HTMLDivElement>(null);

    const stats = useMemo(() => {
        const by: Record<string, number> = { "in transit": 0, "on hold": 0, delivered: 0, cancelled: 0 };
        packages.forEach((p) => {
            const k = (p.status || "").toLowerCase();
            by[k] = (by[k] || 0) + 1;
        });
        return by;
    }, [packages]);

    const upcoming = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return packages
            .filter((p) => p.expectedDeliveryDate && p.expectedDeliveryDate >= today && !["delivered", "cancelled"].includes((p.status || "").toLowerCase()))
            .sort((a, b) => a.expectedDeliveryDate.localeCompare(b.expectedDeliveryDate))
            .slice(0, 5);
    }, [packages]);

    const modes = useMemo(() => {
        const m: Record<string, number> = {};
        packages.forEach((p) => p.transportMode && (m[p.transportMode] = (m[p.transportMode] || 0) + 1));
        return Object.entries(m).sort((a, b) => b[1] - a[1]);
    }, [packages]);

    useEffect(() => {
        const el = root.current;
        if (!el || loading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.from("[data-in]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" });
            gsap.from("[data-bar]", { scaleX: 0, transformOrigin: "left", duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3 });
        }, el);
        return () => ctx.revert();
    }, [loading]);

    const total = packages.length;
    const cards = [
        { label: "Total packages", value: total, Icon: Package, tone: "bg-[#12123f]", num: "text-white", sub: "text-white/55", icon: "bg-white/10 text-white" },
        { label: "In transit", value: stats["in transit"], Icon: Truck, tone: "bg-white", num: "text-[#12123f]", sub: "text-[#12123f]/50", icon: "bg-[#ff5a0a]/10 text-[#ff5a0a]" },
        { label: "On hold", value: stats["on hold"], Icon: PauseCircle, tone: "bg-white", num: "text-[#12123f]", sub: "text-[#12123f]/50", icon: "bg-amber-100 text-amber-600" },
        { label: "Delivered", value: stats["delivered"], Icon: CheckCircle2, tone: "bg-white", num: "text-[#12123f]", sub: "text-[#12123f]/50", icon: "bg-emerald-100 text-emerald-600" },
    ];

    const submitTrack = (e: React.FormEvent) => {
        e.preventDefault();
        const v = tn.trim();
        if (v) router.push(`/track/${encodeURIComponent(v)}`);
    };

    return (
        <div ref={root}>
            <PageTitle
                title="Dashboard"
                subtitle="A quick look at your shipments."
                actions={
                    <PrimaryButton onClick={newOrder} className="sm:hidden">
                        <Plus size={18} /> New order
                    </PrimaryButton>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {cards.map(({ label, value, Icon, tone, num, sub, icon }) => (
                    <div key={label} data-in className={cn("rounded-[24px] p-5 shadow-[0_20px_44px_-30px_rgba(18,18,63,0.45)]", tone)}>
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", icon)}>
                            <Icon size={20} />
                        </span>
                        <p className={cn("mt-4 font-display text-[clamp(2rem,4vw,2.8rem)] font-medium leading-none tracking-[-0.04em]", num)}>
                            {loading ? "–" : <CountUp value={value} />}
                        </p>
                        <p className={cn("mt-1.5 text-[13px]", sub)}>{label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                {/* status breakdown */}
                <Card data-in className="p-5 sm:p-6">
                    <h2 className="text-[16px] font-semibold text-[#12123f]">Shipment status</h2>
                    <p className="text-[13px] text-[#12123f]/50">How your {total} package{total === 1 ? "" : "s"} are split</p>
                    {loading ? (
                        <SkeletonRows rows={3} />
                    ) : total === 0 ? (
                        <EmptyState title="Nothing to show yet" text="Create an order to see your breakdown." />
                    ) : (
                        <>
                            <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-[#eef0fb]">
                                {Object.entries(stats).map(([k, v]) =>
                                    v ? <span key={k} data-bar className={cn("h-full", STATUS_BAR[k] || "bg-slate-400")} style={{ width: `${(v / total) * 100}%` }} /> : null,
                                )}
                            </div>
                            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {Object.entries(stats).map(([k, v]) => (
                                    <li key={k} className="rounded-2xl bg-[#f6f7fd] p-3">
                                        <span className="flex items-center gap-2 text-[12px] text-[#12123f]/60">
                                            <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_BAR[k] || "bg-slate-400")} />
                                            {statusLabel(k)}
                                        </span>
                                        <p className="mt-1 text-[22px] font-semibold text-[#12123f]">{v}</p>
                                        <p className="text-[12px] text-[#12123f]/45">{total ? Math.round((v / total) * 100) : 0}%</p>
                                    </li>
                                ))}
                            </ul>
                            {modes.length > 0 && (
                                <div className="mt-6">
                                    <p className="mb-3 text-[13px] font-semibold text-[#12123f]">By transport mode</p>
                                    <ul className="space-y-2.5">
                                        {modes.map(([m, n]) => (
                                            <li key={m} className="flex items-center gap-3 text-[13px]">
                                                <span className="w-[110px] shrink-0 text-[#12123f]/65">{m}</span>
                                                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eef0fb]">
                                                    <span data-bar className="block h-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#ff4d00]" style={{ width: `${(n / modes[0][1]) * 100}%` }} />
                                                </span>
                                                <span className="w-7 text-right font-medium text-[#12123f]">{n}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                <div className="space-y-4">
                    {/* quick track */}
                    <div data-in className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#ff8a3d] to-[#ff4d00] p-5 text-white shadow-[0_24px_50px_-26px_rgba(255,90,10,0.8)] sm:p-6">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                        <Route size={22} />
                        <h2 className="mt-3 text-[18px] font-semibold">Track a shipment</h2>
                        <p className="text-[13px] text-white/80">Open the customer tracking page.</p>
                        <form onSubmit={submitTrack} className="mt-4 flex gap-2">
                            <input value={tn} onChange={(e) => setTn(e.target.value)} placeholder="RM…-SHIP" className={cn(inputCls, "h-11 border-transparent")} aria-label="Tracking number" />
                            <button type="submit" aria-label="Track" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12123f] hover:bg-black">
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    <Card data-in className="p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[16px] font-semibold text-[#12123f]">Arriving soon</h2>
                            <Clock3 size={18} className="text-[#12123f]/35" />
                        </div>
                        {upcoming.length === 0 ? (
                            <p className="py-6 text-center text-[13px] text-[#12123f]/50">No upcoming deliveries.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-[#12123f]/6">
                                {upcoming.map((p) => (
                                    <li key={p.id}>
                                        <button type="button" onClick={() => openOrder(p.id)} className="flex w-full items-center gap-3 py-3 text-left hover:opacity-80">
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-mono text-[12.5px] font-medium text-[#12123f]">{p.trackingNumber || p.id}</span>
                                                <span className="block truncate text-[12px] text-[#12123f]/50">
                                                    {p.receiverName} · {carrierName(p.carrierId)}
                                                </span>
                                            </span>
                                            <span className="text-right">
                                                <span className="block text-[12px] font-medium text-[#12123f]">{p.expectedDeliveryDate}</span>
                                                <StatusBadge status={p.status} className="mt-1 !px-2 !py-0.5 !text-[10px]" />
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" data-in onClick={() => go("orders")} className="group flex items-center justify-between rounded-[24px] bg-white p-5 text-left shadow-[0_20px_44px_-30px_rgba(18,18,63,0.45)] transition-all hover:-translate-y-0.5">
                    <span>
                        <span className="block text-[16px] font-semibold text-[#12123f]">Browse all orders</span>
                        <span className="text-[13px] text-[#12123f]/50">Search, filter and manage {total} orders</span>
                    </span>
                    <ArrowRight className="text-[#ff5a0a] transition-transform group-hover:translate-x-1" />
                </button>
                <button type="button" data-in onClick={() => go("couriers")} className="group flex items-center justify-between rounded-[24px] bg-white p-5 text-left shadow-[0_20px_44px_-30px_rgba(18,18,63,0.45)] transition-all hover:-translate-y-0.5">
                    <span>
                        <span className="block text-[16px] font-semibold text-[#12123f]">Manage couriers</span>
                        <span className="text-[13px] text-[#12123f]/50">{couriers.length} courier{couriers.length === 1 ? "" : "s"} available</span>
                    </span>
                    <ArrowRight className="text-[#ff5a0a] transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
}
