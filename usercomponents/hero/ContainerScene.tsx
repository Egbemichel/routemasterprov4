"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";

/* Container dimensions (world units) */
const L = 6;
const H = 1.3;
const W = 1.25;
const YAW = -0.62;

function hexPath(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        if (i) g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        else g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath();
}

/** Corrugated side wall (colour map or bump map) with the brand mark on the colour map. */
function makeSideTexture(label: string, bump = false) {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 220;
    const g = c.getContext("2d")!;
    const ridge = (x: number, stops: [string, string]) => {
        const grad = g.createLinearGradient(x, 0, x + 16, 0);
        grad.addColorStop(0, stops[0]);
        grad.addColorStop(0.5, stops[1]);
        grad.addColorStop(1, stops[0]);
        g.fillStyle = grad;
        g.fillRect(x, 0, 16, c.height);
    };
    if (bump) {
        g.fillStyle = "#808080";
        g.fillRect(0, 0, c.width, c.height);
        for (let x = 0; x < c.width; x += 16) ridge(x, ["#202020", "#f0f0f0"]);
    } else {
        g.fillStyle = "#ff6a14";
        g.fillRect(0, 0, c.width, c.height);
        for (let x = 0; x < c.width; x += 16) ridge(x, ["rgba(120,30,0,0.35)", "rgba(255,170,90,0.25)"]);
        for (let i = 0; i < 40; i++) {
            g.fillStyle = `rgba(90,25,0,${Math.random() * 0.07})`;
            g.fillRect(Math.random() * c.width, 0, 2 + Math.random() * 6, c.height);
        }
        g.font = "700 92px Arial, Helvetica, sans-serif";
        g.textAlign = "left";
        g.textBaseline = "middle";
        const tw = g.measureText(label).width;
        const total = 100 + tw;
        const x0 = (c.width - total) / 2;
        const cy = c.height / 2;
        g.fillStyle = "rgba(255,255,255,0.96)";
        hexPath(g, x0 + 44, cy, 44);
        g.fill();
        g.fillStyle = "#e84800";
        hexPath(g, x0 + 44, cy, 20);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.96)";
        g.fillText(label, x0 + 100, cy + 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = bump ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
}

function buildContainer(lightness: number, sideMap: THREE.Texture, bumpMap: THREE.Texture) {
    const group = new THREE.Group();
    const orange = new THREE.Color().setHSL(0.045, 1, lightness);

    const wall = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: sideMap,
        bumpMap,
        bumpScale: 2.2,
        roughness: 0.45,
        metalness: 0.3,
    });
    const plain = new THREE.MeshStandardMaterial({ color: orange, roughness: 0.5, metalness: 0.3 });
    const frameMat = new THREE.MeshStandardMaterial({
        color: orange.clone().multiplyScalar(0.8),
        roughness: 0.4,
        metalness: 0.6,
    });
    const steel = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.35, metalness: 0.9 });

    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    group.add(new THREE.Mesh(new THREE.BoxGeometry(L - 0.06, H - 0.06, W - 0.06), [plain, plain, plain, plain, wall, wall]));

    const t = 0.07;
    const beam = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), frameMat);
        m.position.set(x, y, z);
        group.add(m);
    };
    for (const y of [-1, 1]) {
        for (const z of [-1, 1]) beam(L, t, t, 0, (y * H) / 2, (z * W) / 2);
        for (const x of [-1, 1]) beam(t, t, W, (x * L) / 2, (y * H) / 2, 0);
    }
    for (const x of [-1, 1]) for (const z of [-1, 1]) beam(t, H, t, (x * L) / 2, 0, (z * W) / 2);

    for (const x of [-1, 1])
        for (const y of [-1, 1])
            for (const z of [-1, 1]) {
                const cc = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), steel);
                cc.position.set((x * L) / 2, (y * H) / 2, (z * W) / 2);
                group.add(cc);
            }

    for (const x of [-1, 1]) {
        for (const dz of [-0.4, -0.2, 0.2, 0.4]) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, H - 0.12, 8), steel);
            bar.position.set((x * L) / 2 + x * 0.025, 0, dz * W);
            group.add(bar);
        }
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, H - 0.1, 0.012), frameMat);
        seam.position.set((x * L) / 2 + x * 0.02, 0, 0);
        group.add(seam);
    }
    return group;
}

function cable(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, r: number) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return m;
}

