'use client';

import Barcode from 'react-barcode';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import React, { useEffect, useRef, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { getCountryFromAddress } from '@/lib/geocode';
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import {
    ArrowLeft, Box, CalendarClock, Check, Clock, Copy, FileSearch, Globe2, Mail, MapPin, PackageCheck, PackageOpen,
    Phone, Printer, Scale, Search, Share2, Truck, User, Layers, Hash, XCircle, PauseCircle,
} from 'lucide-react';
import Logo from "@/usercomponents/Logo";
import Model3D, { LazyMount } from "@/usercomponents/three/Model3D";
import { useReveal } from "@/usercomponents/home/useReveal";
import { cn } from "@/lib/utils";

const getCourierImage = (courierName?: string) => {
    if (!courierName) return '/images/usps.svg';

    switch (courierName.toLowerCase()) {
        case 'dhl':
            return '/images/dhl.svg';
        case 'fedex':
            return '/images/fedex.svg';
        default:
            return '/images/usps.svg';
    }
};

const STEPS = [
    { label: "Order placed", Icon: PackageOpen },
    { label: "In transit", Icon: Truck },
    { label: "Out for delivery", Icon: MapPin },
    { label: "Delivered", Icon: PackageCheck },
];

const stepFor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
        case 'delivered': return 3;
        case 'in transit': return 1;
        case 'on hold': return 1;
        case 'cancelled': return -1;
        default: return 0;
    }
};

const STATUS_PILL: Record<string, string> = {
    'delivered': 'bg-emerald-400/20 text-emerald-200 ring-emerald-300/30',
    'in transit': 'bg-[#ff5a0a] text-white ring-white/20',
    'on hold': 'bg-amber-300/25 text-amber-100 ring-amber-200/30',
    'cancelled': 'bg-red-400/25 text-red-100 ring-red-300/30',
};

const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-gradient-to-b from-[#eceef9] to-[#eef0fb] font-display text-[#12123f]">
        <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[#ff5a0a]/10 blur-[120px]" />
        <header className="relative z-10 mx-auto flex max-w-[1100px] items-center justify-between px-5 py-6 print:hidden">
            <Link href="/" aria-label="GlobexiaCorp home" className="rounded-full bg-white/90 py-2 pl-3 pr-4 shadow-[0_8px_20px_-12px_rgba(18,18,63,0.5)]">
                <Logo />
            </Link>
            <Link href="/" className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-medium shadow-[0_8px_20px_-12px_rgba(18,18,63,0.5)] transition-transform hover:-translate-y-0.5">
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to site</span><span className="sm:hidden">Home</span>
            </Link>
        </header>
        <main className="relative z-10 mx-auto max-w-[1100px] px-5 pb-20">{children}</main>
    </div>
);

const TrackForm = ({ initial = '', label = 'Track' }: { initial?: string; label?: string }) => {
    const router = useRouter();
    const [v, setV] = useState(initial);
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); if (v.trim()) router.push(`/track/${encodeURIComponent(v.trim())}`); }}
            className="flex w-full max-w-[460px] gap-2 rounded-full bg-white p-2 shadow-[0_18px_40px_-24px_rgba(18,18,63,0.55)]"
        >
            <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Enter tracking number" aria-label="Tracking number" className="min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-[#12123f]/35" />
            <button type="submit" className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-5 py-3 text-[14px] font-semibold text-white"><Search size={16} />{label}</button>
        </form>
    );
};

