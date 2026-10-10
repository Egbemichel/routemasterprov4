"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { highlightParts } from "@/components/admin/search";
import { statusLabel } from "@/components/admin/types";

/* ------------------------------ surfaces ------------------------------ */

export const Card = ({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...rest} className={cn("rounded-[24px] bg-white shadow-[0_20px_44px_-30px_rgba(18,18,63,0.45)]", className)}>
        {children}
    </div>
);

export const PrimaryButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...p }, ref) => (
        <button
            ref={ref}
            {...p}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_-10px_rgba(255,90,10,0.85)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
        />
    ),
);
PrimaryButton.displayName = "PrimaryButton";

export const GhostButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...p }, ref) => (
        <button
            ref={ref}
            {...p}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border border-[#12123f]/15 bg-white px-5 py-3 text-[14px] font-medium text-[#12123f] transition-all hover:border-[#12123f]/40 hover:bg-[#eef0fb] active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
        />
    ),
);
GhostButton.displayName = "GhostButton";

export const IconButton = ({ label, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) => (
    <button
        type="button"
        aria-label={label}
        title={label}
        {...p}
        className={cn("flex h-9 w-9 items-center justify-center rounded-full text-[#12123f]/70 transition-colors hover:bg-[#eef0fb] hover:text-[#12123f]", className)}
    />
);

/* ------------------------------ status ------------------------------ */

const STATUS_STYLES: Record<string, string> = {
    "in transit": "bg-[#ff5a0a]/10 text-[#e84800]",
    "on hold": "bg-amber-100 text-amber-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-700",
};
const DOT: Record<string, string> = {
    "in transit": "bg-[#ff5a0a]",
    "on hold": "bg-amber-500",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-500",
};

export const StatusBadge = ({ status, className }: { status?: string; className?: string }) => {
    const k = (status || "").toLowerCase();
    return (
        <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold", STATUS_STYLES[k] || "bg-slate-100 text-slate-700", className)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", DOT[k] || "bg-slate-400", k === "in transit" && "animate-pulse")} />
            {statusLabel(status)}
        </span>
    );
};

/* ------------------------------ forms ------------------------------ */

export const inputCls =
    "h-12 w-full rounded-2xl border border-[#12123f]/12 bg-white px-4 text-[14px] text-[#12123f] placeholder:text-[#12123f]/35 outline-none transition-all focus:border-[#ff5a0a] focus:ring-4 focus:ring-[#ff5a0a]/15";

