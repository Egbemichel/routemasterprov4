import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ------------------------------------------------------------------ *
 *  Stage: renderer + scene + camera + resize + visibility + disposal  *
 * ------------------------------------------------------------------ */

export type Stage = {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    /** called every frame while the stage is on screen; `dt` in seconds */
    onFrame: (fn: (dt: number, t: number) => void) => void;
    /** called on mount and whenever the container is resized */
    onResize: (fn: (w: number, h: number) => void) => void;
    dispose: () => void;
};

type StageOpts = {
    ortho?: boolean;
    fov?: number;
    shadows?: boolean;
    exposure?: number;
    envIntensity?: number;
};

/** Returns null when WebGL is unavailable so callers can quietly render nothing. */
export function createStage(mount: HTMLElement, opts: StageOpts = {}): Stage | null {
    let renderer: THREE.WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = opts.exposure ?? 1.05;
    if (opts.shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    // let three restore the context if the browser ever drops it
    renderer.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = opts.envIntensity ?? 1;

    const camera = opts.ortho
        ? new THREE.OrthographicCamera(-10, 10, 10, -10, -100, 200)
        : new THREE.PerspectiveCamera(opts.fov ?? 32, 1, 0.1, 200);

    const frameFns: ((dt: number, t: number) => void)[] = [];
    const resizeFns: ((w: number, h: number) => void)[] = [];
    const size = { w: 1, h: 1 };
    const resize = () => {
        size.w = mount.clientWidth || 1;
        size.h = mount.clientHeight || 1;
        renderer.setSize(size.w, size.h, false);
        resizeFns.forEach((f) => f(size.w, size.h));
        if (camera instanceof THREE.PerspectiveCamera) camera.aspect = size.w / size.h;
        camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "80px" });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) {
            clock.getDelta(); // keep dt small after re-entering view
            return;
        }
        const dt = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;
        frameFns.forEach((f) => f(dt, t));
        renderer.render(scene, camera);
    };
    tick();

    return {
        renderer,
        scene,
        camera,
        onFrame: (fn) => frameFns.push(fn),
        onResize: (fn) => {
            resizeFns.push(fn);
            fn(size.w, size.h);
            resize();
        },
        dispose: () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            disposeObject(scene);
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.forceContextLoss(); // free the GPU context now; browsers cap active contexts (~16)
            renderer.domElement.remove();
        },
    };
}

export function disposeObject(root: THREE.Object3D) {
    const mats = new Set<THREE.Material>();
    root.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => mats.add(x));
        else if (mat) mats.add(mat);
    });
    mats.forEach((m) => {
        const mm = m as THREE.MeshStandardMaterial;
        mm.map?.dispose();
        mm.bumpMap?.dispose();
        m.dispose();
    });
}

export function addLights(scene: THREE.Scene, opts: { shadow?: boolean; size?: number } = {}) {
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(-6, 12, 9);
    if (opts.shadow) {
        key.castShadow = true;
        const s = opts.size ?? 18;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.left = -s;
        key.shadow.camera.right = s;
        key.shadow.camera.top = s;
        key.shadow.camera.bottom = -s;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 60;
        key.shadow.bias = -0.0004;
        key.shadow.radius = 4;
    }
    scene.add(key, new THREE.AmbientLight(0xdfe3ff, 0.55));
    return key;
}

export function shadowify(root: THREE.Object3D, cast = true, receive = false) {
    root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
            o.castShadow = cast;
            o.receiveShadow = receive;
        }
    });
}

/* ------------------------------ textures ------------------------------ */

