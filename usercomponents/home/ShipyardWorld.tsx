"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import {
    PALETTE,
    addLights,
    buildContainer,
    buildForklift,
    buildParcel,
    buildPallet,
    buildTree,
    buildTruck,
    buildWarehouse,
    createStage,
    rng,
    shadowify,
    Vehicle,
} from "@/usercomponents/three/kit";

type Mover = { holder: THREE.Group; wheels: THREE.Group[]; radius: number; last: THREE.Vector3 };

const HALF_PI = Math.PI / 2;
const mat = (c: number, r = 0.85, m = 0.02) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

function roadTexture(len: number) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#cfd3e8";
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#f7f8fd";
    g.fillRect(0, 6, 512, 5);
    g.fillRect(0, 117, 512, 5);
    for (let i = 0; i < 4; i++) g.fillRect(i * 128 + 20, 61, 70, 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(len / 4, 1);
    t.anisotropy = 8;
    return t;
}

/** A purely decorative, non-interactive isometric shipyard. */
export default function ShipyardWorld() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = ref.current;
        if (!mount) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const stage = createStage(mount, { ortho: true, shadows: true, exposure: 1.1, envIntensity: 0.9 });
        if (!stage) return;
        const { scene } = stage;
        const cam = stage.camera as THREE.OrthographicCamera;
        addLights(scene, { shadow: true, size: 24 });

        const world = new THREE.Group();
        scene.add(world);

        /* ----------------------------- ground + roads ----------------------------- */
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), mat(0xe9ecf8, 0.95, 0));
        ground.rotation.x = -HALF_PI;
        ground.receiveShadow = true;
        world.add(ground);

        const roadH = new THREE.Mesh(new THREE.PlaneGeometry(90, 3), new THREE.MeshStandardMaterial({ map: roadTexture(90), roughness: 0.9 }));
        roadH.rotation.x = -HALF_PI;
        roadH.position.y = 0.01;
        roadH.receiveShadow = true;
        world.add(roadH);
        const roadV = roadH.clone();
        roadV.material = new THREE.MeshStandardMaterial({ map: roadTexture(90), roughness: 0.9 });
        roadV.rotation.z = HALF_PI;
        roadV.position.set(-8, 0.012, 0);
        world.add(roadV);
        // intersection patch to hide the crossing dashes
        const patch = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), mat(0xcfd3e8, 0.9, 0));
        patch.rotation.x = -HALF_PI;
        patch.position.set(-8, 0.02, 0);
        patch.receiveShadow = true;
        world.add(patch);

        // paved yards in front of both warehouses
        const yard = (x: number, z: number, w: number, d: number) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mat(0xf6f7fd, 0.9, 0));
            m.position.set(x, 0.04, z);
            m.receiveShadow = true;
            world.add(m);
        };
        yard(6, -7, 11, 11);
        yard(-3, 7.5, 11, 12);

        /* ------------------------------ scenery ------------------------------ */
        const rand = rng(11);
        const keepClear = (x: number, z: number) =>
            Math.abs(z) < 2.6 || Math.abs(x + 8) < 2.6 || (x > -1 && x < 14 && z < -0.5 && z > -14) || (x > -9 && x < 3 && z > 1 && z < 15) || (x < -2 && x > -16 && z < -3.5 && z > -13);
        for (let i = 0; i < 46; i++) {
            const x = (rand() - 0.5) * 50;
            const z = (rand() - 0.5) * 36;
            if (keepClear(x, z)) continue;
            const t = buildTree(0.9 + rand() * 1.3, rand() > 0.7 ? 0xffe2cf : 0xffffff);
            t.position.set(x, 0, z);
            shadowify(t, true, false);
            world.add(t);
        }
        for (let i = 0; i < 14; i++) {
            const x = (rand() - 0.5) * 46;
            const z = (rand() - 0.5) * 32;
            if (keepClear(x, z)) continue;
            const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + rand() * 0.3, 1), mat(0xffffff, 0.9, 0));
            r.position.set(x, 0.25, z);
            r.scale.y = 0.7;
            r.castShadow = true;
            world.add(r);
        }
        // traffic cones along the intersection
        for (const [x, z] of [[-6.2, 1.9], [-9.8, -1.9], [-6.2, -1.9], [-9.8, 1.9]] as const) {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 12), mat(PALETTE.orange, 0.5, 0.1));
            cone.position.set(x, 0.21, z);
            cone.castShadow = true;
            world.add(cone);
        }
        // lamp posts
        for (const x of [-14, -2, 3, 10, 16]) {
            for (const z of [2.4, -2.4]) {
                const lamp = new THREE.Group();
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 8), mat(PALETTE.navy, 0.5, 0.4));
                pole.position.y = 0.8;
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
                head.position.set(0, 1.6, z > 0 ? -0.1 : 0.1);
                lamp.add(pole, head);
                lamp.position.set(x + (z > 0 ? 0 : 1.4), 0, z);
                lamp.children.forEach((c) => (c.castShadow = true));
                world.add(lamp);
            }
        }

        /* ------------------------------ buildings ------------------------------ */
        const whN = buildWarehouse(7.5, 5, 2.4);
        whN.position.set(6, 0, -11);
        const whS = buildWarehouse(7.5, 5, 2.4);
        whS.position.set(-3, 0, 11);
        whS.rotation.y = Math.PI;
        [whN, whS].forEach((w) => {
            shadowify(w, true, true);
            world.add(w);
        });

        /* ----------------------------- container yard ----------------------------- */
        const Y = new THREE.Vector3(-9, 0, -8.5);
        const CS = 0.5; // container scale
        const stacks: THREE.Group[] = [];
        const tones: ("orange" | "navy" | "white")[] = ["navy", "orange", "navy", "white", "orange", "navy"];
        const slotXs = [-2.4, -1.2, 0, 1.2, 2.4];
        const heights = [3, 2, 2, 1, 2];
        let ti = 0;
        slotXs.forEach((sx, si) => {
            const col = new THREE.Group();
            col.position.set(Y.x + sx, 0, Y.z - 1.2);
            for (let h = 0; h < heights[si]; h++) {
                const c = buildContainer(tones[ti++ % tones.length], true);
                c.scale.setScalar(CS);
                c.rotation.y = HALF_PI;
                c.position.y = 0.65 * CS + h * 1.3 * CS + 0.02;
                col.add(c);
            }
            shadowify(col, true, true);
            world.add(col);
            stacks.push(col);
        });
        // second row (ground level, decorative)
        for (let i = 0; i < 4; i++) {
            const c = buildContainer(tones[(i + 2) % tones.length], true);
            c.scale.setScalar(CS);
            c.rotation.y = HALF_PI;
            c.position.set(Y.x - 1.8 + i * 1.2, 0.65 * CS + 0.02, Y.z + 2.3);
            shadowify(c, true, true);
            world.add(c);
        }

        // gantry crane: a bridge that travels along x and carries a trolley + hoist
        const gantry = new THREE.Group();
        gantry.position.set(Y.x, 0, Y.z);
        world.add(gantry);
        const steel = mat(PALETTE.navy, 0.45, 0.5);
        const orangeM = mat(PALETTE.orange, 0.4, 0.3);
        const bridge = new THREE.Group();
        gantry.add(bridge);
        for (const z of [-3.2, 1.2]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.2, 0.14), steel);
            leg.position.set(0, 1.6, z);
            bridge.add(leg);
        }
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 4.7), orangeM);
        beam.position.set(0, 3.25, -1);
        bridge.add(beam);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 4.7), steel);
        foot.position.set(0, 0.04, -1);
        bridge.add(foot);
        const trolley = new THREE.Group();
        trolley.position.set(0, 3.1, -1.2);
        bridge.add(trolley);
        const tb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.4), steel);
        trolley.add(tb);
        const hoist = new THREE.Group();
        trolley.add(hoist);
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), steel);
        rope.position.y = -0.5;
        hoist.add(rope);
        const spreader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.2), orangeM);
        spreader.position.y = -1;
        hoist.add(spreader);
        shadowify(bridge, true, false);
        const carried = buildContainer("orange", true);
        carried.scale.setScalar(CS);
        carried.rotation.y = HALF_PI;
        carried.position.set(0, -1.45, 0);
        hoist.add(carried);
        shadowify(carried, true, false);
        carried.visible = false;

        /* ---------------------------- vehicles & movers ---------------------------- */
        const movers: Mover[] = [];
        const addMover = (v: Vehicle, scale: number, shadow = true) => {
            const holder = new THREE.Group();
            v.group.scale.setScalar(scale);
            holder.add(v.group);
            if (shadow) shadowify(v.group, true, false);
            world.add(holder);
            movers.push({ holder, wheels: v.wheels, radius: v.wheelRadius * scale, last: new THREE.Vector3() });
            return holder;
        };
        const TS = 0.4; // truck scale
        const FS = 0.8; // forklift scale

        const tweens: gsap.core.Timeline[] = [];

        /** Loading dock: truck arrives, forklift loads parcels from a pallet stack, truck leaves. */
        function dock(s: -1 | 1, bayX: number, offset: number) {
            const e = s < 0 ? 1 : -1; // direction (along x) from bay to pallet stack
            const mainHead = s < 0 ? 0 : Math.PI;
            const bayHead = s < 0 ? HALF_PI : -HALF_PI;
            const laneZ = s < 0 ? 0.75 : -0.75;
            const startX = s < 0 ? -26 : 26;
            const truck = addMover(buildTruck(), TS);
            const z0 = s * 6.5;
            const fl = buildForklift();
            const forkHolder = addMover(fl, FS);
            const stackX = bayX + e * 5;
            const fz = s * 3.3;

            // pallet stack + loose boxes at the pick point
            const stack = buildPallet(1.1, 1.1);
            stack.position.set(stackX, 0.08, fz);
            const b1 = buildParcel(0.8, 0.7, 0.8);
            b1.position.set(0, 0.6, 0);
            stack.add(b1);
            const b2 = buildParcel(0.7, 0.6, 0.7);
            b2.position.set(0, 1.25, 0);
            b2.rotation.y = 0.3;
            stack.add(b2);
            shadowify(stack, true, true);
            world.add(stack);
            const extra = buildPallet(1.1, 1.1);
            extra.position.set(stackX, 0.08, fz + s * 1.6);
            const b3 = buildParcel(0.9, 0.7, 0.9);
            b3.position.set(0, 0.6, 0);
            extra.add(b3);
            shadowify(extra, true, true);
            world.add(extra);

            // the box the forklift is carrying
            const carry = buildParcel(0.8, 0.7, 0.8);
            carry.position.set(0.5, 0.45, 0);
            carry.scale.setScalar(0.001);
            fl.fork.add(carry);
            shadowify(carry, true, false);

            const pickX = stackX - e * 1.5;
            const tl = gsap.timeline({ repeat: -1, delay: offset });
            tweens.push(tl);

            // truck
            tl.set(truck.position, { x: startX, y: 0, z: laneZ })
                .set(truck.rotation, { y: mainHead })
                .to(truck.position, { x: bayX, duration: 7, ease: "power2.out" })
                .to(truck.rotation, { y: bayHead, duration: 0.7, ease: "power1.inOut" })
                .to(truck.position, { z: z0, duration: 2.6, ease: "power2.inOut" })
                .addLabel("loading");

            // forklift (two loads while the truck waits)
            tl.set(forkHolder.position, { x: pickX, y: 0, z: fz }, "loading-=9")
                .set(forkHolder.rotation, { y: e > 0 ? 0 : Math.PI }, "loading-=9")
                .set(fl.fork.position, { y: 0.15 }, "loading-=9");
            let t = 0;
            for (let k = 0; k < 2; k++) {
                const at = (dt: number) => `loading+=${t + dt}`;
                tl.to(fl.fork.position, { y: 0.35, duration: 0.5 }, at(0))
                    .to(carry.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "back.out(2)" }, at(0.2))
                    .to(fl.fork.position, { y: 0.7, duration: 0.7 }, at(0.9))
                    .to(forkHolder.rotation, { y: e > 0 ? Math.PI : 0, duration: 0.9, ease: "power1.inOut" }, at(1.7))
                    .to(forkHolder.position, { x: bayX, duration: 2.2, ease: "power1.inOut" }, at(2.7))
                    .to(forkHolder.rotation, { y: bayHead, duration: 0.8, ease: "power1.inOut" }, at(5))
                    .to(forkHolder.position, { z: s * 3.95, duration: 0.8, ease: "power1.inOut" }, at(5.9))
                    .to(carry.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3 }, at(6.8))
                    .to(forkHolder.position, { z: fz, duration: 0.8, ease: "power1.inOut" }, at(7.2))
                    .to(forkHolder.rotation, { y: e > 0 ? 0 : Math.PI, duration: 0.8, ease: "power1.inOut" }, at(8.1))
                    .to(forkHolder.position, { x: pickX, duration: 1.4, ease: "power1.inOut" }, at(8.9))
                    .to(fl.fork.position, { y: 0.15, duration: 0.5 }, at(10.2));
                t += 10.8;
            }
            tl.addLabel("leave", `loading+=${t}`)
                .to(truck.position, { z: laneZ, duration: 2.6, ease: "power2.inOut" }, "leave")
                .to(truck.rotation, { y: mainHead, duration: 0.7, ease: "power1.inOut" }, "leave+=2.4")
                .to(truck.position, { x: -startX, duration: 7, ease: "power2.in" }, "leave+=3")
                .to({}, { duration: 3 }); // off-screen pause before it returns
        }
        dock(-1, 6, 0);
        dock(1, -3, 17);

        /* cross-road traffic */
        function crossTruck(laneX: number, dir: 1 | -1, duration: number, delay: number) {
            const truck = addMover(buildTruck(), TS);
            const startZ = dir > 0 ? -24 : 24;
            const tl = gsap.timeline({ repeat: -1, delay });
            tweens.push(tl);
            tl.set(truck.position, { x: laneX, y: 0, z: startZ })
                .set(truck.rotation, { y: dir > 0 ? -HALF_PI : HALF_PI })
                .to(truck.position, { z: -startZ, duration, ease: "none" })
                .to({}, { duration: 5 });
        }
        crossTruck(-8 + 0.75, 1, 12, 3);
        crossTruck(-8 - 0.75, -1, 14, 11);

        /* patrolling forklift that circles the container yard with a box */
        {
            const fl = buildForklift();
            const holder = addMover(fl, FS);
            const box = buildParcel(0.8, 0.7, 0.8);
            box.position.set(0.5, 0.5, 0);
            fl.fork.add(box);
            fl.fork.position.y = 0.45;
            const pts: [number, number][] = [[-5.2, -4.6], [-5.2, -12.2], [-13, -12.2], [-13, -4.6]];
            holder.position.set(pts[0][0], 0, pts[0][1]);
            const tl = gsap.timeline({ repeat: -1 });
            tweens.push(tl);
            let cur = pts[0];
            let rot = 0;
            const turn = (to: number) => {
                let d = to - rot;
                while (d > Math.PI) d -= 2 * Math.PI;
                while (d < -Math.PI) d += 2 * Math.PI;
                rot += d;
                return rot;
            };
            tl.set(holder.position, { x: cur[0], z: cur[1] });
            for (let i = 1; i <= pts.length; i++) {
                const nxt = pts[i % pts.length];
                const ang = Math.atan2(-(nxt[1] - cur[1]), nxt[0] - cur[0]); // heading with +x = 0, -z = +pi/2
                tl.to(holder.rotation, { y: turn(ang), duration: 0.7, ease: "power1.inOut" });
                const dist = Math.hypot(nxt[0] - cur[0], nxt[1] - cur[1]);
                tl.to(holder.position, { x: nxt[0], z: nxt[1], duration: dist / 1.7, ease: "none" });
                tl.to(fl.fork.position, { y: i % 2 ? 0.9 : 0.45, duration: 0.6 });
                cur = nxt;
            }
        }

        /* gantry crane loop: carries one container from stack 1 to stack 4 and back, forever */
        {
            const placed = buildContainer("orange", true);
            placed.scale.setScalar(CS);
            placed.rotation.y = HALF_PI;
            placed.position.y = 0.65 * CS + 1 * 1.3 * CS + 0.02;
            shadowify(placed, true, true);
            placed.visible = false;
            stacks[3].add(placed);
            const top0 = () => stacks[0].children[stacks[0].children.length - 1];

            const hs = { len: 1 };
            const setRope = (len: number) => {
                rope.scale.y = len;
                rope.position.y = -len / 2;
                spreader.position.y = -len;
                carried.position.y = -len - 0.45;
            };
            setRope(1);
            const LEN_STACK0 = 1.005; // rope length that lands on / lifts from the 3-high stack
            const LEN_STACK3 = 1.655;
            const tl = gsap.timeline({ repeat: -1 });
            tweens.push(tl);
            const rope_to = (len: number, dur = 1.3) => tl.to(hs, { len, duration: dur, ease: "power1.inOut", onUpdate: () => setRope(hs.len) });
            const move = (x: number) => tl.to(bridge.position, { x, duration: 3.2, ease: "power2.inOut" });
            tl.set(bridge.position, { x: -2.4 });
            // trip A: stack 1 -> stack 4
            rope_to(LEN_STACK0)
                .call(() => { top0().visible = false; carried.visible = true; })
                .to({}, { duration: 0.3 });
            rope_to(0.6, 1.1);
            move(1.2);
            rope_to(LEN_STACK3)
                .call(() => { carried.visible = false; placed.visible = true; })
                .to({}, { duration: 0.3 });
            rope_to(0.6, 1.1);
            // trip B: back again
            rope_to(LEN_STACK3)
                .call(() => { placed.visible = false; carried.visible = true; })
                .to({}, { duration: 0.3 });
            rope_to(0.6, 1.1);
            move(-2.4);
            rope_to(LEN_STACK0)
                .call(() => { carried.visible = false; top0().visible = true; })
                .to({}, { duration: 0.3 });
            rope_to(1, 1.1);
        }

        /* delivery drone */
        const drone = new THREE.Group();
        const dBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.5), mat(PALETTE.navy, 0.4, 0.5));
        drone.add(dBody);
        const rotors: THREE.Mesh[] = [];
        for (const [x, z] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]] as const) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), mat(PALETTE.navy, 0.4, 0.5));
            arm.position.set(x / 2, 0, z / 2);
            arm.rotation.y = Math.atan2(-z, x);
            arm.scale.x = 1.0;
            const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 14), new THREE.MeshBasicMaterial({ color: 0xff5a0a, transparent: true, opacity: 0.55 }));
            rotor.position.set(x, 0.08, z);
            drone.add(arm, rotor);
            rotors.push(rotor);
        }
        const dParcel = buildParcel(0.35, 0.3, 0.35);
        dParcel.position.y = -0.3;
        drone.add(dParcel);
        shadowify(drone, true, false);
        world.add(drone);
        const flight = { u: 0 };
        if (!reduce) gsap.to(flight, { u: Math.PI * 2, duration: 26, ease: "none", repeat: -1 });

        /* ------------------------------ camera + loop ------------------------------ */
        stage.onResize((w, h) => {
            const vh = w < 700 ? 17 : 26;
            const a = w / h;
            cam.left = (-vh * a) / 2;
            cam.right = (vh * a) / 2;
            cam.top = vh / 2;
            cam.bottom = -vh / 2;
            cam.position.set(15, 14, 15);
            cam.lookAt(0, 0, 0);
            cam.updateProjectionMatrix();
        });

        const dir = new THREE.Vector3();
        stage.onFrame((dt, t) => {
            movers.forEach((m) => {
                const p = m.holder.position;
                const dx = p.x - m.last.x;
                const dz = p.z - m.last.z;
                const th = m.holder.rotation.y;
                dir.set(Math.cos(th), 0, -Math.sin(th));
                const d = dx * dir.x + dz * dir.z;
                if (Math.abs(d) < 5) m.wheels.forEach((w) => (w.rotation.z -= d / m.radius));
                m.last.copy(p);
            });
            // drone: lissajous loop, nose along its direction of travel
            const u = flight.u;
            const px = Math.sin(u) * 11;
            const pz = Math.sin(2 * u) * 6;
            drone.position.set(px, 5 + Math.sin(3 * u) * 0.4, pz);
            const vx = Math.cos(u) * 11;
            const vz = Math.cos(2 * u) * 12;
            drone.rotation.y = Math.atan2(-vz, vx);
            drone.rotation.z = Math.sin(t * 2) * 0.05;
            rotors.forEach((r, i) => (r.rotation.y += 0.9 * (i % 2 ? 1 : -1)));
        });

        if (reduce) tweens.forEach((tl) => tl.progress(0.3).pause());

        return () => {
            tweens.forEach((tl) => tl.kill());
            gsap.killTweensOf(flight);
            stage.dispose();
        };
    }, []);

    return <div ref={ref} className="pointer-events-none absolute inset-0 select-none" aria-hidden="true" />;
}
