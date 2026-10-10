import type { jsPDF } from "jspdf";
import { PackageData, statusLabel } from "@/components/admin/types";

type RGB = [number, number, number];
const NAVY: RGB = [18, 18, 63];
const ORANGE: RGB = [255, 90, 10];
const ORANGE_LIGHT: RGB = [255, 138, 61];
const ORANGE_DARK: RGB = [232, 72, 0];
const LAV: RGB = [238, 240, 251];
const MUTED: RGB = [110, 112, 140];
const WHITE: RGB = [255, 255, 255];

const STATUS_COLORS: Record<string, { bg: RGB; fg: RGB }> = {
    "in transit": { bg: [255, 232, 220], fg: ORANGE_DARK },
    "on hold": { bg: [254, 243, 199], fg: [146, 64, 14] },
    delivered: { bg: [209, 250, 229], fg: [6, 95, 70] },
    cancelled: { bg: [254, 226, 226], fg: [185, 28, 28] },
};

const fill = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const stroke = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);
const text = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);

function poly(d: jsPDF, pts: [number, number][], c: RGB) {
    fill(d, c);
    const [x0, y0] = pts[0];
    d.lines(
        pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]),
        x0,
        y0,
        [1, 1],
        "F",
        true,
    );
}

/** The GlobexiaCorp hexagon-cube mark, drawn with vector shapes. */
function drawLogo(d: jsPDF, cx: number, cy: number, r: number) {
    const v = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number];
    });
    const c: [number, number] = [cx, cy];
    poly(d, [v[0], v[1], c, v[5]], ORANGE_LIGHT);
    poly(d, [v[5], c, v[3], v[4]], ORANGE_DARK);
    poly(d, [v[1], v[2], v[3], c], ORANGE);
    // inner white cube
    const k = r * 0.52;
    const w = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return [cx + Math.cos(a) * k, cy + Math.sin(a) * k] as [number, number];
    });
    poly(d, [w[0], w[1], c, w[5]], WHITE);
    poly(d, [w[5], c, w[3], w[4]], [255, 232, 220]);
    poly(d, [w[1], w[2], w[3], c], [255, 244, 238]);
}

function barcodePng(JsBarcode: (c: HTMLCanvasElement, v: string, o: object) => void, value: string) {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, { format: "CODE128", displayValue: false, margin: 0, height: 80, width: 3, background: "#ffffff", lineColor: "#12123f" });
    return { data: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}

const clip = (d: jsPDF, s: string, w: number, maxLines = 2) => {
    const lines = d.splitTextToSize(s || "-", w) as string[];
    if (lines.length <= maxLines) return lines;
    const out = lines.slice(0, maxLines);
    out[maxLines - 1] = out[maxLines - 1].replace(/.{0,2}$/, "...");
    return out;
};