function hex(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        g[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath();
}

/** Brand mark drawn into a 2D context. Returns the width used. */
export function drawBrand(g: CanvasRenderingContext2D, x: number, cy: number, size: number, fg = "#fff", accent = "#e84800") {
    g.font = `700 ${size}px Arial, Helvetica, sans-serif`;
    g.textBaseline = "middle";
    g.textAlign = "left";
    const tw = g.measureText("GlobexiaCorp").width;
    g.fillStyle = fg;
    hex(g, x + size * 0.48, cy, size * 0.48);
    g.fill();
    g.fillStyle = accent;
    hex(g, x + size * 0.48, cy, size * 0.22);
    g.fill();
    g.fillStyle = fg;
    g.fillText("GlobexiaCorp", x + size * 1.1, cy + size * 0.04);
    return size * 1.1 + tw;
}

export function brandWidth(size: number) {
    const c = document.createElement("canvas").getContext("2d")!;
    c.font = `700 ${size}px Arial, Helvetica, sans-serif`;
    return size * 1.1 + c.measureText("GlobexiaCorp").width;
}

export type ContainerTone = "orange" | "navy" | "white";
const TONES: Record<ContainerTone, { base: string; dark: string; light: string; fg: string; accent: string }> = {
    orange: { base: "#ff6a14", dark: "rgba(120,30,0,0.32)", light: "rgba(255,170,90,0.24)", fg: "#fff", accent: "#e84800" },
    navy: { base: "#1c1f4d", dark: "rgba(0,0,20,0.4)", light: "rgba(120,130,220,0.18)", fg: "#fff", accent: "#ff5a0a" },
    white: { base: "#f1f2fa", dark: "rgba(18,18,63,0.12)", light: "rgba(255,255,255,0.5)", fg: "#12123f", accent: "#ff5a0a" },
};

export function containerSideTexture(tone: ContainerTone, withLogo = true) {
    const T = TONES[tone];
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = T.base;
    g.fillRect(0, 0, 1024, 256);
    for (let x = 0; x < 1024; x += 16) {
        const gr = g.createLinearGradient(x, 0, x + 16, 0);
        gr.addColorStop(0, T.dark);
        gr.addColorStop(0.5, T.light);
        gr.addColorStop(1, T.dark);
        g.fillStyle = gr;
        g.fillRect(x, 0, 16, 256);
    }
    if (withLogo) {
        const size = 100;
        const w = brandWidth(size);
        drawBrand(g, (1024 - w) / 2, 128, size, T.fg, T.accent);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
}

export function corrugationBump() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 512, 64);
    for (let x = 0; x < 512; x += 8) {
        const gr = g.createLinearGradient(x, 0, x + 8, 0);
        gr.addColorStop(0, "#202020");
        gr.addColorStop(0.5, "#f0f0f0");
        gr.addColorStop(1, "#202020");
        g.fillStyle = gr;
        g.fillRect(x, 0, 8, 64);
    }
    const t = new THREE.CanvasTexture(c);
    return t;
}

export function brandPlateTexture(w = 512, h = 128, bg = "#ffffff", fg = "#12123f") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const size = h * 0.5;
    const bw = brandWidth(size);
    drawBrand(g, (w - bw) / 2, h / 2, size, fg, "#ff5a0a");
    // brand mark needs orange hexagon on light backgrounds
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
}

/* ------------------------------- models ------------------------------- */

const std = (color: THREE.ColorRepresentation, rough = 0.5, metal = 0.3) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

export const PALETTE = {
    orange: 0xff5a0a,
    orangeLight: 0xff8a3d,
    navy: 0x12123f,
    white: 0xf6f6fb,
    clay: 0xe9ebf7,
    steel: 0xb4b8c8,
    dark: 0x1b1b2e,
};

