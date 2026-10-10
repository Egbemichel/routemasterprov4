"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CornerDownLeft, LayoutDashboard, LogOut, Package, PlusCircle, Search, Truck, User, X } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminData";
import { matchesTerms, norm, searchCouriers, searchOrders, searchPeople } from "@/components/admin/search";
import { StatusBadge } from "@/components/admin/ui";
import { AdminView } from "@/app/types/view";
import { cn } from "@/lib/utils";

type Item =
    | { kind: "page"; id: string; label: string; hint: string; Icon: React.ComponentType<{ size?: number; className?: string }>; run: () => void }
    | { kind: "order"; id: string; tn: string; name: string; status?: string; route: string; run: () => void }
    | { kind: "person"; id: string; name: string; detail: string; run: () => void }
    | { kind: "courier"; id: string; name: string; run: () => void }
    | { kind: "all"; id: string; label: string; run: () => void };

export default function GlobalSearch({
    open,
    onOpenChange,
    onNavigate,
    onOpenOrder,
    onSeeAllOrders,
    onOpenCourier,
    onNewOrder,
    onLogout,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onNavigate: (v: AdminView) => void;
    onOpenOrder: (id: string) => void;
    onSeeAllOrders: (q: string) => void;
    onOpenCourier: (name: string) => void;
    onNewOrder: () => void;
    onLogout: () => void;
}) {
    const { packages, couriers, carrierName } = useAdminData();
    const [q, setQ] = useState("");
    const [active, setActive] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setQ("");
            setActive(0);
        }
    }, [open]);

    const close = () => onOpenChange(false);
    const act = (fn: () => void) => () => {
        close();
        fn();
    };

    const sections = useMemo(() => {
        const pages: Item[] = [
            { kind: "page", id: "p-dash", label: "Dashboard", hint: "Overview and stats", Icon: LayoutDashboard, run: act(() => onNavigate("dashboard")) },
            { kind: "page", id: "p-orders", label: "Orders", hint: "Search and manage packages", Icon: Package, run: act(() => onNavigate("orders")) },
            { kind: "page", id: "p-new", label: "New order", hint: "Generate a tracking number", Icon: PlusCircle, run: act(onNewOrder) },
            { kind: "page", id: "p-couriers", label: "Manage Couriers", hint: "Add, edit or remove couriers", Icon: Truck, run: act(() => onNavigate("couriers")) },
            { kind: "page", id: "p-logout", label: "Logout", hint: "Sign out of the admin panel", Icon: LogOut, run: act(onLogout) },
        ];
        const keywords: Record<string, string> = {
            "p-dash": "home overview stats statistics",
            "p-orders": "packages shipments tracking list",
            "p-new": "create add generate package shipment",
            "p-couriers": "carriers dhl fedex usps shipping companies",
            "p-logout": "sign out log out exit",
        };
        const trimmed = q.trim();
        const filteredPages = trimmed ? pages.filter((p) => p.kind === "page" && matchesTerms(norm(`${p.label} ${p.hint} ${keywords[p.id]}`), trimmed)) : pages;

        const orderMatches = trimmed ? searchOrders(packages, trimmed, carrierName) : packages.slice(0, 4);
        const orders: Item[] = orderMatches.slice(0, 6).map((p) => ({
            kind: "order",
            id: `o-${p.id}`,
            tn: p.trackingNumber || p.id,
            name: p.receiverName,
            status: p.status,
            route: `${p.packageOrigin} → ${p.destination}`,
            run: act(() => onOpenOrder(p.id)),
        }));
        if (trimmed && orderMatches.length > 6) {
            orders.push({ kind: "all", id: "o-all", label: `See all ${orderMatches.length} orders matching “${trimmed}”`, run: act(() => onSeeAllOrders(trimmed)) });
        }
        const people: Item[] = searchPeople(packages, trimmed)
            .slice(0, 4)
            .map((p) => ({
                kind: "person" as const,
                id: `n-${p.name}`,
                name: p.name,
                detail: [p.asReceiver ? `${p.asReceiver} as receiver` : "", p.asSender ? `${p.asSender} as sender` : ""].filter(Boolean).join(" · "),
                run: act(() => onSeeAllOrders(p.name)),
            }));
        const couriersFound: Item[] = (trimmed ? searchCouriers(couriers, trimmed) : []).slice(0, 4).map((c) => ({
            kind: "courier",
            id: `c-${c.id}`,
            name: c.name,
            run: act(() => onOpenCourier(c.name)),
        }));

        return [
            { title: "Pages & actions", items: filteredPages },
            { title: "People", items: people },
            { title: trimmed ? "Orders" : "Recent orders", items: orders },
            { title: "Couriers", items: couriersFound },
        ].filter((s) => s.items.length > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, packages, couriers]);

    const flat = sections.flatMap((s) => s.items);
    useEffect(() => setActive(0), [q]);
    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(flat.length - 1, a + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            flat[active]?.run();
        }
    };

    let idx = -1;
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#12123f]/50 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <Dialog.Content
                    onKeyDown={onKeyDown}
                    className="fixed inset-0 z-[71] flex flex-col bg-[#f6f7fd] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:inset-auto sm:left-1/2 sm:top-[12vh] sm:max-h-[72vh] sm:w-[640px] sm:-translate-x-1/2 sm:rounded-[28px] sm:shadow-2xl sm:data-[state=open]:zoom-in-95"
                >
                    <Dialog.Title className="sr-only">Search the admin panel</Dialog.Title>
                    <Dialog.Description className="sr-only">Search orders, couriers and pages</Dialog.Description>
                    <div className="flex items-center gap-3 border-b border-[#12123f]/8 bg-white px-4 py-3 sm:rounded-t-[28px]">
                        <Search size={20} className="shrink-0 text-[#ff5a0a]" />
                        <input
                            autoFocus
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search names, tracking numbers, couriers, pages…"
                            className="h-11 w-full bg-transparent text-[16px] text-[#12123f] outline-none placeholder:text-[#12123f]/40"
                            aria-label="Search"
                        />
                        <Dialog.Close className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#eef0fb] px-3 text-[12px] font-medium text-[#12123f]/70 hover:bg-[#e0e3f5]">
                            <span className="hidden sm:inline">Esc</span>
                            <X size={15} className="sm:hidden" />
                        </Dialog.Close>
                    </div>

                    <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-3">
                        {flat.length === 0 ? (
                            <div className="px-4 py-14 text-center">
                                <p className="text-[16px] font-semibold text-[#12123f]">No results for “{q}”</p>
                                <p className="mt-1 text-[14px] text-[#12123f]/55">Try a tracking number, a name, an email or a courier.</p>
                            </div>
                        ) : (
                            sections.map((s) => (
                                <div key={s.title} className="mb-3">
                                    <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#12123f]/45">{s.title}</p>
                                    {s.items.map((it) => {
                                        idx++;
                                        const i = idx;
                                        return (
                                            <button
                                                key={it.id}
                                                type="button"
                                                data-idx={i}
                                                onMouseMove={() => setActive(i)}
                                                onClick={it.run}
                                                className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors", i === active ? "bg-white shadow-[0_10px_24px_-16px_rgba(18,18,63,0.5)]" : "hover:bg-white/60")}
                                            >
                                                {it.kind === "page" && (
                                                    <>
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#12123f] text-white">
                                                            <it.Icon size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[14px] font-semibold text-[#12123f]">{it.label}</span>
                                                            <span className="block text-[12px] text-[#12123f]/50">{it.hint}</span>
                                                        </span>
                                                    </>
                                                )}
                                                {it.kind === "order" && (
                                                    <>
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5a0a]/10 text-[#ff5a0a]">
                                                            <Package size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate font-mono text-[12.5px] font-medium text-[#12123f]">{it.tn}</span>
                                                            <span className="block truncate text-[13px] text-[#12123f]/70">
                                                                {it.name} · {it.route}
                                                            </span>
                                                        </span>
                                                        <StatusBadge status={it.status} className="hidden sm:inline-flex" />
                                                    </>
                                                )}
                                                {it.kind === "person" && (
                                                    <>
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#12123f]/8 text-[#12123f]">
                                                            <User size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-[14px] font-semibold text-[#12123f]">{it.name}</span>
                                                            <span className="block text-[12px] text-[#12123f]/50">{it.detail}</span>
                                                        </span>
                                                        <ArrowRight size={15} className="shrink-0 text-[#ff5a0a]" />
                                                    </>
                                                )}
                                                {it.kind === "courier" && (
                                                    <>
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef0fb] text-[#12123f]">
                                                            <Truck size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1 text-[14px] font-semibold text-[#12123f]">{it.name}</span>
                                                    </>
                                                )}
                                                {it.kind === "all" && (
                                                    <>
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#12123f] text-white">
                                                            <ArrowRight size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1 text-[14px] font-semibold text-[#12123f]">{it.label}</span>
                                                    </>
                                                )}
                                                {i === active && <CornerDownLeft size={15} className="hidden shrink-0 text-[#12123f]/40 sm:block" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="hidden items-center justify-between border-t border-[#12123f]/8 px-5 py-3 text-[12px] text-[#12123f]/50 sm:flex">
                        <span>↑ ↓ to navigate · Enter to open</span>
                        <span>Ctrl / ⌘ + K anywhere</span>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
