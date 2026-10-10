import { Courier, PackageData } from "@/components/admin/types";

/** Lower-case, strip accents, collapse whitespace. */
export const norm = (s: unknown) =>
    String(s ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

export const orderHaystack = (p: PackageData, carrier?: string) =>
    norm(
        [
            p.trackingNumber,
            p.id,
            p.receiverName,
            p.receiverEmail,
            p.receiverPhone,
            p.receiverAddress,
            p.senderName,
            p.senderEmail,
            p.senderPhone,
            p.senderAddress,
            p.packageOrigin,
            p.destination,
            p.packageContent,
            p.status,
            p.deliveryType,
            p.transportMode,
            p.expectedDeliveryDate,
            p.comment,
            carrier,
        ].join(" \u0001 "),
    );

/** Every whitespace-separated term must appear somewhere (AND search). */
export const matchesTerms = (haystack: string, query: string) => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    return terms.every((t) => haystack.includes(t));
};

export const searchOrders = (
    packages: PackageData[],
    query: string,
    carrierName: (id: string) => string,
) => {
    if (!query.trim()) return packages;
    return packages.filter((p) => matchesTerms(orderHaystack(p, carrierName(p.carrierId)), query));
};

export const searchCouriers = (couriers: Courier[], query: string) =>
    !query.trim() ? couriers : couriers.filter((c) => matchesTerms(norm(c.name), query));

/** Split text into [plain, match, plain, match…] segments for highlighting. */
export const highlightParts = (text: string, query: string) => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length || !text) return [{ t: text, hit: false }];
    const lower = norm(text);
    // norm() can change string length for accented text; fall back to plain text if it does.
    if (lower.length !== text.length) return [{ t: text, hit: false }];
    const marks = new Array(text.length).fill(false);
    terms.forEach((term) => {
        let i = lower.indexOf(term);
        while (i !== -1) {
            for (let k = i; k < i + term.length; k++) marks[k] = true;
            i = lower.indexOf(term, i + term.length);
        }
    });
    const parts: { t: string; hit: boolean }[] = [];
    let cur = "";
    let curHit = marks[0];
    for (let i = 0; i < text.length; i++) {
        if (marks[i] !== curHit) {
            parts.push({ t: cur, hit: curHit });
            cur = "";
            curHit = marks[i];
        }
        cur += text[i];
    }
    parts.push({ t: cur, hit: curHit });
    return parts;
};
