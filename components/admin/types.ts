export type PackageData = {
    comment: string;
    departureTime: string;
    expectedDeliveryDate: string;
    id: string;
    trackingNumber?: string;
    packageOrigin: string;
    destination: string;
    receiverName: string;
    receiverEmail: string;
    receiverPhone: string;
    receiverAddress: string;
    packageContent: string;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    weightKg: number;
    quantity: number;
    carrierId: string;
    deliveryType: string;
    transportMode: string;
    status?: string;
    currentPosition?: unknown;
    endCoordinates?: unknown;
    reason?: string;
};

export type Courier = {
    id: string;
    name: string;
};

export const STATUSES = ["in transit", "on hold", "delivered", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

export const statusLabel = (s?: string) =>
    (s || "unknown").replace(/\b\w/g, (c) => c.toUpperCase());

export const getCourierImage = (courierName?: string) => {
    switch ((courierName || "").toLowerCase()) {
        case "dhl":
            return "/images/dhl.svg";
        case "fedex":
            return "/images/fedex.svg";
        default:
            return "/images/usps.svg";
    }
};

export type AdminIntent = {
    nonce: number;
    query?: string;
    openId?: string;
    newOrder?: boolean;
};
