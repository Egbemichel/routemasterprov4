"use client";

import React from "react";
import Barcode from "react-barcode";
import Image from "next/image";
import { Copy, ExternalLink, FileDown, Pencil, Trash2 } from "lucide-react";
import { GhostButton, PrimaryButton, Sheet, StatusBadge } from "@/components/admin/ui";
import { PackageData, getCourierImage } from "@/components/admin/types";

const Row = ({ k, v }: { k: string; v?: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 border-b border-[#12123f]/6 py-2.5 last:border-0">
        <span className="shrink-0 text-[13px] text-[#12123f]/55">{k}</span>
        <span className="break-words text-right text-[14px] font-medium text-[#12123f]">{v || "-"}</span>
    </div>
);

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-[22px] bg-white px-5 py-4 shadow-[0_14px_34px_-28px_rgba(18,18,63,0.5)]">
        <h3 className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-[#12123f]">
            <span className="h-4 w-1 rounded-full bg-[#ff5a0a]" />
            {title}
        </h3>
        {children}
    </section>
);

export default function OrderDetails({
    pkg,
    carrier,
    onClose,
    onEdit,
    onDelete,
    onReceipt,
    onCopy,
}: {
    pkg: PackageData | null;
    carrier: string;
    onClose: () => void;
    onEdit: (p: PackageData) => void;
    onDelete: (p: PackageData) => void;
    onReceipt: (p: PackageData) => void;
    onCopy: (tn: string) => void;
}) {
    const tn = pkg?.trackingNumber || pkg?.id || "";
    return (
        <Sheet
            open={!!pkg}
            onOpenChange={(o) => !o && onClose()}
            title={pkg ? `Order ${tn}` : ""}
            description={pkg ? `${pkg.packageOrigin} → ${pkg.destination}` : undefined}
            footer={
                pkg && (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                        <GhostButton onClick={() => onDelete(pkg)} className="!border-red-200 text-red-600 hover:!bg-red-50">
                            <Trash2 size={16} /> Delete
                        </GhostButton>
                        <GhostButton onClick={() => onReceipt(pkg)}>
                            <FileDown size={16} /> Receipt
                        </GhostButton>
                        <PrimaryButton onClick={() => onEdit(pkg)} className="col-span-2 sm:col-span-1">
                            <Pencil size={16} /> Edit order
                        </PrimaryButton>
                    </div>
                )
            }
        >
            {pkg && (
                <div className="space-y-4">
                    {/* tracking hero */}
                    <div className="relative overflow-hidden rounded-[26px] bg-[#12123f] p-5 text-white">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#ff5a0a]/40 blur-[60px]" />
                        <div className="relative flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">Tracking number</p>
                                <p className="mt-1 break-all font-display text-[20px] font-medium tracking-tight">{tn}</p>
                            </div>
                            <StatusBadge status={pkg.status} />
                        </div>
                        <div className="relative mt-4 flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => onCopy(tn)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium hover:bg-white/20">
                                <Copy size={14} /> Copy
                            </button>
                            <a href={`/track/${encodeURIComponent(tn)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium hover:bg-white/20">
                                <ExternalLink size={14} /> Tracking page
                            </a>
                        </div>
                        <div className="relative mt-4 overflow-x-auto rounded-2xl bg-white p-3">
                            <div className="mx-auto w-fit">
                                <Barcode value={tn} height={50} width={1.6} fontSize={12} background="#ffffff" lineColor="#12123f" />
                            </div>
                        </div>
                    </div>

                    <Block title="Shipment">
                        <Row k="Contents" v={pkg.packageContent} />
                        <Row k="Quantity" v={pkg.quantity} />
                        <Row k="Weight" v={pkg.weightKg != null ? `${pkg.weightKg} kg` : undefined} />
                        <Row
                            k="Carrier"
                            v={
                                <span className="inline-flex items-center gap-2">
                                    <Image src={getCourierImage(carrier)} alt="" width={22} height={22} className="rounded-full" />
                                    {carrier}
                                </span>
                            }
                        />
                        <Row k="Delivery type" v={pkg.deliveryType} />
                        <Row k="Transport mode" v={pkg.transportMode} />
                        <Row k="Expected delivery" v={pkg.expectedDeliveryDate} />
                        <Row k="Departure time" v={pkg.departureTime} />
                    </Block>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Block title="Sender">
                            <Row k="Name" v={pkg.senderName} />
                            <Row k="Phone" v={pkg.senderPhone} />
                            <Row k="Email" v={pkg.senderEmail} />
                            <Row k="Address" v={pkg.senderAddress} />
                        </Block>
                        <Block title="Receiver">
                            <Row k="Name" v={pkg.receiverName} />
                            <Row k="Phone" v={pkg.receiverPhone} />
                            <Row k="Email" v={pkg.receiverEmail} />
                            <Row k="Address" v={pkg.receiverAddress} />
                        </Block>
                    </div>

                    {pkg.comment && (
                        <Block title="Comment">
                            <p className="py-2 text-[14px] leading-relaxed text-[#12123f]/75">{pkg.comment}</p>
                        </Block>
                    )}
                </div>
            )}
        </Sheet>
    );
}