/** Shipping container. 6 x 1.3 x 1.25 (L x H x W), long axis = x. */
export function buildContainer(tone: ContainerTone = "orange", withLogo = true) {
    const L = 6, H = 1.3, W = 1.25;
    const g = new THREE.Group();
    const side = containerSideTexture(tone, withLogo);
    const bump = corrugationBump();
    bump.wrapS = THREE.RepeatWrapping;
    bump.repeat.set(1, 1);
    const baseCol = new THREE.Color(TONES[tone].base);
    const wall = new THREE.MeshStandardMaterial({ map: side, bumpMap: bump, bumpScale: 1.6, roughness: 0.45, metalness: 0.3 });
    const plain = std(baseCol, 0.5, 0.3);
    const frame = std(baseCol.clone().multiplyScalar(0.78), 0.4, 0.6);
    const steel = std(PALETTE.steel, 0.35, 0.9);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(L - 0.06, H - 0.06, W - 0.06), [plain, plain, plain, plain, wall, wall]));
    const t = 0.07;
    const beam = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), frame);
        m.position.set(x, y, z);
        g.add(m);
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
                g.add(cc);
            }
    for (const x of [-1, 1])
        for (const dz of [-0.4, -0.2, 0.2, 0.4]) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, H - 0.12, 8), steel);
            bar.position.set((x * L) / 2 + x * 0.025, 0, dz * W);
            g.add(bar);
        }
    return g;
}

export type Vehicle = { group: THREE.Group; wheels: THREE.Group[]; wheelRadius: number };

/** Orange-and-white semi truck with a branded container. Faces +x, ~9 long, wheels on y=0. */
export function buildTruck(): Vehicle {
    const R = 0.52;
    const g = new THREE.Group();
    const orange = std(PALETTE.orange, 0.4, 0.35);
    const white = std(PALETTE.white, 0.35, 0.2);
    const dark = std(PALETTE.dark, 0.6, 0.6);
    const glass = std(0x5fb6d9, 0.1, 0.7);
    const steel = std(PALETTE.steel, 0.3, 0.9);
    const side = containerSideTexture("orange", true);
    const logoMat = new THREE.MeshStandardMaterial({ map: side, roughness: 0.45, metalness: 0.3 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.5, 2.1), [orange, orange, orange, orange, logoMat, logoMat]);
    box.position.set(-1.1, 1.95, 0);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 1.5), dark);
    chassis.position.set(0.1, 0.62, 0);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 2.0), white);
    cab.position.set(2.65, 1.6, 0);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 2.0), orange);
    hood.position.set(3.8, 1.15, 0);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 2.1), steel);
    bumper.position.set(4.1, 0.55, 0);
    g.add(box, chassis, cab, hood, bumper);
    for (const z of [-1, 1]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.02), glass);
        win.position.set(2.7, 2.0, z * 1.01);
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
        lamp.position.set(4.16, 1.0, z * 0.7);
        g.add(win, lamp);
    }
    const wheels: THREE.Group[] = [];
    const tyre = new THREE.CylinderGeometry(R, R, 0.42, 20);
    const hub = new THREE.CylinderGeometry(0.26, 0.26, 0.44, 10);
    const bolt = new THREE.BoxGeometry(0.07, 0.07, 0.46);
    for (const x of [3.4, 1.8, -2.4, -3.6])
        for (const z of [-0.95, 0.95]) {
            const w = new THREE.Group();
            const t = new THREE.Mesh(tyre, dark);
            t.rotation.x = Math.PI / 2;
            const h = new THREE.Mesh(hub, steel);
            h.rotation.x = Math.PI / 2;
            const b = new THREE.Mesh(bolt, orange);
            b.position.y = 0.18;
            const b2 = b.clone();
            b2.position.y = -0.18;
            w.add(t, h, b, b2);
            w.position.set(x, R, z);
            g.add(w);
            wheels.push(w);
        }
    return { group: g, wheels, wheelRadius: R };
}

export type Forklift = Vehicle & { fork: THREE.Group; mast: THREE.Group };

