'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { AlertCircle, Loader2, PackageSearch, Search } from "lucide-react";
import { db } from "@/lib/firebaseClient";

interface Props {
    trigger: React.ReactNode;
}

export default function TrackingDialog({ trigger }: Props) {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tn = trackingNumber.trim();
        if (!tn) {
            setError("Please enter your tracking number.");
            return;
        }
        setError("");
        setChecking(true);
        try {
            // make sure the number exists before sending the visitor to the tracking page
            const candidates = Array.from(new Set([tn, tn.toUpperCase()]));
            let found: string | null = null;
            for (const c of candidates) {
                const snap = await getDoc(doc(db, "packages", c));
                if (snap.exists()) {
                    found = c;
                    break;
                }
            }
            if (!found) {
                setError("We couldn't find a package with that tracking number. Please check it and try again.");
                return;
            }
            router.push(`/track/${encodeURIComponent(found)}`);
            setOpen(false);
        } catch (err) {
            console.error("Tracking lookup failed:", err);
            // let the tracking page try (and show its own not-found state) if the pre-check could not run
            router.push(`/track/${encodeURIComponent(tn)}`);
            setOpen(false);
        } finally {
            setChecking(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setError(""); } }}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="overflow-hidden rounded-[32px] border-0 bg-white p-0 font-display sm:max-w-[460px]">
                <div className="relative bg-[#12123f] px-7 pb-8 pt-9 text-white">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#ff5a0a]/45 blur-[60px]" />
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#ff4d00] shadow-[0_14px_28px_-12px_rgba(255,90,10,0.9)]">
                        <PackageSearch size={28} />
                    </span>
                    <DialogTitle className="relative mt-5 text-[26px] font-medium tracking-[-0.03em] text-white">Track Your Package</DialogTitle>
                    <DialogDescription className="relative mt-1 text-[14px] text-white/65">
                        Enter your tracking number to check delivery status.
                    </DialogDescription>
                </div>
                <form onSubmit={handleSubmit} className="px-7 pb-7 pt-6">
                    <label className="block">
                        <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-[#12123f]/50">Tracking number</span>
                        <input
                            value={trackingNumber}
                            onChange={(e) => { setTrackingNumber(e.target.value); if (error) setError(""); }}
                            placeholder="e.g. RM123456789012-SHIP"
                            autoFocus
                            aria-invalid={!!error}
                            className={`h-14 w-full rounded-2xl border bg-white px-5 text-[16px] text-[#12123f] outline-none transition-all placeholder:text-[#12123f]/30 focus:ring-4 ${error ? "border-red-400 focus:ring-red-200" : "border-[#12123f]/15 focus:border-[#ff5a0a] focus:ring-[#ff5a0a]/15"}`}
                        />
                    </label>
                    {error && (
                        <p role="alert" className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[13.5px] text-red-600">
                            <AlertCircle size={17} className="mt-0.5 shrink-0" />
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={checking}
                        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] text-[16px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,90,10,0.85)] transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                    >
                        {checking ? <Loader2 size={20} className="animate-spin" /> : <Search size={19} />}
                        {checking ? "Checking…" : "Track"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
