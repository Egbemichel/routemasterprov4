"use client";

import React, { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { LayoutDashboard, LogOut, Menu, Package, Plus, Search, Truck } from "lucide-react";
import { auth } from "@/lib/firebaseClient";
import Logo from "@/usercomponents/Logo";
import { AdminView } from "@/app/types/view";
import { AdminDataProvider, useAdminData } from "@/components/admin/AdminData";
import { ToasterProvider } from "@/components/admin/Toaster";
import { AdminIntent } from "@/components/admin/types";
import { Sheet } from "@/components/admin/ui";
import GlobalSearch from "@/components/admin/GlobalSearch";
import DashboardOverview from "@/components/admin/DashboardOverview";
import OrdersView from "@/components/admin/OrdersView";
import CouriersView from "@/components/admin/CouriersView";
import { cn } from "@/lib/utils";

const NAV: { view: AdminView; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { view: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { view: "orders", label: "Orders", Icon: Package },
    { view: "couriers", label: "Manage Couriers", Icon: Truck },
];

const TITLES: Record<AdminView, string> = { dashboard: "Dashboard", orders: "Orders", couriers: "Manage Couriers", customers: "Customers" };

function SidebarBody({ view, onNavigate, onLogout, email, orderCount }: { view: AdminView; onNavigate: (v: AdminView) => void; onLogout: () => void; email: string; orderCount: number }) {
    return (
        <div className="flex h-full flex-col bg-[#12123f] text-white">
            <div className="px-6 pb-6 pt-7">
                <Logo textClassName="text-white" iconSize={30} />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Admin panel</p>
            </div>
            <nav className="flex-1 space-y-1.5 px-4" aria-label="Admin navigation">
                {NAV.map(({ view: v, label, Icon }) => {
                    const active = view === v;
                    return (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onNavigate(v)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[14.5px] font-medium transition-all",
                                active ? "bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white shadow-[0_14px_28px_-14px_rgba(255,90,10,0.9)]" : "text-white/70 hover:bg-white/8 hover:text-white",
                            )}
                        >
                            <Icon size={19} />
                            <span className="flex-1">{label}</span>
                            {v === "orders" && orderCount > 0 && <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", active ? "bg-white/25" : "bg-white/10")}>{orderCount}</span>}
                        </button>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-4">
                {email && (
                    <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/6 p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff5a0a] text-[14px] font-bold uppercase">{email[0]}</span>
                        <span className="min-w-0">
                            <span className="block text-[11px] text-white/45">Signed in as</span>
                            <span className="block truncate text-[13px] font-medium">{email}</span>
                        </span>
                    </div>
                )}
                <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14.5px] font-medium text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200">
                    <LogOut size={19} /> Logout
                </button>
            </div>
        </div>
    );
}

function Shell() {
    const { packages } = useAdminData();
    const [view, setView] = useState<AdminView>("dashboard");
    const [intent, setIntent] = useState<AdminIntent>({ nonce: 0 });
    const [drawer, setDrawer] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => onAuthStateChanged(auth, (u) => setEmail(u?.email || "")), []);

    // Ctrl/Cmd + K (or "/") opens the global search from anywhere
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen(true);
            } else if (e.key === "/" && !typing) {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const send = useCallback((v: AdminView, i: Omit<AdminIntent, "nonce"> = {}) => {
        setView(v);
        setIntent((p) => ({ ...i, nonce: p.nonce + 1 }));
        setDrawer(false);
    }, []);

    const logout = async () => {
        await auth.signOut();
        location.href = "/admin/login";
    };

    const sidebar = <SidebarBody view={view} onNavigate={(v) => send(v)} onLogout={logout} email={email} orderCount={packages.length} />;

    return (
        <div className="min-h-[100svh] bg-[#eef0fb] font-display text-[#12123f]">
            {/* desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">{sidebar}</aside>

            {/* mobile drawer */}
            <Sheet open={drawer} onOpenChange={setDrawer} side="left" width="max-w-[300px]" title="Menu" bare>
                {sidebar}
            </Sheet>

            <div className="lg:pl-[272px]">
                {/* top bar */}
                <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#12123f]/6 bg-[#eef0fb]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#12123f] shadow-sm lg:hidden">
                        <Menu size={20} />
                    </button>
                    <p className="hidden text-[15px] font-semibold text-[#12123f] md:block md:w-[160px]">{TITLES[view]}</p>

                    <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className="group flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-4 text-left shadow-sm transition-shadow hover:shadow-md md:max-w-[560px]"
                        aria-label="Search orders, couriers and pages"
                    >
                        <Search size={18} className="shrink-0 text-[#ff5a0a]" />
                        <span className="flex-1 truncate text-[14px] text-[#12123f]/45">Search orders, couriers, pages…</span>
                        <kbd className="hidden rounded-md bg-[#eef0fb] px-2 py-0.5 text-[11px] font-semibold text-[#12123f]/55 sm:block">Ctrl K</kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => send("orders", { newOrder: true })}
                        className="ml-auto hidden h-11 items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_-10px_rgba(255,90,10,0.85)] transition-all hover:-translate-y-0.5 sm:flex"
                    >
                        <Plus size={17} /> New order
                    </button>
                </header>

                <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {view === "orders" ? (
                        <OrdersView intent={intent} />
                    ) : view === "couriers" ? (
                        <CouriersView intent={intent} onViewOrders={(name) => send("orders", { query: name })} />
                    ) : (
                        <DashboardOverview go={(v) => send(v)} openOrder={(id) => send("orders", { openId: id })} newOrder={() => send("orders", { newOrder: true })} />
                    )}
                </main>
            </div>

            <GlobalSearch
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onNavigate={(v) => send(v)}
                onOpenOrder={(id) => send("orders", { openId: id })}
                onSeeAllOrders={(q) => send("orders", { query: q })}
                onOpenCourier={(name) => send("couriers", { query: name })}
                onNewOrder={() => send("orders", { newOrder: true })}
                onLogout={logout}
            />
        </div>
    );
}

export default function AdminShell({ mock }: { mock?: React.ComponentProps<typeof AdminDataProvider>["mock"] }) {
    return (
        <ToasterProvider>
            <AdminDataProvider mock={mock}>
                <Shell />
            </AdminDataProvider>
        </ToasterProvider>
    );
}
