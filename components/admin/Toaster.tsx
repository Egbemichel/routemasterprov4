"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";
type ToastItem = { id: number; type: ToastType; title: string; subtitle?: string; action?: { label: string; onClick: () => void } };
type ConfirmState = { title: string; subtitle: string; confirmLabel: string; danger: boolean; resolve: (v: boolean) => void } | null;

type ToasterValue = {
    toast: (type: ToastType, title: string, subtitle?: string, action?: ToastItem["action"]) => void;
    confirm: (title: string, subtitle: string, opts?: { confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
};

const Ctx = createContext<ToasterValue | null>(null);
export const useToaster = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error("useToaster must be used inside <ToasterProvider>");
    return v;
};

const ICONS = {
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-sky-500" />,
};

export function ToasterProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState>(null);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => setItems((p) => p.filter((t) => t.id !== id)), []);

    const toast = useCallback<ToasterValue["toast"]>(
        (type, title, subtitle, action) => {
            const id = ++idRef.current;
            setItems((p) => [...p.slice(-3), { id, type, title, subtitle, action }]);
            setTimeout(() => dismiss(id), action ? 9000 : 5000);
        },
        [dismiss],
    );

    const confirm = useCallback<ToasterValue["confirm"]>(
        (title, subtitle, opts) =>
            new Promise<boolean>((resolve) =>
                setConfirmState({ title, subtitle, confirmLabel: opts?.confirmLabel ?? "Confirm", danger: opts?.danger ?? true, resolve }),
            ),
        [],
    );

    const settle = (v: boolean) => {
        confirmState?.resolve(v);
        setConfirmState(null);
    };

    return (
        <Ctx.Provider value={{ toast, confirm }}>
            {children}

            {/* toasts */}
            <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[380px]" aria-live="polite">
                {items.map((t) => (
                    <div
                        key={t.id}
                        className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white bg-white p-4 shadow-[0_24px_50px_-20px_rgba(18,18,63,0.55)] animate-in slide-in-from-top-4 fade-in-0 duration-300"
                    >
                        <span className="mt-0.5">{ICONS[t.type]}</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[#12123f]">{t.title}</p>
                            {t.subtitle && <p className="mt-0.5 break-words text-[13px] text-[#12123f]/60">{t.subtitle}</p>}
                            {t.action && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        t.action!.onClick();
                                        dismiss(t.id);
                                    }}
                                    className="mt-2 rounded-full bg-[#ff5a0a]/10 px-3 py-1 text-[12px] font-semibold text-[#ff5a0a] hover:bg-[#ff5a0a]/20"
                                >
                                    {t.action.label}
                                </button>
                            )}
                        </div>
                        <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-[#12123f]/40 hover:text-[#12123f]">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* confirm dialog */}
            <Dialog.Root open={!!confirmState} onOpenChange={(o) => !o && settle(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#12123f]/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white p-7 shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
                        <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", confirmState?.danger ? "bg-red-50 text-red-500" : "bg-[#ff5a0a]/10 text-[#ff5a0a]")}>
                            <AlertTriangle size={22} />
                        </span>
                        <Dialog.Title className="mt-4 text-[20px] font-semibold text-[#12123f]">{confirmState?.title}</Dialog.Title>
                        <Dialog.Description className="mt-1.5 text-[14px] leading-relaxed text-[#12123f]/60">{confirmState?.subtitle}</Dialog.Description>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => settle(false)} className="rounded-full border border-[#12123f]/15 px-6 py-3 text-[14px] font-medium text-[#12123f] hover:bg-[#eef0fb]">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => settle(true)}
                                className={cn("rounded-full px-6 py-3 text-[14px] font-semibold text-white", confirmState?.danger ? "bg-red-500 hover:bg-red-600" : "bg-[#ff5a0a] hover:bg-[#e84800]")}
                            >
                                {confirmState?.confirmLabel}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Ctx.Provider>
    );
}
