"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "@firebase/firestore";
import { Loader2, Package, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { useAdminData } from "@/components/admin/AdminData";
import { useToaster } from "@/components/admin/Toaster";
import { searchCouriers } from "@/components/admin/search";
import { AdminIntent, Courier, getCourierImage } from "@/components/admin/types";
import { Card, EmptyState, Field, GhostButton, Hl, IconButton, PageTitle, Pagination, PrimaryButton, SearchInput, Sheet, SkeletonRows, inputCls, usePaged } from "@/components/admin/ui";

export default function CouriersView({ intent, onViewOrders }: { intent: AdminIntent; onViewOrders: (carrierName: string) => void }) {
    const { couriers, packages, loading, refreshCouriers } = useAdminData();
    const { toast, confirm } = useToaster();

    const [query, setQuery] = useState("");
    const [pageSize, setPageSize] = useState(9);
    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (intent.nonce && intent.query !== undefined) setQuery(intent.query);
    }, [intent]);

    const orderCount = useMemo(() => {
        const m: Record<string, number> = {};
        packages.forEach((p) => (m[p.carrierId] = (m[p.carrierId] || 0) + 1));
        return m;
    }, [packages]);

    const filtered = useMemo(() => [...searchCouriers(couriers, query)].sort((a, b) => a.name.localeCompare(b.name)), [couriers, query]);
    const paged = usePaged(filtered, pageSize, query);

    const openNew = () => {
        setEditId(null);
        setName("");
        setFormOpen(true);
    };
    const openEdit = (c: Courier) => {
        setEditId(c.id);
        setName(c.name);
        setFormOpen(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast("error", "Missing Name", "Courier name is required");
            return;
        }
        setSaving(true);
        try {
            if (editId) await updateDoc(doc(db, "couriers", editId), { name });
            else await addDoc(collection(db, "couriers"), { name });
            await refreshCouriers();
            setFormOpen(false);
            toast("success", "Courier Saved", "Courier information saved successfully.");
        } catch (err) {
            console.error("Error saving courier:", err);
            toast("error", "Save Failed", "Failed to save courier");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (c: Courier) => {
        const n = orderCount[c.id] || 0;
        const ok = await confirm(
            "Delete courier?",
            n > 0 ? `${c.name} is used by ${n} order${n === 1 ? "" : "s"}. Those orders will keep the carrier reference. Delete anyway?` : `Are you sure you want to delete ${c.name}?`,
            { confirmLabel: "Delete" },
        );
        if (!ok) return;
        try {
            await deleteDoc(doc(db, "couriers", c.id));
            await refreshCouriers();
            toast("success", "Courier Deleted", "Courier deleted successfully.");
        } catch (error) {
            console.error(error);
            toast("error", "Delete Failed", "Failed to delete courier.");
        }
    };

    return (
        <>
            <PageTitle
                title="Manage Couriers"
                subtitle={`${couriers.length} courier${couriers.length === 1 ? "" : "s"}`}
                actions={
                    <PrimaryButton onClick={openNew}>
                        <Plus size={18} /> Add courier
                    </PrimaryButton>
                }
            />

            <div className="mb-4">
                <SearchInput value={query} onChange={setQuery} placeholder="Search couriers…" className="max-w-[520px]" />
                {query && (
                    <p className="mt-2 text-[13px] text-[#12123f]/60" role="status">
                        <b className="text-[#12123f]">{filtered.length}</b> match{filtered.length === 1 ? "" : "es"} for “{query}”
                    </p>
                )}
            </div>

            <Card className="overflow-hidden">
                {loading ? (
                    <SkeletonRows rows={4} />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title={couriers.length === 0 ? "No couriers yet" : "No couriers match your search"}
                        text={couriers.length === 0 ? "Add a courier so it can be assigned to orders." : "Check the spelling or clear the search."}
                        action={
                            couriers.length === 0 ? (
                                <PrimaryButton onClick={openNew}>
                                    <Plus size={16} /> Add courier
                                </PrimaryButton>
                            ) : (
                                <GhostButton onClick={() => setQuery("")}>Clear search</GhostButton>
                            )
                        }
                    />
                ) : (
                    <>
                        <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                            {paged.slice.map((c) => (
                                <li key={c.id} className="group rounded-[22px] border border-[#12123f]/8 bg-[#f9faff] p-4 transition-all hover:-translate-y-0.5 hover:border-[#ff5a0a]/40 hover:bg-white hover:shadow-[0_18px_36px_-24px_rgba(255,90,10,0.55)]">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                                            <Image src={getCourierImage(c.name)} alt={c.name} width={44} height={44} className="rounded-full object-contain" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[16px] font-semibold text-[#12123f]">
                                                <Hl text={c.name} query={query} />
                                            </p>
                                            <button type="button" onClick={() => onViewOrders(c.name)} className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#12123f]/55 hover:text-[#ff5a0a]">
                                                <Package size={13} /> {orderCount[c.id] || 0} order{(orderCount[c.id] || 0) === 1 ? "" : "s"}
                                            </button>
                                        </div>
                                        <div className="flex">
                                            <IconButton label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                                                <Pencil size={16} />
                                            </IconButton>
                                            <IconButton label={`Delete ${c.name}`} onClick={() => remove(c)} className="hover:!bg-red-50 hover:!text-red-600">
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Pagination page={paged.page} pageCount={paged.pageCount} total={paged.total} pageSize={pageSize} onPage={paged.setPage} onPageSize={setPageSize} sizes={[9, 18, 36]} noun="couriers" />
                    </>
                )}
            </Card>

            <Sheet
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editId ? "Edit courier" : "Add courier"}
                description="Couriers can be assigned to orders and shown on tracking pages."
                width="sm:max-w-[460px]"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <GhostButton type="button" onClick={() => setFormOpen(false)}>
                            Cancel
                        </GhostButton>
                        <PrimaryButton type="submit" form="courier-form" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {editId ? "Update courier" : "Add courier"}
                        </PrimaryButton>
                    </div>
                }
            >
                <form id="courier-form" onSubmit={submit}>
                    <Card className="p-5">
                        <Field label="Courier name" hint="Tip: DHL and FedEx get their own logo automatically.">
                            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Courier name" required autoFocus />
                        </Field>
                    </Card>
                </form>
            </Sheet>
        </>
    );
}