/** Compact forklift facing +x, ~2.2 long. `fork` slides up/down (y: 0.15 .. 1.8). */
export function buildForklift(): Forklift {
    const R = 0.22;
    const g = new THREE.Group();
    const orange = std(PALETTE.orange, 0.45, 0.35);
    const dark = std(PALETTE.dark, 0.6, 0.6);
    const steel = std(PALETTE.steel, 0.3, 0.9);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 0.85), orange);
    body.position.set(-0.25, 0.5, 0);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.85), dark);
    counter.position.set(-0.85, 0.62, 0);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.45), dark);
    seat.position.set(-0.35, 0.85, 0);
    g.add(body, counter, seat);
    for (const x of [-0.05, 0.4])
        for (const z of [-1, 1]) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), dark);
            post.position.set(x, 1.15, z * 0.38);
            g.add(post);
        }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.9), dark);
    roof.position.set(0.18, 1.65, 0);
    g.add(roof);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb12b }));
    beacon.position.set(0.18, 1.74, 0);
    g.add(beacon);
    const mast = new THREE.Group();
    mast.position.set(0.55, 0, 0);
    for (const z of [-0.3, 0.3]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), steel);
        rail.position.set(0.1, 1.2, z);
        mast.add(rail);
    }
    const fork = new THREE.Group();
    fork.position.set(0.15, 0.15, 0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.8), steel);
    back.position.set(0, 0.2, 0);
    fork.add(back);
    for (const z of [-0.25, 0.25]) {
        const tine = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.12), steel);
        tine.position.set(0.5, 0.02, z);
        fork.add(tine);
    }
    mast.add(fork);
    g.add(mast);
    const wheels: THREE.Group[] = [];
    const tyre = new THREE.CylinderGeometry(R, R, 0.2, 14);
    for (const [x, z] of [[0.3, 0.45], [0.3, -0.45], [-0.75, 0.45], [-0.75, -0.45]] as const) {
        const w = new THREE.Group();
        const t = new THREE.Mesh(tyre, dark);
        t.rotation.x = Math.PI / 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.22), orange);
        w.add(t, spoke);
        w.position.set(x, R, z);
        g.add(w);
        wheels.push(w);
    }
    return { group: g, wheels, wheelRadius: R, fork, mast };
}

/** Cardboard parcel with brand tape + label. ~1 x 0.8 x 0.8 */
export function buildParcel(sx = 1, sy = 0.8, sz = 0.8) {
    const g = new THREE.Group();
    const card = std(0xd9b383, 0.7, 0.05);
    const tape = std(PALETTE.orange, 0.5, 0.1);
    const box = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), card);
    g.add(box);
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(sx * 0.18, sy + 0.01, sz + 0.01), tape);
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(sx + 0.01, sy + 0.012, sz * 0.18), tape);
    g.add(t1, t2);
    const plate = brandPlateTexture(256, 64, "#ffffff", "#12123f");
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(sx * 0.46, sx * 0.115),
        new THREE.MeshBasicMaterial({ map: plate }),
    );
    label.position.set(sx * 0.3, 0, sz / 2 + 0.006);
    g.add(label);
    return g;
}

export function buildPallet(w = 1.1, d = 1.1) {
    const g = new THREE.Group();
    const wood = std(0xc9a26b, 0.8, 0.02);
    for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.18), wood);
        b.position.set(0, 0.1, -d / 2 + 0.09 + i * (d - 0.18) / 2);
        g.add(b);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), wood);
    top.position.y = 0.2;
    g.add(top);
    return g;
}

export function buildTree(h = 1.2, color: number = 0xffffff) {
    const g = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h, 20), std(color, 0.9, 0));
    cone.position.y = h / 2 + 0.1;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8), std(0xc9ccdf, 0.9, 0));
    trunk.position.y = 0.07;
    g.add(cone, trunk);
    return g;
}

