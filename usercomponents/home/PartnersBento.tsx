"use client";

import React, { useRef } from "react";
import Model3D, { LazyMount, ModelKind } from "@/usercomponents/three/Model3D";
import { BrandTile, PARTNERS } from "@/usercomponents/home/PartnerLogos";
import SectionHeading, { Hl } from "@/usercomponents/home/SectionHeading";
import { useReveal } from "@/usercomponents/home/useReveal";

const partner = (key: string) => PARTNERS.find((p) => p.key === key)!;

type Tile =
    | { id: string; cls: string; kind: "logo"; partner: string }
    | { id: string; cls: string; kind: "model"; model: ModelKind; bg: string; tilt?: number; caption?: string }
    | { id: string; cls: string; kind: "brand" };

/* 6-col bento (desktop). Spans are tuned so the grid is gap-free. */
const TILES: Tile[] = [
    { id: "container", cls: "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2", kind: "model", model: "container", bg: "bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00]", tilt: 0.22 },
    { id: "golden", cls: "col-span-2 lg:col-span-2", kind: "logo", partner: "golden" },
    { id: "truck", cls: "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2", kind: "model", model: "truck", bg: "bg-gradient-to-b from-[#e8eaf3] to-[#cfd3e6]", tilt: 0.12 },
    { id: "gls", cls: "col-span-1 lg:col-span-1", kind: "logo", partner: "gls" },
    { id: "carga", cls: "col-span-1 lg:col-span-1", kind: "logo", partner: "carga" },
    { id: "ilg", cls: "col-span-1 lg:col-span-2", kind: "logo", partner: "ilg" },
    { id: "parcels", cls: "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2", kind: "model", model: "parcels", bg: "bg-gradient-to-b from-[#dfe3f7] to-[#c5cbea]", tilt: 0.3 },
    { id: "ultra", cls: "col-span-1 lg:col-span-2", kind: "logo", partner: "ultra" },
    { id: "globe", cls: "col-span-1 lg:col-span-1", kind: "model", model: "globe", bg: "bg-gradient-to-br from-[#12123f] to-[#262a78]", tilt: 0.3 },
    { id: "brand", cls: "col-span-1 lg:col-span-1", kind: "brand" },
    { id: "poly", cls: "col-span-1 lg:col-span-1", kind: "logo", partner: "poly" },
    { id: "dynamic", cls: "col-span-1 lg:col-span-1", kind: "logo", partner: "dynamic" },
];

const shell = "relative overflow-hidden rounded-[26px]";

export default function PartnersBento() {
    const ref = useRef<HTMLElement>(null);
    useReveal(ref, "[data-tile]", { stagger: { each: 0.06, from: "random" }, duration: 0.8 });

    return (
        <section ref={ref} className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
            <SectionHeading eyebrow="Partners">
                Our <Hl>Trusted</Hl> Partners
            </SectionHeading>

            <div className="mt-12 grid grid-flow-dense auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[140px] md:gap-4 lg:auto-rows-[170px] lg:grid-cols-6">
                {TILES.map((t) => {
                    if (t.kind === "logo") {
                        const { Logo, name } = partner(t.partner);
                        return (
                            <div
                                key={t.id}
                                data-tile
                                data-reveal
                                className={`${shell} group flex items-center justify-center bg-white p-4 shadow-[0_18px_40px_-28px_rgba(18,18,63,0.45)] transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-24px_rgba(255,90,10,0.4)] ${t.cls}`}
                            >
                                <Logo className="h-full w-full max-h-[110px] transition-transform duration-500 group-hover:scale-105" />
                                <span className="sr-only">{name}</span>
                            </div>
                        );
                    }
                    if (t.kind === "brand") {
                        return (
                            <div
                                key={t.id}
                                data-tile
                                data-reveal
                                className={`${shell} flex items-center justify-center bg-white p-4 shadow-[0_18px_40px_-28px_rgba(18,18,63,0.45)] ${t.cls}`}
                            >
                                <BrandTile className="h-full w-full" />
                            </div>
                        );
                    }
                    return (
                        <div key={t.id} data-tile data-reveal className={`${shell} ${t.bg} ${t.cls}`}>
                            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                            <LazyMount className="absolute inset-0">
                                <Model3D kind={t.model} tilt={t.tilt} />
                            </LazyMount>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
