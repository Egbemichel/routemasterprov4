"use client";

import React, { useEffect, useMemo, useState } from "react";
import { deleteDoc, doc } from "@firebase/firestore";
import { ArrowRight, Copy, FileDown, Package, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { useAdminData } from "@/components/admin/AdminData";
import { useToaster } from "@/components/admin/Toaster";
import { searchOrders } from "@/components/admin/search";
import { generateReceipt } from "@/components/admin/receipt";
import OrderForm from "@/components/admin/OrderForm";
import OrderDetails from "@/components/admin/OrderDetails";
import { AdminIntent, PackageData, STATUSES, statusLabel } from "@/components/admin/types";
import {
    Card,
    EmptyState,
    GhostButton,
    Hl,
    IconButton,
    PageTitle,
    Pagination,
    PrimaryButton,
    SearchInput,
    SkeletonRows,
    StatusBadge,
    inputCls,
    usePaged,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type SortKey = "date-desc" | "date-asc" | "name" | "tracking";

export default function OrdersView({ intent }: { intent: AdminIntent }) {
    const { packages, couriers, loading, carrierName, removePackageLocal } = useAdminData();
    const { toast, confirm } = useToaster();

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [carrier, setCarrier] = useState("all");
    const [type, setType] = useState("all");
    const [mode, setMode] = useState("all");
    const [sort, setSort] = useState<SortKey>("date-desc");
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<PackageData | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);

    // react to "open this order" / "search for…" requests coming from the global search
    useEffect(() => {
        if (!intent.nonce) return;
        if (intent.query !== undefined) {
            setQuery(intent.query);
            setStatus("all");
            setCarrier("all");
            setType("all");
            setMode("all");
        }
        if (intent.openId) setDetailId(intent.openId);
        if (intent.newOrder) {
            setEditing(null);
            setFormOpen(true);
        }
    }, [intent]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: packages.length };
        STATUSES.forEach((s) => (c[s] = 0));
        packages.forEach((p) => {
            const k = (p.status || "").toLowerCase();
            c[k] = (c[k] || 0) + 1;
        });
        return c;
    }, [packages]);

    const filtered = useMemo(() => {
        let list = searchOrders(packages, query, carrierName);
        if (status !== "all") list = list.filter((p) => (p.status || "").toLowerCase() === status);
        if (carrier !== "all") list = list.filter((p) => p.carrierId === carrier);
        if (type !== "all") list = list.filter((p) => p.deliveryType === type);
        if (mode !== "all") list = list.filter((p) => p.transportMode === mode);
        const sorted = [...list];
        const date = (p: PackageData) => p.expectedDeliveryDate || "";
        switch (sort) {
            case "date-asc":
                sorted.sort((a, b) => date(a).localeCompare(date(b)));
                break;
            case "name":
                sorted.sort((a, b) => (a.receiverName || "").localeCompare(b.receiverName || ""));
                break;
            case "tracking":
                sorted.sort((a, b) => (a.trackingNumber || a.id).localeCompare(b.trackingNumber || b.id));
                break;
            default:
                sorted.sort((a, b) => date(b).localeCompare(date(a)));
        }
        return sorted;
    }, [packages, query, status, carrier, type, mode, sort, carrierName]);

    const paged = usePaged(filtered, pageSize, `${query}|${status}|${carrier}|${type}|${mode}|${sort}`);
    const detail = packages.find((p) => p.id === detailId) || null;
    const activeFilters = [carrier, type, mode].filter((v) => v !== "all").length;

    const openNew = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (p: PackageData) => {
        setEditing(p);
        setFormOpen(true);
    };
    const copy = (tn: string) => {
        navigator.clipboard?.writeText(tn);
        toast("info", "Copied", tn);
    };
    const receipt = async (p: PackageData) => {
        try {
            await generateReceipt(p, carrierName(p.carrierId));
        } catch (e) {
            console.error(e);
            toast("error", "Receipt failed", "Could not generate the receipt PDF.");
        }
    };
    const remove = async (p: PackageData) => {
        const ok = await confirm("Delete package?", `Are you sure you want to delete ${p.trackingNumber || p.id}? This cannot be undone.`, { confirmLabel: "Delete" });
        if (!ok) return;
        try {
            await deleteDoc(doc(db, "packages", p.id));
            removePackageLocal(p.id);
            setDetailId(null);
            toast("success", "Package Deleted", "Package deleted successfully.");
        } catch (error) {
            console.error("Delete error:", error);
            toast("error", "Delete Failed", "Failed to delete package.");
        }
    };

    const chip = (key: string, label: string) => (
        <button
            key={key}
            type="button"
            onClick={() => setStatus(key)}
            className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all",
                status === key ? "bg-[#12123f] text-white shadow-md" : "bg-white text-[#12123f] hover:bg-[#ffe9dd] hover:text-[#e84800]",
            )}
        >
            {label}
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", status === key ? "bg-white/20" : "bg-[#eef0fb]")}>{counts[key] ?? 0}</span>
        </button>
    );

    return (
        <>
            <PageTitle
                title="Orders"
                subtitle={`${packages.length} package${packages.length === 1 ? "" : "s"} in total`}
                actions={
                    <PrimaryButton onClick={openNew}>
                        <Plus size={18} /> New order
                    </PrimaryButton>
                }
            />

            {/* toolbar */}
            <div className="mb-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <SearchInput value={query} onChange={setQuery} placeholder="Search tracking number, name, email, phone, address, carrier…" className="flex-1" />
                    <div className="flex gap-2">
                        <select aria-label="Sort orders" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={cn(inputCls, "w-full sm:w-[190px]")}>
                            <option value="date-desc">Delivery: latest first</option>
                            <option value="date-asc">Delivery: earliest first</option>
                            <option value="name">Receiver A–Z</option>
                            <option value="tracking">Tracking number</option>
                        </select>
                        <GhostButton onClick={() => setShowFilters((s) => !s)} className="relative h-12 shrink-0 !px-4" aria-expanded={showFilters}>
                            <SlidersHorizontal size={17} />
                            <span className="hidden sm:inline">Filters</span>
                            {activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5a0a] text-[11px] font-bold text-white">{activeFilters}</span>}
                        </GhostButton>
                    </div>
                </div>

                {showFilters && (
                    <Card className="grid gap-3 p-4 sm:grid-cols-3">
                        <select aria-label="Filter by carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} className={inputCls}>
                            <option value="all">All carriers</option>
                            {couriers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select aria-label="Filter by delivery type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                            <option value="all">All delivery types</option>
                            <option value="National Shipping">National Shipping</option>
                            <option value="International Shipping">International Shipping</option>
                        </select>
                        <select aria-label="Filter by transport mode" value={mode} onChange={(e) => setMode(e.target.value)} className={inputCls}>
                            <option value="all">All transport modes</option>
                            <option value="Air Freight">Air Freight</option>
                            <option value="Ship Freight">Ship Freight</option>
                            <option value="Truck Freight">Truck Freight</option>
                            <option value="Train Freight">Train Freight</option>
                        </select>
                        {activeFilters > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCarrier("all");
                                    setType("all");
                                    setMode("all");
                                }}
                                className="text-left text-[13px] font-medium text-[#ff5a0a] hover:underline sm:col-span-3"
                            >
                                Clear filters
                            </button>
                        )}
                    </Card>
                )}

                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                    {chip("all", "All")}
                    {STATUSES.map((s) => chip(s, statusLabel(s)))}
                </div>

                {(query || activeFilters > 0 || status !== "all") && (
                    <p className="text-[13px] text-[#12123f]/60" role="status">
                        <b className="text-[#12123f]">{filtered.length}</b> match{filtered.length === 1 ? "" : "es"}
                        {query && (
                            <>
                                {" "}
                                for “<b className="text-[#12123f]">{query}</b>”
                            </>
                        )}
                    </p>
                )}
            </div>

            <Card className="overflow-hidden">
                {loading ? (
                    <SkeletonRows />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title={packages.length === 0 ? "No orders yet" : "No orders match your search"}
                        text={packages.length === 0 ? "Create your first order to generate a tracking number." : "Try a different spelling, remove a filter, or search by tracking number."}
                        action={
                            packages.length === 0 ? (
                                <PrimaryButton onClick={openNew}>
                                    <Plus size={16} /> New order
                                </PrimaryButton>
                            ) : (
                                <GhostButton
                                    onClick={() => {
                                        setQuery("");
                                        setStatus("all");
                                        setCarrier("all");
                                        setType("all");
                                        setMode("all");
                                    }}
                                >
                                    Reset search & filters
                                </GhostButton>
                            )
                        }
                    />
                ) : (
                    <>
                        {/* desktop table */}
                        <div className="hidden md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#12123f]/8 text-[11px] uppercase tracking-wider text-[#12123f]/45">
                                        <th className="px-5 py-3 font-semibold">Tracking</th>
                                        <th className="px-3 py-3 font-semibold">Receiver</th>
                                        <th className="px-3 py-3 font-semibold">Route</th>
                                        <th className="px-3 py-3 font-semibold">Carrier</th>
                                        <th className="px-3 py-3 font-semibold">Status</th>
                                        <th className="px-3 py-3 font-semibold">Expected</th>
                                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paged.slice.map((p) => (
                                        <tr key={p.id} onClick={() => setDetailId(p.id)} className="cursor-pointer border-b border-[#12123f]/6 transition-colors last:border-0 hover:bg-[#f6f7fd]">
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-[13px] font-medium text-[#12123f]">
                                                    <Hl text={p.trackingNumber || p.id} query={query} />
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <p className="text-[14px] font-medium text-[#12123f]">
                                                    <Hl text={p.receiverName} query={query} />
                                                </p>
                                                <p className="text-[12px] text-[#12123f]/50">
                                                    <Hl text={p.receiverEmail} query={query} />
                                                </p>
                                            </td>
                                            <td className="px-3 py-4 text-[13px] text-[#12123f]/75">
                                                <span className="inline-flex max-w-[210px] items-center gap-1.5">
                                                    <span className="truncate">{p.packageOrigin}</span>
                                                    <ArrowRight size={13} className="shrink-0 text-[#ff5a0a]" />
                                                    <span className="truncate">{p.destination}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-[13px] text-[#12123f]/75">{carrierName(p.carrierId)}</td>
                                            <td className="px-3 py-4">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-[13px] text-[#12123f]/75">{p.expectedDeliveryDate || "-"}</td>
                                            <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-0.5">
                                                    <IconButton label="Copy tracking number" onClick={() => copy(p.trackingNumber || p.id)}>
                                                        <Copy size={16} />
                                                    </IconButton>
                                                    <IconButton label="Download receipt" onClick={() => receipt(p)}>
                                                        <FileDown size={16} />
                                                    </IconButton>
                                                    <IconButton label="Edit order" onClick={() => openEdit(p)}>
                                                        <Pencil size={16} />
                                                    </IconButton>
                                                    <IconButton label="Delete order" onClick={() => remove(p)} className="hover:!bg-red-50 hover:!text-red-600">
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* mobile cards */}
                        <ul className="divide-y divide-[#12123f]/6 md:hidden">
                            {paged.slice.map((p) => (
                                <li key={p.id} className="p-4">
                                    <button type="button" onClick={() => setDetailId(p.id)} className="block w-full text-left">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef0fb] text-[#12123f]">
                                                    <Package size={17} />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-mono text-[12.5px] font-medium text-[#12123f]">
                                                        <Hl text={p.trackingNumber || p.id} query={query} />
                                                    </span>
                                                    <span className="block truncate text-[14px] font-medium text-[#12123f]">
                                                        <Hl text={p.receiverName} query={query} />
                                                    </span>
                                                </span>
                                            </span>
                                            <StatusBadge status={p.status} />
                                        </div>
                                        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#12123f]/65">
                                            <span className="truncate">{p.packageOrigin}</span>
                                            <ArrowRight size={13} className="shrink-0 text-[#ff5a0a]" />
                                            <span className="truncate">{p.destination}</span>
                                        </p>
                                        <p className="mt-1 text-[12px] text-[#12123f]/45">
                                            {carrierName(p.carrierId)} · Expected {p.expectedDeliveryDate || "-"}
                                        </p>
                                    </button>
                                    <div className="mt-3 flex gap-2">
                                        <GhostButton onClick={() => openEdit(p)} className="flex-1 !py-2 text-[13px]">
                                            <Pencil size={14} /> Edit
                                        </GhostButton>
                                        <GhostButton onClick={() => receipt(p)} className="flex-1 !py-2 text-[13px]">
                                            <FileDown size={14} /> Receipt
                                        </GhostButton>
                                        <GhostButton onClick={() => remove(p)} aria-label="Delete order" className="!border-red-200 !px-3 !py-2 text-red-600">
                                            <Trash2 size={14} />
                                        </GhostButton>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <Pagination page={paged.page} pageCount={paged.pageCount} total={paged.total} pageSize={pageSize} onPage={paged.setPage} onPageSize={setPageSize} noun="orders" />
                    </>
                )}
            </Card>

            <OrderDetails
                pkg={detail}
                carrier={detail ? carrierName(detail.carrierId) : ""}
                onClose={() => setDetailId(null)}
                onEdit={(p) => {
                    setDetailId(null);
                    openEdit(p);
                }}
                onDelete={remove}
                onReceipt={receipt}
                onCopy={copy}
            />
            <OrderForm
                open={formOpen}
                onOpenChange={setFormOpen}
                editing={editing}
            />
        </>
    );
}
