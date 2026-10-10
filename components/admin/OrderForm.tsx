"use client";

import React, { useEffect, useState } from "react";
import { doc, setDoc, updateDoc } from "@firebase/firestore";
import { Loader2, Save } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { geocodeAddress } from "@/app/utils/geocodeAddress";
import { useAdminData } from "@/components/admin/AdminData";
import { useToaster } from "@/components/admin/Toaster";
import { Field, GhostButton, PrimaryButton, Sheet, inputCls } from "@/components/admin/ui";
import { PackageData, STATUSES, statusLabel } from "@/components/admin/types";

const EMPTY = {
    packageOrigin: "",
    destination: "",
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    receiverAddress: "",
    packageContent: "",
    senderName: "",
    senderEmail: "",
    status: "",
    senderPhone: "",
    senderAddress: "",
    weightKg: "",
    quantity: "",
    carrierId: "",
    deliveryType: "National Shipping",
    transportMode: "",
    expectedDeliveryDate: "",
    departureTime: "",
    comment: "",
};
type FormState = typeof EMPTY;

const fromPackage = (pkg: PackageData): FormState => ({
    packageOrigin: pkg.packageOrigin || "",
    destination: pkg.destination || "",
    receiverName: pkg.receiverName || "",
    receiverEmail: pkg.receiverEmail || "",
    receiverPhone: pkg.receiverPhone || "",
    receiverAddress: pkg.receiverAddress || "",
    packageContent: pkg.packageContent || "",
    senderName: pkg.senderName || "",
    status: pkg.status || "in transit",
    senderEmail: pkg.senderEmail || "",
    senderPhone: pkg.senderPhone || "",
    senderAddress: pkg.senderAddress || "",
    weightKg: pkg.weightKg?.toString() || "",
    quantity: pkg.quantity?.toString() || "",
    carrierId: pkg.carrierId || "",
    deliveryType: pkg.deliveryType || "National Shipping",
    transportMode: pkg.transportMode || "",
    expectedDeliveryDate: pkg.expectedDeliveryDate || "",
    departureTime: pkg.departureTime || "",
    comment: pkg.comment || "",
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-[22px] bg-white p-4 shadow-[0_14px_34px_-28px_rgba(18,18,63,0.5)] sm:p-5">
        <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#12123f]">
            <span className="h-4 w-1 rounded-full bg-[#ff5a0a]" />
            {title}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
);

/** Create / edit order panel. Submission logic is unchanged from the original dashboard. */
export default function OrderForm({
    open,
    onOpenChange,
    editing,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    editing: PackageData | null;
}) {
    const { couriers, refreshPackages } = useAdminData();
    const { toast } = useToaster();
    const [form, setForm] = useState<FormState>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setForm(editing ? fromPackage(editing) : EMPTY);
    }, [open, editing]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isNaN(Number(form.weightKg)) || isNaN(Number(form.quantity))) {
            toast("error", "Invalid Input", "Weight and quantity must be valid numbers.");
            return;
        }
        if (!form.carrierId) {
            toast("error", "Missing Carrier", "Please select a carrier.");
            return;
        }

        setSaving(true);
        try {
            const startCoordinates = await geocodeAddress(form.senderAddress);
            const endCoordinates = await geocodeAddress(form.receiverAddress);

            if (!startCoordinates || !endCoordinates) {
                toast("error", "Geocoding Failed", "Failed to get coordinates for addresses.");
                return;
            }

            if (editing) {
                try {
                    await updateDoc(doc(db, "packages", editing.id), {
                        ...form,
                        weightKg: Number(form.weightKg),
                        quantity: Number(form.quantity),
                        startCoordinates,
                        endCoordinates,
                    });
                    toast("success", "Package Updated", "Package information updated successfully.");
                } catch (error) {
                    console.error("Update error:", error);
                    toast("error", "Update Failed", "Failed to update package.");
                    return;
                }
            } else {
                const randomDigits = Math.random().toString().slice(2, 16);
                const trackingNumber = `RM${randomDigits}-SHIP`;
                try {
                    await setDoc(doc(db, "packages", trackingNumber), {
                        ...form,
                        trackingNumber,
                        weightKg: Number(form.weightKg),
                        quantity: Number(form.quantity),
                        status: "in transit",
                        currentPosition: startCoordinates,
                        endCoordinates,
                        reason: "",
                        expectedDeliveryDate: form.expectedDeliveryDate,
                        departureTime: form.departureTime,
                        comment: form.comment,
                    });
                    toast("success", "Tracking Number Generated", trackingNumber, {
                        label: "Copy number",
                        onClick: () => navigator.clipboard?.writeText(trackingNumber),
                    });
                } catch (error) {
                    console.error("Create error:", error);
                    toast("error", "Creation Failed", "Failed to create package.");
                    return;
                }
            }
            await refreshPackages();
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
            title={editing ? "Edit order" : "New order"}
            description={editing ? editing.trackingNumber || editing.id : "Fill in the shipment details to generate a tracking number."}
            width="sm:max-w-[720px]"
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <GhostButton type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </GhostButton>
                    <PrimaryButton type="submit" form="order-form" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {editing ? "Update package" : "Generate tracking number"}
                    </PrimaryButton>
                </div>
            }
        >
            <form id="order-form" onSubmit={submit} className="space-y-4">
                <Section title="Shipment">
                    <Field label="Package origin">
                        <input className={inputCls} name="packageOrigin" value={form.packageOrigin} onChange={onChange} required />
                    </Field>
                    <Field label="Destination">
                        <input className={inputCls} name="destination" value={form.destination} onChange={onChange} required />
                    </Field>
                    <Field label="Package content" className="sm:col-span-2">
                        <input className={inputCls} name="packageContent" value={form.packageContent} onChange={onChange} required />
                    </Field>
                    <Field label="Weight (kg)">
                        <input className={inputCls} type="number" name="weightKg" value={form.weightKg} onChange={onChange} required min="0" step="0.01" inputMode="decimal" />
                    </Field>
                    <Field label="Quantity">
                        <input className={inputCls} type="number" name="quantity" value={form.quantity} onChange={onChange} required min="1" inputMode="numeric" />
                    </Field>
                    <Field label="Carrier">
                        <select className={inputCls} name="carrierId" value={form.carrierId} onChange={onChange} required>
                            <option value="" disabled>
                                Select a carrier
                            </option>
                            {couriers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Transport mode">
                        <select className={inputCls} name="transportMode" value={form.transportMode} onChange={onChange} required>
                            <option value="" disabled>
                                Select transport mode
                            </option>
                            <option value="Air Freight">Air Freight</option>
                            <option value="Ship Freight">Ship Freight</option>
                            <option value="Truck Freight">Truck Freight</option>
                            <option value="Train Freight">Train Freight</option>
                        </select>
                    </Field>
                    <Field label="Delivery type">
                        <select className={inputCls} name="deliveryType" value={form.deliveryType} onChange={onChange}>
                            <option value="National Shipping">National Shipping</option>
                            <option value="International Shipping">International Shipping</option>
                        </select>
                    </Field>
                    {editing && (
                        <Field label="Status">
                            <select className={inputCls} name="status" value={form.status} onChange={onChange}>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {statusLabel(s)}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}
                </Section>

                <Section title="Receiver">
                    <Field label="Receiver name">
                        <input className={inputCls} name="receiverName" value={form.receiverName} onChange={onChange} required />
                    </Field>
                    <Field label="Receiver phone">
                        <input className={inputCls} type="tel" name="receiverPhone" value={form.receiverPhone} onChange={onChange} required />
                    </Field>
                    <Field label="Receiver email">
                        <input className={inputCls} type="email" name="receiverEmail" value={form.receiverEmail} onChange={onChange} required />
                    </Field>
                    <Field label="Receiver address">
                        <input className={inputCls} name="receiverAddress" value={form.receiverAddress} onChange={onChange} required />
                    </Field>
                </Section>

                <Section title="Sender">
                    <Field label="Sender name">
                        <input className={inputCls} name="senderName" value={form.senderName} onChange={onChange} required />
                    </Field>
                    <Field label="Sender phone">
                        <input className={inputCls} type="tel" name="senderPhone" value={form.senderPhone} onChange={onChange} required />
                    </Field>
                    <Field label="Sender email">
                        <input className={inputCls} type="email" name="senderEmail" value={form.senderEmail} onChange={onChange} required />
                    </Field>
                    <Field label="Sender address">
                        <input className={inputCls} name="senderAddress" value={form.senderAddress} onChange={onChange} required />
                    </Field>
                </Section>

                <Section title="Schedule & notes">
                    <Field label="Expected delivery date">
                        <input className={inputCls} type="date" name="expectedDeliveryDate" value={form.expectedDeliveryDate} onChange={onChange} required />
                    </Field>
                    <Field label="Departure time">
                        <input className={inputCls} type="time" name="departureTime" value={form.departureTime} onChange={onChange} required />
                    </Field>
                    <Field label="Comment" className="sm:col-span-2">
                        <textarea
                            className={`${inputCls} h-auto min-h-[96px] resize-y py-3`}
                            name="comment"
                            value={form.comment}
                            onChange={onChange}
                            rows={3}
                            placeholder="Optional comment about the package or delivery"
                        />
                    </Field>
                </Section>
            </form>
        </Sheet>
    );
}