/** Builds and downloads the branded shipping receipt for a package. */
export async function generateReceipt(pkg: PackageData, carrierName: string) {
    const { jsPDF } = await import("jspdf");
    const JsBarcode = (await import("jsbarcode")).default;
    const d = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const W = 210;
    const H = 297;
    const M = 14;
    const tn = pkg.trackingNumber || pkg.id;
    const status = (pkg.status || "in transit").toLowerCase();

    /* ---------------- header band ---------------- */
    fill(d, NAVY);
    d.rect(0, 0, W, 44, "F");
    fill(d, ORANGE);
    d.rect(0, 44, W, 2.4, "F");
    // decorative circles
    fill(d, [30, 30, 88]);
    d.circle(W - 8, -4, 30, "F");
    fill(d, [255, 90, 10]);
    d.circle(W - 4, 50, 3, "F");

    drawLogo(d, M + 8, 22, 8);
    d.setFont("helvetica", "bold");
    d.setFontSize(19);
    text(d, WHITE);
    d.text("GlobexiaCorp", M + 20, 24);
    d.setFont("helvetica", "normal");
    d.setFontSize(8.5);
    text(d, [190, 194, 230]);
    d.text("Delivering beyond borders", M + 20, 30);

    d.setFont("helvetica", "bold");
    d.setFontSize(13);
    text(d, WHITE);
    d.text("SHIPPING RECEIPT", W - M, 20, { align: "right" });
    d.setFont("helvetica", "normal");
    d.setFontSize(8.5);
    text(d, [190, 194, 230]);
    d.text(`Issued ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`, W - M, 26, { align: "right" });

    /* ---------------- tracking card ---------------- */
    let y = 56;
    fill(d, WHITE);
    stroke(d, [222, 225, 242]);
    d.setLineWidth(0.4);
    d.roundedRect(M, y, W - 2 * M, 38, 4, 4, "FD");
    fill(d, ORANGE);
    d.roundedRect(M, y, 2.2, 38, 1, 1, "F");

    d.setFont("helvetica", "bold");
    d.setFontSize(7.5);
    text(d, MUTED);
    d.text("TRACKING NUMBER", M + 9, y + 9);
    d.setFontSize(14.5);
    text(d, NAVY);
    d.text(tn, M + 9, y + 18);

    const sc = STATUS_COLORS[status] || { bg: LAV, fg: NAVY };
    const label = statusLabel(pkg.status).toUpperCase();
    d.setFontSize(8);
    const pillW = d.getTextWidth(label) + 10;
    fill(d, sc.bg);
    d.roundedRect(M + 9, y + 23, pillW, 7, 3.5, 3.5, "F");
    fill(d, sc.fg);
    d.circle(M + 13, y + 26.5, 0.9, "F");
    text(d, sc.fg);
    d.text(label, M + 16, y + 28.1);

    try {
        const bc = barcodePng(JsBarcode, tn);
        const bw = 78;
        const bh = Math.min(20, bw / bc.ratio);
        d.addImage(bc.data, "PNG", W - M - bw - 6, y + 6, bw, bh);
        d.setFont("helvetica", "normal");
        d.setFontSize(7.5);
        text(d, MUTED);
        d.text(tn, W - M - bw / 2 - 6, y + 6 + bh + 5, { align: "center" });
    } catch (e) {
        console.error("Barcode failed", e);
    }

    /* ---------------- route strip ---------------- */
    y += 48;
    const midY = y + 9;
    const colW = (W - 2 * M - 16) / 2;
    const arrowX1 = M + colW * 0.55 + 4;
    const arrowX2 = W - M - colW * 0.55 - 4;
    d.setFont("helvetica", "bold");
    d.setFontSize(7.5);
    text(d, MUTED);
    d.text("ORIGIN", M, y + 2);
    d.text("DESTINATION", W - M, y + 2, { align: "right" });
    d.setFontSize(12);
    text(d, NAVY);
    d.text(clip(d, pkg.packageOrigin, 62, 1), M, y + 9);
    d.text(clip(d, pkg.destination, 62, 1), W - M, y + 9, { align: "right" });
    stroke(d, ORANGE);
    d.setLineWidth(0.7);
    d.setLineDashPattern([1.4, 1.4], 0);
    d.line(arrowX1, midY - 1.2, arrowX2 - 3, midY - 1.2);
    d.setLineDashPattern([], 0);
    poly(d, [[arrowX2 - 3.5, midY - 3.6], [arrowX2, midY - 1.2], [arrowX2 - 3.5, midY + 1.2]], ORANGE);
    fill(d, ORANGE);
    d.circle(arrowX1 - 1, midY - 1.2, 1.3, "F");

    /* ---------------- sender / receiver ---------------- */
    y += 20;
    const boxW = (W - 2 * M - 6) / 2;
    const party = (x: number, title: string, p: { name: string; address: string; phone: string; email: string }) => {
        fill(d, LAV);
        d.roundedRect(x, y, boxW, 46, 4, 4, "F");
        d.setFont("helvetica", "bold");
        d.setFontSize(7.5);
        text(d, ORANGE_DARK);
        d.text(title, x + 6, y + 8);
        d.setFontSize(11.5);
        text(d, NAVY);
        d.text(clip(d, p.name, boxW - 12, 1), x + 6, y + 16);
        d.setFont("helvetica", "normal");
        d.setFontSize(8.8);
        text(d, [70, 72, 110]);
        const addr = clip(d, p.address, boxW - 12, 2);
        d.text(addr, x + 6, y + 23);
        const yy = y + 23 + addr.length * 4.3 + 2;
        d.text(clip(d, p.phone, boxW - 12, 1), x + 6, yy);
        d.text(clip(d, p.email, boxW - 12, 1), x + 6, yy + 4.6);
    };
    party(M, "SHIPPER", { name: pkg.senderName, address: pkg.senderAddress, phone: pkg.senderPhone, email: pkg.senderEmail });
    party(M + boxW + 6, "RECEIVER", { name: pkg.receiverName, address: pkg.receiverAddress, phone: pkg.receiverPhone, email: pkg.receiverEmail });

    /* ---------------- shipment details ---------------- */
    y += 56;
    d.setFont("helvetica", "bold");
    d.setFontSize(9);
    text(d, NAVY);
    d.text("SHIPMENT DETAILS", M, y);
    fill(d, ORANGE);
    d.rect(M, y + 2, 10, 0.9, "F");
    y += 8;
    const items: [string, string][] = [
        ["Contents", pkg.packageContent || "-"],
        ["Quantity", String(pkg.quantity ?? "-")],
        ["Weight", `${pkg.weightKg ?? "-"} kg`],
        ["Carrier", carrierName || "-"],
        ["Shipment type", pkg.deliveryType || "-"],
        ["Transport mode", pkg.transportMode || "-"],
        ["Expected delivery", pkg.expectedDeliveryDate || "-"],
        ["Departure time", pkg.departureTime || "-"],
    ];
    const tw = (W - 2 * M - 9) / 4;
    items.forEach(([k, v], i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = M + col * (tw + 3);
        const yy = y + row * 22;
        stroke(d, [222, 225, 242]);
        d.setLineWidth(0.3);
        fill(d, WHITE);
        d.roundedRect(x, yy, tw, 19, 3, 3, "FD");
        d.setFont("helvetica", "bold");
        d.setFontSize(6.8);
        text(d, MUTED);
        d.text(k.toUpperCase(), x + 4, yy + 6);
        d.setFontSize(9.5);
        text(d, NAVY);
        d.text(clip(d, v, tw - 8, 2), x + 4, yy + 12);
    });

    /* ---------------- comment ---------------- */
    y += 50;
    fill(d, LAV);
    d.roundedRect(M, y, W - 2 * M, 20, 4, 4, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(7.5);
    text(d, MUTED);
    d.text("COMMENT", M + 6, y + 7);
    d.setFont("helvetica", "normal");
    d.setFontSize(9);
    text(d, NAVY);
    d.text(clip(d, pkg.comment || "No comment provided.", W - 2 * M - 12, 2), M + 6, y + 13);

    /* ---------------- signatures ---------------- */
    y += 42;
    const sigW = (W - 2 * M - 14) / 2;
    [["Receiver's signature", M], ["Agency's signature", M + sigW + 14]].forEach(([label, x]) => {
        stroke(d, NAVY);
        d.setLineWidth(0.4);
        d.line(x as number, y, (x as number) + sigW, y);
        d.setFont("helvetica", "normal");
        d.setFontSize(8);
        text(d, MUTED);
        d.text(label as string, x as number, y + 5);
        d.text("Date: ____ / ____ / ________", (x as number) + sigW, y + 5, { align: "right" });
    });

    /* ---------------- footer ---------------- */
    fill(d, NAVY);
    d.rect(0, H - 22, W, 22, "F");
    fill(d, ORANGE);
    d.rect(0, H - 22, W, 1.4, "F");
    drawLogo(d, M + 4, H - 11, 4.2);
    d.setFont("helvetica", "bold");
    d.setFontSize(9);
    text(d, WHITE);
    d.text("GlobexiaCorp", M + 12, H - 10);
    d.setFont("helvetica", "normal");
    d.setFontSize(8);
    text(d, [190, 194, 230]);
    d.text("routemasterpro899@gmail.com   |   www.routemasterglobal.com", W - M, H - 12, { align: "right" });
    d.text(`Track online: ${window.location.origin}/track/${tn}`, W - M, H - 7.5, { align: "right" });

    d.save(`Receipt_${tn}.pdf`);
}
