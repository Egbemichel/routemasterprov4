"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";

/** One wheel revolution = 2*PI*R of ground. The road tile is exactly two revolutions long,
 *  so a seamless 2-turn wheel spin and a 1-tile texture scroll stay perfectly in sync. */
const R = 0.52;
const TILE = 2 * Math.PI * R * 2;

function roadTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#3b3d4d";
    g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.06})`;
        g.fillRect(Math.random() * 1024, Math.random() * 256, 2, 2);
    }
    g.fillStyle = "#f4f5fb"; // edge lines
    g.fillRect(0, 10, 1024, 8);
    g.fillRect(0, 238, 1024, 8);
    g.fillStyle = "#ffb12b"; // dashed centre line
    g.fillRect(100, 122, 360, 12);
    g.fillRect(612, 122, 360, 12);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
}

/** Roadside barrier wall with repeating panels + lamp posts, tiles seamlessly. */
function wallTexture() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#d6d9ee");
    grad.addColorStop(1, "#b9bedc");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "rgba(18,18,63,0.12)";
    for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 4, 128);
    g.fillStyle = "#12123f"; // lamp post
    g.fillRect(250, 8, 6, 120);
    g.fillRect(250, 8, 40, 6);
    g.fillStyle = "#ff7a1a";
    g.fillRect(282, 14, 12, 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
}

function logoTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 400;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ff6a14";
    g.fillRect(0, 0, 1024, 400);
    for (let x = 0; x < 1024; x += 16) {
        const gr = g.createLinearGradient(x, 0, x + 16, 0);
        gr.addColorStop(0, "rgba(120,30,0,0.3)");
        gr.addColorStop(0.5, "rgba(255,170,90,0.22)");
        gr.addColorStop(1, "rgba(120,30,0,0.3)");
        g.fillStyle = gr;
        g.fillRect(x, 0, 16, 400);
    }
    g.font = "700 120px Arial, Helvetica, sans-serif";
    g.textBaseline = "middle";
    const label = "GlobexiaCorp";
    const tw = g.measureText(label).width;
    const x0 = (1024 - (120 + tw)) / 2;
    g.fillStyle = "#fff";
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        g[i ? "lineTo" : "moveTo"](x0 + 56 + Math.cos(a) * 56, 200 + Math.sin(a) * 56);
    }
    g.fill();
    g.fillStyle = "#e84800";
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        g[i ? "lineTo" : "moveTo"](x0 + 56 + Math.cos(a) * 26, 200 + Math.sin(a) * 26);
    }
    g.fill();
    g.fillStyle = "#fff";
    g.fillText(label, x0 + 130, 206);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
}

export default function TruckRoadScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
        renderer.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(-3, 6, 8);
        scene.add(sun, new THREE.AmbientLight(0xdfe3ff, 0.5));

        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

        /* ---- world: road + back wall ---- */
        const roadTex = roadTexture();
        const wallTex = wallTexture();
        const SPAN = TILE * 4;
        roadTex.repeat.set(4, 1);
        const road = new THREE.Mesh(new THREE.PlaneGeometry(SPAN, 3.2), new THREE.MeshBasicMaterial({ map: roadTex }));
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0, 0.9);
        scene.add(road);

        // wall panel repeats every TILE/2, so scrolling one tile = half the ground speed
        wallTex.repeat.set(8, 1);
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(SPAN, 1.5),
            new THREE.MeshBasicMaterial({ map: wallTex }),
        );
        wall.position.set(0, 0.75, -1.3);
        scene.add(wall);
        const verge = new THREE.Mesh(
            new THREE.PlaneGeometry(SPAN, 1.2),
            new THREE.MeshBasicMaterial({ color: 0xc6cae6 }),
        );
        verge.rotation.x = -Math.PI / 2;
        verge.position.set(0, 0.001, -0.7);
        scene.add(verge);

        /* ---- truck (faces +x) ---- */
        const truck = new THREE.Group();
        truck.position.z = 0.9;
        scene.add(truck);

        const body = new THREE.Group();
        truck.add(body);
        const orange = new THREE.MeshStandardMaterial({ color: 0xff5a0a, roughness: 0.4, metalness: 0.35 });
        const white = new THREE.MeshStandardMaterial({ color: 0xf6f6fb, roughness: 0.35, metalness: 0.2 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b2e, roughness: 0.6, metalness: 0.6 });
        const glass = new THREE.MeshStandardMaterial({ color: 0x5fb6d9, roughness: 0.1, metalness: 0.7 });
        const steel = new THREE.MeshStandardMaterial({ color: 0xb4b8c8, roughness: 0.3, metalness: 0.9 });

        const logoTex = logoTexture();
        const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, roughness: 0.45, metalness: 0.3 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.5, 2.1), [orange, orange, orange, orange, logoMat, logoMat]);
        box.position.set(-1.1, 1.95, 0);
        body.add(box);

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(8, 0.28, 1.5), dark);
        chassis.position.set(0.2, 0.62, 0);
        body.add(chassis);

        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 2.0), white);
        cab.position.set(2.55, 1.6, 0);
        body.add(cab);
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 2.0), orange);
        hood.position.set(3.7, 1.15, 0);
        body.add(hood);
        for (const z of [-1, 1]) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.02), glass);
            win.position.set(2.6, 2.0, z * 1.01);
            body.add(win);
            const light = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
            light.position.set(4.06, 1.0, z * 0.7);
            body.add(light);
        }
        const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 2.1), steel);
        bumper.position.set(4.0, 0.55, 0);
        body.add(bumper);

        // wheels (rotate about z, stay on the ground while the body bobs)
        const wheels: THREE.Group[] = [];
        const tyre = new THREE.CylinderGeometry(R, R, 0.42, 24);
        const hub = new THREE.CylinderGeometry(0.26, 0.26, 0.44, 12);
        const bolt = new THREE.BoxGeometry(0.07, 0.07, 0.46);
        for (const x of [3.3, 1.7, -2.4, -3.6])
            for (const z of [-0.95, 0.95]) {
                const w = new THREE.Group();
                const t = new THREE.Mesh(tyre, dark);
                t.rotation.x = Math.PI / 2;
                const h = new THREE.Mesh(hub, steel);
                h.rotation.x = Math.PI / 2;
                w.add(t, h);
                const b = new THREE.Mesh(bolt, orange); // visible spoke so the spin reads
                b.position.y = 0.18;
                const b2 = b.clone();
                b2.position.y = -0.18;
                w.add(b, b2);
                w.position.set(x, R, z);
                truck.add(w);
                wheels.push(w);
            }
        // shadow
        const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(9, 2.6),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, 0.01, 0);
        truck.add(shadow);

        truck.position.x = -0.3;
        scene.add(truck);

        /* ---- layout ---- */
        const layout = () => {
            const w = mount.clientWidth || 1;
            const h = mount.clientHeight || 1;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            const dist = 21.5 / (w / h);
            camera.position.set(3.5, 3.4, dist);
            camera.lookAt(-0.2, 1.75, 0.5);
            camera.updateProjectionMatrix();
        };
        layout();
        const ro = new ResizeObserver(layout);
        ro.observe(mount);

        /* ---- motion (GSAP, infinite) ---- */
        const ctx = gsap.context(() => {
            if (reduce) return;
            // ground slides under the truck; wheels spin exactly 2 turns per tile
            gsap.to(roadTex.offset, { x: 1, duration: 1.1, ease: "none", repeat: -1 });
            gsap.to(wallTex.offset, { x: 1, duration: 1.1, ease: "none", repeat: -1 }); // one wall panel = half a ground tile, so it moves at half speed (parallax)
            wheels.forEach((w) => gsap.to(w.rotation, { z: -Math.PI * 4, duration: 1.1, ease: "none", repeat: -1 }));
            // suspension bob + gentle pitch
            gsap.to(body.position, { y: 0.07, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: -1 });
            gsap.to(body.rotation, { z: 0.01, duration: 0.31, ease: "sine.inOut", yoyo: true, repeat: -1 });
            gsap.from(truck.position, { x: -9, duration: 1.6, ease: "power3.out" });
        });

        let visible = true;
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (visible) renderer.render(scene, camera);
        };
        tick();
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(mount);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            ctx.revert();
            gsap.killTweensOf([roadTex.offset, wallTex.offset, body.position, body.rotation]);
            scene.traverse((o) => {
                const m = o as THREE.Mesh;
                m.geometry?.dispose();
                const mat = m.material as THREE.Material | THREE.Material[] | undefined;
                if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
                else mat?.dispose();
            });
            roadTex.dispose();
            wallTex.dispose();
            logoTex.dispose();
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