export function buildWarehouse(w = 6, d = 4, h = 2.2) {
    const g = new THREE.Group();
    const wall = std(0xf4f5fc, 0.85, 0.02);
    const roofM = std(0xe1e4f3, 0.8, 0.02);
    const door = std(0xb8bcd6, 0.7, 0.1);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall);
    body.position.y = h / 2;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.2, d + 0.3), roofM);
    roof.position.y = h + 0.1;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.25, d * 0.4), roofM);
    rib.position.set(-w * 0.15, h + 0.3, 0);
    g.add(body, roof, rib);
    const bays = Math.max(2, Math.floor(w / 2));
    for (let i = 0; i < bays; i++) {
        const x = -w / 2 + (w / bays) * (i + 0.5);
        const d1 = new THREE.Mesh(new THREE.BoxGeometry((w / bays) * 0.7, h * 0.65, 0.06), door);
        d1.position.set(x, (h * 0.65) / 2, d / 2 + 0.01);
        g.add(d1);
    }
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.55),
        new THREE.MeshBasicMaterial({ map: brandPlateTexture(512, 128, "#12123f", "#ffffff") }),
    );
    sign.position.set(0, h + 0.55, d / 2 - 0.4);
    sign.rotation.x = -0.15;
    g.add(sign);
    return g;
}

/** Wireframe-ish globe with orange hubs. */
export function buildGlobe(r = 1) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), std(0xf4f5fc, 0.35, 0.1));
    g.add(core);
    const lines = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(r * 1.002, 18, 12)),
        new THREE.LineBasicMaterial({ color: 0x12123f, transparent: true, opacity: 0.18 }),
    );
    g.add(lines);
    const pin = std(PALETTE.orange, 0.4, 0.3);
    const rng = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    for (let i = 0; i < 14; i++) {
        const lat = (rng() - 0.5) * Math.PI * 0.9;
        const lon = rng() * Math.PI * 2;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r * 0.05, 10, 10), pin);
        m.position.set(Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(lon) * r);
        g.add(m);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.35, 0.012 * r, 8, 96), std(PALETTE.orange, 0.4, 0.3));
    ring.rotation.x = Math.PI / 2.6;
    g.add(ring);
    return g;
}

export function buildStar(r = 0.5, depth = 0.18) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rr = i % 2 ? r * 0.45 : r;
        s[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
    geo.center();
    return new THREE.Mesh(geo, std(0xffb12b, 0.3, 0.4));
}

/** Seeded RNG for deterministic scenery. */
export function rng(seed = 1) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** A chunky 3D "?" built from a tube + dot. ~1.6 wide, 2.8 tall, centred. */
export function buildQuestionMark(color: THREE.ColorRepresentation = PALETTE.orange) {
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.62, 0.8, 0),
        new THREE.Vector3(-0.5, 1.28, 0),
        new THREE.Vector3(0, 1.55, 0),
        new THREE.Vector3(0.5, 1.28, 0),
        new THREE.Vector3(0.56, 0.8, 0),
        new THREE.Vector3(0.3, 0.32, 0),
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(0, -0.3, 0),
    ]);
    const m = std(color, 0.35, 0.3);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.2, 16, false), m));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), m);
    dot.position.y = -0.85;
    g.add(dot);
    g.position.y = -0.35;
    const w = new THREE.Group();
    w.add(g);
    return w;
}

/** Chunky opening quote marks. */
export function buildQuote(color: THREE.ColorRepresentation = PALETTE.orange) {
    const w = new THREE.Group();
    const m = std(color, 0.35, 0.3);
    for (const x of [-0.5, 0.5]) {
        const s = new THREE.Shape();
        s.absarc(0, 0.2, 0.4, 0, Math.PI * 2, false);
        const tail = new THREE.Shape();
        tail.moveTo(-0.4, 0.2);
        tail.quadraticCurveTo(-0.45, -0.55, 0.2, -0.85);
        tail.quadraticCurveTo(-0.1, -0.35, 0.1, 0.1);
        tail.lineTo(-0.4, 0.2);
        const opts = { depth: 0.3, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 };
        const a = new THREE.Mesh(new THREE.ExtrudeGeometry(s, opts), m);
        const b = new THREE.Mesh(new THREE.ExtrudeGeometry(tail, opts), m);
        const grp = new THREE.Group();
        grp.add(a, b);
        grp.position.set(x, 0, -0.15);
        w.add(grp);
    }
    return w;
}
