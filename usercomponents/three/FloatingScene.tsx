"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { addLights, createStage } from "@/usercomponents/three/kit";
import { ModelKind, buildModel } from "@/usercomponents/three/Model3D";

export type FloatItem = {
    kind: ModelKind;
    /** x/y in -1..1 of the visible area, z depth (negative = further away) */
    at: [number, number, number];
    scale?: number;
    speed?: number;
};

/**
 * Backdrop of slowly drifting 3D objects. Purely decorative and never interactive;
 * objects also lean slightly towards the pointer for a bit of depth.
 */
export default function FloatingScene({ items, className = "" }: { items: FloatItem[]; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = ref.current;
        if (!mount) return;
        const stage = createStage(mount, { fov: 34 });
        if (!stage) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const cam = stage.camera as THREE.PerspectiveCamera;
        addLights(stage.scene);
        cam.position.set(0, 0, 16);

        const holders: { g: THREE.Group; base: THREE.Vector3; item: FloatItem }[] = [];
        items.forEach((it) => {
            const { obj, radius } = buildModel(it.kind);
            const g = new THREE.Group();
            obj.scale.setScalar(((it.scale ?? 1) / radius) * 1.0);
            g.add(obj);
            stage.scene.add(g);
            holders.push({ g, base: new THREE.Vector3(...it.at), item: it });
        });

        let halfW = 8;
        let halfH = 5;
        stage.onResize((w, h) => {
            halfH = Math.tan((cam.fov * Math.PI) / 360) * 16;
            halfW = halfH * (w / h);
            holders.forEach(({ g, base }) => g.position.set(base.x * halfW, base.y * halfH, base.z));
        });

        const ctx = gsap.context(() => {
            holders.forEach(({ g, item }, i) => {
                const sp = item.speed ?? 1;
                g.rotation.set(0.3, i, 0);
                if (reduce) return;
                gsap.to(g.rotation, { y: `+=${Math.PI * 2}`, duration: 16 / sp + i, ease: "none", repeat: -1 });
                gsap.to(g.rotation, { x: 0.6, duration: 4 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
                gsap.from(g.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.2, delay: 0.15 * i, ease: "back.out(1.7)" });
            });
        });

        // bob + parallax in the render loop so resize never fights the tweens
        const pointer = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
            pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
            pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("pointermove", onMove);
        stage.onFrame((_dt, t) => {
            holders.forEach(({ g, base, item }, i) => {
                const sp = item.speed ?? 1;
                const depth = 0.4 + (base.z + 10) * 0.05;
                g.position.x = base.x * halfW - pointer.x * depth;
                g.position.y = base.y * halfH + Math.sin(t * 0.7 * sp + i * 1.7) * 0.35 + pointer.y * depth * 0.6;
            });
        });

        return () => {
            window.removeEventListener("pointermove", onMove);
            ctx.revert();
            stage.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true" />;
}
