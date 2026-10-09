"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import {
    addLights,
    buildContainer,
    buildForklift,
    buildGlobe,
    buildParcel,
    buildPallet,
    buildQuestionMark,
    buildQuote,
    buildStar,
    buildTruck,
    createStage,
} from "@/usercomponents/three/kit";

export type ModelKind = "container" | "parcels" | "truck" | "globe" | "forklift" | "star" | "pallet" | "question" | "quote";

/** Mounts children only while near the viewport, so offscreen WebGL contexts are released. */
export function LazyMount({ children, className = "", rootMargin = "300px" }: { children: React.ReactNode; className?: string; rootMargin?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [rootMargin]);
    return (
        <div ref={ref} className={className}>
            {on ? children : null}
        </div>
    );
}

export function buildModel(kind: ModelKind): { obj: THREE.Object3D; radius: number; rotateSpeed: number } {
    switch (kind) {
        case "container": {
            const g = new THREE.Group();
            const c = buildContainer("orange", true);
            g.add(c);
            return { obj: g, radius: 3.0, rotateSpeed: 14 };
        }
        case "parcels": {
            const g = new THREE.Group();
            const a = buildParcel(1.7, 1.2, 1.3);
            const b = buildParcel(1.5, 1.0, 1.2);
            b.position.set(0.15, 1.1, 0.05);
            b.rotation.y = 0.25;
            const c = buildParcel(1.2, 0.8, 1.0);
            c.position.set(-0.1, 2.0, 0);
            c.rotation.y = -0.2;
            g.add(a, b, c);
            g.position.y = -1;
            const w = new THREE.Group();
            w.add(g);
            return { obj: w, radius: 2.2, rotateSpeed: 18 };
        }
        case "truck": {
            const v = buildTruck();
            v.group.scale.setScalar(0.5);
            v.group.position.y = -0.6;
            const w = new THREE.Group();
            w.add(v.group);
            return { obj: w, radius: 2.7, rotateSpeed: 12 };
        }
        case "forklift": {
            const f = buildForklift();
            f.group.scale.setScalar(1.7);
            f.group.position.set(-0.4, -1.2, 0);
            const p = buildPallet();
            const box = buildParcel(0.8, 0.7, 0.8);
            box.position.set(0, 0.55, 0);
            p.add(box);
            p.position.set(1.5, 0.35, 0);
            f.fork.add(p);
            f.fork.position.y = 0.9;
            const w = new THREE.Group();
            w.add(f.group);
            return { obj: w, radius: 2.6, rotateSpeed: 16 };
        }
        case "pallet": {
            const g = new THREE.Group();
            const p = buildPallet(2, 2);
            g.add(p);
            for (let i = 0; i < 2; i++)
                for (let j = 0; j < 2; j++) {
                    const b = buildParcel(0.9, 0.8, 0.9);
                    b.position.set(-0.5 + i, 0.65, -0.5 + j);
                    g.add(b);
                }
            g.position.y = -0.7;
            const w = new THREE.Group();
            w.add(g);
            return { obj: w, radius: 2.2, rotateSpeed: 16 };
        }
        case "question":
            return { obj: buildQuestionMark(), radius: 2.0, rotateSpeed: 10 };
        case "quote":
            return { obj: buildQuote(), radius: 1.6, rotateSpeed: 10 };
        case "star": {
            const s = buildStar(1.2, 0.35);
            return { obj: s, radius: 1.6, rotateSpeed: 10 };
        }
        case "globe":
        default:
            return { obj: buildGlobe(1.5), radius: 2.4, rotateSpeed: 12 };
    }
}

/** A single slowly-turning, gently floating 3D object on a transparent canvas. */
export default function Model3D({ kind, className = "", tilt = 0.35, spin = true }: { kind: ModelKind; className?: string; tilt?: number; spin?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = ref.current;
        if (!mount) return;
        const stage = createStage(mount, { fov: 30 });
        if (!stage) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        addLights(stage.scene);
        const { obj, radius, rotateSpeed } = buildModel(kind);
        const holder = new THREE.Group();
        holder.add(obj);
        holder.rotation.x = tilt;
        stage.scene.add(holder);

        stage.onResize((w, h) => {
            const cam = stage.camera as THREE.PerspectiveCamera;
            const fit = (radius / Math.min(1, w / h)) * 1.08;
            const dist = (fit / Math.tan((cam.fov * Math.PI) / 360)) * 0.95;
            cam.position.set(0, 0.6, dist);
            cam.lookAt(0, 0, 0);
        });

        const ctx = gsap.context(() => {
            if (reduce) {
                obj.rotation.y = -0.7;
                return;
            }
            if (spin) gsap.fromTo(obj.rotation, { y: -0.8 }, { y: Math.PI * 2 - 0.8, duration: rotateSpeed, ease: "none", repeat: -1 });
            gsap.to(holder.position, { y: 0.18, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
            gsap.from(holder.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.2, ease: "back.out(1.6)" });
        });

        return () => {
            ctx.revert();
            stage.dispose();
        };
    }, [kind, tilt, spin]);

    return <div ref={ref} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
}