export const Field = ({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) => (
    <label className={cn("block", className)}>
        <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[#12123f]/55">{label}</span>
        {children}
        {hint && <span className="mt-1 block text-[12px] text-[#12123f]/45">{hint}</span>}
    </label>
);

export const SearchInput = ({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    className?: string;
}) => (
    <div className={cn("relative", className)}>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#12123f]/40" />
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(inputCls, "pl-11 pr-10 [&::-webkit-search-cancel-button]:hidden")}
        />
        {value && (
            <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#12123f]/50 hover:bg-[#eef0fb] hover:text-[#12123f]">
                <X size={15} />
            </button>
        )}
    </div>
);

/** Renders text with the search terms highlighted. */
export const Hl = ({ text, query }: { text: string; query: string }) => (
    <>
        {highlightParts(text ?? "", query).map((p, i) =>
            p.hit ? (
                <mark key={i} className="rounded bg-[#ff5a0a]/20 px-0.5 text-inherit">
                    {p.t}
                </mark>
            ) : (
                <React.Fragment key={i}>{p.t}</React.Fragment>
            ),
        )}
    </>
);

/* ------------------------------ overlays ------------------------------ */

/** Slide-over panel: full screen on phones, side panel on larger screens. */
export function Sheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    side = "right",
    width = "sm:max-w-[640px]",
    bare = false,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    title: React.ReactNode;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    side?: "right" | "left";
    width?: string;
    /** Skip the header / padding and render children edge to edge (used for the mobile nav drawer). */
    bare?: boolean;
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-[#12123f]/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={cn(
                        "fixed inset-y-0 z-[61] flex w-full flex-col bg-[#f6f7fd] shadow-2xl outline-none duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
                        width,
                        side === "right"
                            ? "right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
                            : "left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                    )}
                >
                    {bare ? (
                        <>
                            <Dialog.Title className="sr-only">{title}</Dialog.Title>
                            <Dialog.Description className="sr-only">Navigation</Dialog.Description>
                            <div className="min-h-0 flex-1">{children}</div>
                        </>
                    ) : (
                    <>
                    <div className="flex items-start justify-between gap-4 border-b border-[#12123f]/8 bg-white px-5 py-4 sm:px-7">
                        <div className="min-w-0">
                            <Dialog.Title className="truncate text-[19px] font-semibold text-[#12123f]">{title}</Dialog.Title>
                            {description ? (
                                <Dialog.Description className="mt-0.5 text-[13px] text-[#12123f]/55">{description}</Dialog.Description>
                            ) : (
                                <Dialog.Description className="sr-only">Panel</Dialog.Description>
                            )}
                        </div>
                        <Dialog.Close className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef0fb] text-[#12123f] hover:bg-[#e0e3f5]" aria-label="Close">
                            <X size={18} />
                        </Dialog.Close>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
                    {footer && <div className="border-t border-[#12123f]/8 bg-white px-5 py-4 sm:px-7">{footer}</div>}
                    </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

/* ------------------------------ pagination ------------------------------ */

export const PAGE_SIZES = [10, 20, 50];

export function usePaged<T>(items: T[], pageSize: number, resetKey: string) {
    const [page, setPage] = React.useState(1);
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    // jump back to page 1 whenever the search / filters / page size change
    React.useEffect(() => setPage(1), [resetKey, pageSize]);
    const safe = Math.min(page, pageCount);
    const slice = React.useMemo(() => items.slice((safe - 1) * pageSize, safe * pageSize), [items, safe, pageSize]);
    return { page: safe, setPage, pageCount, slice, total: items.length };
}

function pageList(page: number, count: number): (number | "…")[] {
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    const out: (number | "…")[] = [1];
    const s = Math.max(2, page - 1);
    const e = Math.min(count - 1, page + 1);
    if (s > 2) out.push("…");
    for (let i = s; i <= e; i++) out.push(i);
    if (e < count - 1) out.push("…");
    out.push(count);
    return out;
}

export function Pagination({
    page,
    pageCount,
    total,
    pageSize,
    onPage,
    onPageSize,
    sizes = PAGE_SIZES,
    noun = "results",
}: {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    onPage: (p: number) => void;
    onPageSize?: (n: number) => void;
    sizes?: number[];
    noun?: string;
}) {
    if (total === 0) return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(total, page * pageSize);
    const nav = "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-35";
    return (
        <div className="flex flex-col items-center gap-3 border-t border-[#12123f]/8 px-4 py-4 sm:flex-row sm:justify-between">
            <p className="text-[13px] text-[#12123f]/60">
                Showing <b className="text-[#12123f]">{from}</b>–<b className="text-[#12123f]">{to}</b> of <b className="text-[#12123f]">{total}</b> {noun}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <button type="button" aria-label="First page" disabled={page === 1} onClick={() => onPage(1)} className={cn(nav, "hover:bg-[#eef0fb]")}>
                    <ChevronsLeft size={16} />
                </button>
                <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)} className={cn(nav, "hover:bg-[#eef0fb]")}>
                    <ChevronLeft size={16} />
                </button>
                {pageList(page, pageCount).map((p, i) =>
                    p === "…" ? (
                        <span key={`e${i}`} className="px-1 text-[#12123f]/40">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            aria-current={p === page}
                            onClick={() => onPage(p)}
                            className={cn(nav, p === page ? "bg-[#12123f] text-white" : "text-[#12123f] hover:bg-[#eef0fb]")}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onPage(page + 1)} className={cn(nav, "hover:bg-[#eef0fb]")}>
                    <ChevronRight size={16} />
                </button>
                <button type="button" aria-label="Last page" disabled={page === pageCount} onClick={() => onPage(pageCount)} className={cn(nav, "hover:bg-[#eef0fb]")}>
                    <ChevronsRight size={16} />
                </button>
            </div>
            {onPageSize && (
                <label className="flex items-center gap-2 text-[13px] text-[#12123f]/60">
                    Per page
                    <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="h-9 rounded-full border border-[#12123f]/12 bg-white px-3 text-[13px] text-[#12123f] outline-none focus:border-[#ff5a0a]">
                        {sizes.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </div>
    );
}

/* ------------------------------ empty / loading ------------------------------ */

export const EmptyState = ({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) => (
    <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eef0fb] text-[#12123f]/40">
            <Inbox size={28} />
        </span>
        <p className="mt-4 text-[16px] font-semibold text-[#12123f]">{title}</p>
        {text && <p className="mt-1 max-w-[340px] text-[14px] text-[#12123f]/55">{text}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export const SkeletonRows = ({ rows = 6 }: { rows?: number }) => (
    <div className="space-y-3 p-5" aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#eef0fb]" style={{ opacity: 1 - i * 0.12 }} />
        ))}
    </div>
);

export const PageTitle = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-medium leading-tight tracking-[-0.03em] text-[#12123f]">{title}</h1>
            {subtitle && <p className="mt-1 text-[14px] text-[#12123f]/55">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);
