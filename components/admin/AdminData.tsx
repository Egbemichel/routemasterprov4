"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "@firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Courier, PackageData } from "@/components/admin/types";

type AdminDataValue = {
    packages: PackageData[];
    couriers: Courier[];
    loading: boolean;
    refreshPackages: () => Promise<void>;
    refreshCouriers: () => Promise<void>;
    removePackageLocal: (id: string) => void;
    carrierName: (id: string) => string;
};

const Ctx = createContext<AdminDataValue | null>(null);

export const useAdminData = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAdminData must be used inside <AdminDataProvider>");
    return v;
};

/** Loads packages and couriers once and shares them with every admin view and the global search. */
export function AdminDataProvider({ children, mock }: { children: React.ReactNode; mock?: { packages: PackageData[]; couriers: Courier[] } }) {
    const [packages, setPackages] = useState<PackageData[]>(mock?.packages ?? []);
    const [couriers, setCouriers] = useState<Courier[]>(mock?.couriers ?? []);
    const [loading, setLoading] = useState(!mock);

    const refreshPackages = useCallback(async () => {
        if (mock) return; // preview / test mode: no network
        try {
            const snapshot = await getDocs(collection(db, "packages"));
            setPackages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PackageData[]);
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    }, [mock]);

    const refreshCouriers = useCallback(async () => {
        if (mock) return;
        try {
            const snapshot = await getDocs(collection(db, "couriers"));
            setCouriers(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Courier, "id">) })));
        } catch (error) {
            console.error("Error fetching couriers:", error);
        }
    }, [mock]);

    useEffect(() => {
        let alive = true;
        (async () => {
            await Promise.all([refreshPackages(), refreshCouriers()]);
            if (alive) setLoading(false);
        })();
        return () => {
            alive = false;
        };
    }, [refreshPackages, refreshCouriers]);

    const names = useMemo(() => {
        const m: Record<string, string> = {};
        couriers.forEach((c) => (m[c.id] = c.name));
        return m;
    }, [couriers]);

    const value = useMemo<AdminDataValue>(
        () => ({
            packages,
            couriers,
            loading,
            refreshPackages,
            refreshCouriers,
            removePackageLocal: (id) => setPackages((p) => p.filter((x) => x.id !== id)),
            carrierName: (id) => (id ? names[id] || id : "Unknown"),
        }),
        [packages, couriers, loading, refreshPackages, refreshCouriers, names],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
