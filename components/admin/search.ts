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

export type SearchScope = "all" | "name" | "receiver" | "sender" | "tracking";

export const SCOPE_LABELS: Record<SearchScope, string> = {
    all: "Everything",
    name: "Any name",
    receiver: "Receiver name",
    sender: "Sender name",
    tracking: "Tracking number",
};

const scopedHaystack = (p: PackageData, scope: SearchScope, carrier?: string) => {
    switch (scope) {
        case "name":
            return norm(`${p.receiverName} \u0001 ${p.senderName}`);
        case "receiver":
            return norm(p.receiverName);
        case "sender":
            return norm(p.senderName);
        case "tracking":
            return norm(`${p.trackingNumber ?? ""} ${p.id}`);
        default:
            return orderHaystack(p, carrier);
    }
};

export const searchOrders = (
    packages: PackageData[],
    query: string,
    carrierName: (id: string) => string,
    scope: SearchScope = "all",
) => {
    if (!query.trim()) return packages;
    return packages.filter((p) => matchesTerms(scopedHaystack(p, scope, carrierName(p.carrierId)), query));
};

export type Person = { name: string; asReceiver: number; asSender: number };

/** Unique people (receivers and senders) whose name matches the query. */
export const searchPeople = (packages: PackageData[], query: string): Person[] => {
    if (!query.trim()) return [];
    const map = new Map<string, Person>();
    packages.forEach((p) => {
        (
            [
                [p.receiverName, "asReceiver"],
                [p.senderName, "asSender"],
            ] as const
        ).forEach(([name, key]) => {
            const n = (name || "").trim();
            if (!n || !matchesTerms(norm(n), query)) return;
            const k = norm(n);
            const cur = map.get(k) ?? { name: n, asReceiver: 0, asSender: 0 };
            cur[key] += 1;
            map.set(k, cur);
        });
    });
    return [...map.values()].sort((a, b) => b.asReceiver + b.asSender - (a.asReceiver + a.asSender));
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