export default function ContainerScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            return; // no WebGL: the hero still reads fine without the 3D backdrop
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(-4, 8, 6);
        scene.add(key, new THREE.AmbientLight(0xdfe3ff, 0.55));

        const sideMap = makeSideTexture("GlobexiaCorp");
        const bumpMap = makeSideTexture("", true);

        /* ---- Rig ----
           `pivot` is the crane hook, high above the frame. Everything hangs below it, so
           rotating the pivot swings the whole load like a pendulum. */
        const HANG = 9;
        const pivot = new THREE.Group();
        pivot.position.set(0, HANG + 1.4, 0);
        scene.add(pivot);

        const hang = new THREE.Group();
        hang.position.y = -HANG;
        pivot.add(hang);

        const stack = new THREE.Group();
        stack.position.y = -H * 1.55;
        stack.rotation.y = YAW;
        hang.add(stack);
        [
            { y: H, ry: 0, rz: 0, x: 0, l: 0.5 },
            { y: 0, ry: 0.07, rz: 0.012, x: 0.18, l: 0.46 },
            { y: -H, ry: -0.05, rz: -0.01, x: -0.12, l: 0.43 },
        ].forEach((p) => {
            const c = buildContainer(p.l, sideMap, bumpMap);
            c.position.set(p.x, p.y, 0);
            c.rotation.set(0, p.ry, p.rz);
            stack.add(c);
        });

        // Harness: spreader bar + 4 slings meeting at the hook block, main line going up
        const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.5, metalness: 0.8 });
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x1b1b2e, roughness: 0.6, metalness: 0.5 });
        const topY = -H * 0.05; // roof of the highest container, in hang space
        const hookY = topY + 2.4;
        const harness = new THREE.Group();
        harness.rotation.y = YAW;
        const spreader = new THREE.Mesh(new THREE.BoxGeometry(L * 0.92, 0.1, 0.2), darkSteel);
        spreader.position.y = topY + 0.08;
        harness.add(spreader);
        for (const sx of [-1, 1])
            for (const sz of [-1, 1])
                harness.add(
                    cable(
                        new THREE.Vector3(sx * L * 0.45, topY + 0.12, sz * W * 0.42),
                        new THREE.Vector3(0, hookY, 0),
                        cableMat,
                        0.014,
                    ),
                );
        const hookBlock = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.3, 0.26),
            new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4, metalness: 0.6 }),
        );
        hookBlock.position.set(0, hookY + 0.15, 0);
        const mainLine = cable(new THREE.Vector3(0, hookY + 0.3, 0), new THREE.Vector3(0, HANG + 8, 0), cableMat, 0.02);
        hang.add(harness, hookBlock, mainLine);

        /* ---- Layout / camera ---- */
        let aspect = 1;
        let halfW = 5;
        const layout = () => {
            const w = mount.clientWidth || 1;
            const h = mount.clientHeight || 1;
            aspect = w / h;
            renderer.setSize(w, h, false);
            camera.aspect = aspect;
            const dist = aspect > 1.5 ? 16 : 16 + (1.5 - aspect) * 10; // portrait: pull back so the load fits
            camera.position.set(0, 1.4, dist);
            camera.lookAt(0, 0.6, 0);
            camera.updateProjectionMatrix();
            halfW = Math.tan((camera.fov * Math.PI) / 360) * dist * aspect;
        };
        layout();
        const ro = new ResizeObserver(layout);
        ro.observe(mount);

        /* ---- Motion (GSAP) ----
           A conical pendulum: GSAP drives `phase` round a full circle forever, and the load
           traces a circle that sweeps from the left edge to the middle of the hero and back.
           A second tween "breathes" the amplitude so the loop never looks mechanical. */
        const state = { phase: Math.PI, breathe: 0 };
        const ctx = gsap.context(() => {
            if (reduce) {
                state.phase = Math.PI * 0.75;
                return;
            }
            gsap.to(state, { phase: Math.PI * 3, duration: 10, ease: "none", repeat: -1 });
            gsap.to(state, { breathe: 1, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
            gsap.from(hang.position, { y: -HANG + 8, duration: 2.4, ease: "power3.out", delay: 0.2 });
            gsap.from(mount, { opacity: 0, duration: 1.2 });
        });

        const clock = new THREE.Clock();
        let visible = true;
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!visible) return;
            const t = clock.getElapsedTime();
            const amp = 0.24 * halfW * (0.8 + 0.2 * state.breathe); // world-units radius of the circle
            const cx = -0.3 * halfW; // circle centre: left of middle, so it travels left -> middle
            pivot.position.x = cx;
            const a = amp / HANG;
            pivot.rotation.z = -a * Math.cos(state.phase);
            pivot.rotation.x = a * 0.6 * Math.sin(state.phase);
            stack.rotation.y = harness.rotation.y = YAW + Math.sin(t * 0.7) * 0.04 + Math.sin(state.phase) * 0.05;
            renderer.render(scene, camera);
        };
        tick();

        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(mount);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            ctx.revert();
            gsap.killTweensOf(state);
            scene.traverse((o) => {
                const m = o as THREE.Mesh;
                m.geometry?.dispose();
                const mat = m.material as THREE.Material | THREE.Material[] | undefined;
                if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
                else mat?.dispose();
            });
            sideMap.dispose();
            bumpMap.dispose();
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