const Tile = ({ Icon, label, children }: { Icon: React.ComponentType<{ size?: number; className?: string }>; label: string; children: React.ReactNode }) => (
    <div data-reveal className="rounded-[24px] bg-white p-5 shadow-[0_20px_44px_-32px_rgba(18,18,63,0.45)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5a0a]/10 text-[#ff5a0a]"><Icon size={19} /></span>
        <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-[#12123f]/45">{label}</p>
        <div className="mt-0.5 break-words text-[16px] font-medium text-[#12123f]">{children}</div>
    </div>
);

const Party = ({ title, p }: { title: string; p: { name?: string; address?: string; phone?: string; email?: string } }) => (
    <div data-reveal className="rounded-[28px] bg-white p-6 shadow-[0_20px_44px_-32px_rgba(18,18,63,0.45)]">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold"><span className="h-4 w-1 rounded-full bg-[#ff5a0a]" />{title}</h3>
        <ul className="mt-4 space-y-3 text-[14.5px]">
            <li className="flex items-start gap-3"><User size={17} className="mt-0.5 shrink-0 text-[#ff5a0a]" /><span className="font-medium">{p.name || '-'}</span></li>
            <li className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-[#ff5a0a]" /><span className="text-[#12123f]/70">{p.address || '-'}</span></li>
            <li className="flex items-start gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-[#ff5a0a]" /><span className="text-[#12123f]/70">{p.phone || '-'}</span></li>
            <li className="flex items-start gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-[#ff5a0a]" /><span className="break-all text-[#12123f]/70">{p.email || '-'}</span></li>
        </ul>
    </div>
);

const TrackingPage = () => {
    const params = useParams();
    const trackingNumber = decodeURIComponent((params?.trackingNumber as string) || '');

    const [packageData, setPackageData] = useState<DocumentData | null>(null);
    const [carrierName, setCarrierName] = useState<string | null>(null);
    const [originCountry, setOriginCountry] = useState<string | null>(null);
    const [destinationCountry, setDestinationCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    useReveal(root, '[data-reveal]', { stagger: 0.08 });

    useEffect(() => {
        if (!trackingNumber) return;

        const fetchCarrierName = async (carrierId?: string) => {
            if (!carrierId) {
                setCarrierName(' ');
                return;
            }

            try {
                const carrierRef = doc(db, 'couriers', carrierId);
                const carrierSnap = await getDoc(carrierRef);

                if (carrierSnap.exists()) {
                    const carrierData = carrierSnap.data();
                    setCarrierName(carrierData.name || carrierId);
                } else {
                    setCarrierName(carrierId);
                }
            } catch (error) {
                console.error('Error fetching carrier:', error);
                setCarrierName(carrierId);
            }
        };

        const fetchPackage = async () => {
            try {
                const docRef = doc(db, 'packages', trackingNumber);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    console.warn('No such package');
                    return;
                }

                const data = docSnap.data();
                setPackageData(data);

                const [origin, destination] = await Promise.all([
                    getCountryFromAddress(data.senderAddress),
                    getCountryFromAddress(data.receiverAddress),
                ]);

                setOriginCountry(origin);
                setDestinationCountry(destination);
                await fetchCarrierName(data.carrierId);
            } catch (error) {
                console.error('Error fetching package data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [trackingNumber]);

    // animate the progress line once the data is there
    useEffect(() => {
        if (!packageData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-progress]', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'power3.out', delay: 0.5 });
            gsap.from('[data-step]', { scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(2)', delay: 0.3 });
        }, root);
        return () => ctx.revert();
    }, [packageData]);

    if (loading) {
        return (
            <Shell>
                <div className="space-y-4" aria-busy="true" aria-label="Loading shipment">
                    <div className="h-[260px] animate-pulse rounded-[36px] bg-white/70" />
                    <div className="h-[150px] animate-pulse rounded-[28px] bg-white/70" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[130px] animate-pulse rounded-[24px] bg-white/70" />)}
                    </div>
                </div>
            </Shell>
        );
    }

    if (!packageData) {
        return (
            <Shell>
                <div className="relative mx-auto mt-6 flex max-w-[640px] flex-col items-center overflow-hidden rounded-[40px] bg-white px-6 py-12 text-center shadow-[0_30px_60px_-36px_rgba(18,18,63,0.5)]">
                    <div className="relative h-[190px] w-[190px]">
                        <LazyMount className="absolute inset-0"><Model3D kind="question" tilt={0.15} /></LazyMount>
                    </div>
                    <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.03em]">We couldn&apos;t find that package</h1>
                    <p className="mt-2 max-w-[400px] text-[15px] text-[#12123f]/60">
                        Nothing matches <b className="break-all text-[#12123f]">{trackingNumber || 'that number'}</b>. Check the tracking number for typos and try again.
                    </p>
                    <div className="mt-7 flex w-full justify-center"><TrackForm initial={trackingNumber} /></div>
                </div>
            </Shell>
        );
    }

    const status = (packageData.status || '').toLowerCase();
    const step = stepFor(status);
    const cancelled = status === 'cancelled';
    const onHold = status === 'on hold';
    const pill = STATUS_PILL[status] || 'bg-white/15 text-white ring-white/20';
    const progressPct = cancelled ? 0 : (step / (STEPS.length - 1)) * 100;
    const tn = packageData.trackingNumber || trackingNumber;

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* clipboard unavailable */ }
    };
    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: `Track ${tn}`, url }); return; } catch { /* cancelled */ }
        }
        copy(url);
    };

    return (
        <Shell>
            <div ref={root} className="space-y-4">
                {/* hero */}
                <section data-reveal className="relative overflow-hidden rounded-[36px] bg-[#12123f] p-6 text-white shadow-[0_40px_70px_-40px_rgba(18,18,63,0.9)] sm:p-9">
                    <div className="pointer-events-none absolute -left-20 -top-24 h-[340px] w-[340px] rounded-full bg-[#ff5a0a]/35 blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-28 right-10 h-[300px] w-[300px] rounded-full bg-[#4b52ff]/30 blur-[110px]" />
                    <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
                        <div className="min-w-0">
                            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#ff8a3d]">Shipment tracking</p>
                            <h1 className="mt-2 break-all text-[clamp(1.5rem,3.6vw,2.6rem)] font-medium leading-tight tracking-[-0.03em]">{tn}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold ring-1', pill)}>
                                    {cancelled ? <XCircle size={16} /> : onHold ? <PauseCircle size={16} /> : status === 'delivered' ? <Check size={16} /> : <span className="h-2 w-2 animate-pulse rounded-full bg-white" />}
                                    {packageData.status ? packageData.status.replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Unknown'}
                                </span>
                                <button type="button" onClick={() => copy(tn)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium hover:bg-white/20 print:hidden">
                                    {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy number'}
                                </button>
                            </div>
                            <div className="mt-5 max-w-full overflow-x-auto rounded-2xl bg-white p-3 text-[#12123f]">
                                <div className="mx-auto w-fit"><Barcode value={trackingNumber} height={54} width={1.7} fontSize={13} background="#ffffff" lineColor="#12123f" /></div>
                            </div>
                        </div>
                        <div className="relative hidden h-[260px] md:block print:hidden">
                            <LazyMount className="absolute inset-0"><Model3D kind="parcels" tilt={0.25} /></LazyMount>
                        </div>
                    </div>
                </section>

                {/* progress */}
                <section data-reveal className="rounded-[32px] bg-white p-6 shadow-[0_24px_50px_-34px_rgba(18,18,63,0.5)] sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-[18px] font-semibold">Delivery progress</h2>
                        <p className="flex items-center gap-2 text-[14px] text-[#12123f]/60"><CalendarClock size={16} className="text-[#ff5a0a]" />Expected {packageData.expectedDeliveryDate || '-'}</p>
                    </div>
                    {cancelled ? (
                        <p className="mt-5 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-[15px] font-medium text-red-700"><XCircle size={20} />This shipment was cancelled.</p>
                    ) : (
                        <>
                            <div className="relative mx-3 mt-9 sm:mx-6">
                                <div className="absolute left-0 right-0 top-6 h-1.5 -translate-y-1/2 rounded-full bg-[#eef0fb]" />
                                <div data-progress className={cn('absolute left-0 top-6 h-1.5 -translate-y-1/2 rounded-full', onHold ? 'bg-amber-400' : 'bg-gradient-to-r from-[#ff8a3d] to-[#ff4d00]')} style={{ width: `${progressPct}%` }} />
                                <ol className="relative grid grid-cols-4">
                                    {STEPS.map(({ label, Icon }, i) => {
                                        const done = i <= step;
                                        const current = i === step;
                                        return (
                                            <li key={label} data-step className="flex flex-col items-center gap-2 text-center">
                                                <span className={cn('relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white transition-colors', done ? (onHold && current ? 'bg-amber-400 text-white' : 'bg-[#ff5a0a] text-white') : 'bg-[#eef0fb] text-[#12123f]/35')}>
                                                    {current && status !== 'delivered' && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-40', onHold ? 'bg-amber-400' : 'bg-[#ff5a0a]')} />}
                                                    {done && !current ? <Check size={20} /> : <Icon size={20} />}
                                                </span>
                                                <span className={cn('text-[12px] font-medium sm:text-[13px]', done ? 'text-[#12123f]' : 'text-[#12123f]/40')}>{label}</span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                            {onHold && <p className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[14px] text-amber-800"><PauseCircle size={18} />This shipment is currently on hold.</p>}
                        </>
                    )}
                </section>

                {/* journey */}
                <section data-reveal className="rounded-[32px] bg-white p-6 shadow-[0_24px_50px_-34px_rgba(18,18,63,0.5)] sm:p-8">
                    <h2 className="text-[18px] font-semibold">Journey</h2>
                    <div className="mt-6 grid items-center gap-4 sm:grid-cols-[1fr_1.3fr_1fr]">
                        <div>
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12123f]/45">Origin</p>
                            <p className="mt-1 text-[22px] font-medium leading-tight">{originCountry || 'Unknown'}</p>
                            <p className="text-[13px] text-[#12123f]/55">{packageData.packageOrigin}</p>
                        </div>
                        <div className="relative my-2 h-12 sm:my-0">
                            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-[#12123f]/20" />
                            <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#12123f]" />
                            <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ff5a0a]" />
                            <span className="absolute top-1/2 -translate-y-1/2 text-[#ff5a0a] animate-[track-drive_5s_ease-in-out_infinite]"><Truck size={26} /></span>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12123f]/45">Destination</p>
                            <p className="mt-1 text-[22px] font-medium leading-tight">{destinationCountry || 'Unknown'}</p>
                            <p className="text-[13px] text-[#12123f]/55">{packageData.destination}</p>
                        </div>
                    </div>
                </section>

                {/* details */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Tile Icon={Truck} label="Carrier">
                        <span className="flex items-center gap-2">
                            <Image src={getCourierImage(carrierName || undefined)} alt="" width={28} height={28} className="rounded-full" />
                            {carrierName?.trim() || 'Unknown'}
                        </span>
                    </Tile>
                    <Tile Icon={Globe2} label="Shipment type">{packageData.deliveryType || '-'}</Tile>
                    <Tile Icon={Layers} label="Mode">{packageData.transportMode || '-'}</Tile>
                    <Tile Icon={Scale} label="Weight">{packageData.weightKg} kg</Tile>
                    <Tile Icon={Box} label="Quantity">{packageData.quantity}</Tile>
                    <Tile Icon={CalendarClock} label="Expected delivery">{packageData.expectedDeliveryDate || '-'}</Tile>
                    <Tile Icon={Clock} label="Departure time">{packageData.departureTime || '-'}</Tile>
                    <Tile Icon={Hash} label="Carrier reference"><span className="break-all text-[14px]">{packageData.trackingNumber}</span></Tile>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Party title="Shipper information" p={{ name: packageData.senderName, address: packageData.senderAddress, phone: packageData.senderPhone, email: packageData.senderEmail }} />
                    <Party title="Receiver information" p={{ name: packageData.receiverName, address: packageData.receiverAddress, phone: packageData.receiverPhone, email: packageData.receiverEmail }} />
                </div>

                {packageData.comment && (
                    <section data-reveal className="rounded-[28px] bg-white p-6 shadow-[0_20px_44px_-32px_rgba(18,18,63,0.45)]">
                        <h3 className="flex items-center gap-2 text-[15px] font-semibold"><span className="h-4 w-1 rounded-full bg-[#ff5a0a]" />Note from the carrier</h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-[#12123f]/75">{packageData.comment}</p>
                    </section>
                )}

                <div data-reveal className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium shadow-[0_12px_26px_-16px_rgba(18,18,63,0.55)] transition-transform hover:-translate-y-0.5"><Printer size={16} />Print</button>
                    <button type="button" onClick={share} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium shadow-[0_12px_26px_-16px_rgba(18,18,63,0.55)] transition-transform hover:-translate-y-0.5"><Share2 size={16} />Share</button>
                    <Link href="/" className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(255,90,10,0.85)] transition-transform hover:-translate-y-0.5"><FileSearch size={16} />Track another</Link>
                </div>
            </div>
        </Shell>
    );
};

export default TrackingPage;
