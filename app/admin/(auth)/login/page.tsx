'use client';

import React, { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/usercomponents/Logo";
import Model3D, { LazyMount } from "@/usercomponents/three/Model3D";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const router = useRouter();
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setBusy(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            router.push("/admin/dashboard");
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
            }
            setError("We couldn't sign you in. Check your email and password and try again.");
            setBusy(false);
        }
    };

    const field =
        "h-14 w-full rounded-2xl border border-[#12123f]/12 bg-white pl-12 pr-4 text-[15px] text-[#12123f] placeholder:text-[#12123f]/35 outline-none transition-all focus:border-[#ff5a0a] focus:ring-4 focus:ring-[#ff5a0a]/15";

    return (
        <div className="grid min-h-[100svh] bg-[#eef0fb] font-display lg:grid-cols-[1.05fr_1fr]">
            {/* brand panel */}
            <aside className="relative hidden overflow-hidden bg-[#12123f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#ff5a0a]/35 blur-[110px]" />
                <div className="pointer-events-none absolute -bottom-32 right-0 h-[380px] w-[380px] rounded-full bg-[#4b52ff]/30 blur-[120px]" />
                <Logo textClassName="text-white" />
                <div className="relative mx-auto h-[380px] w-full max-w-[520px]">
                    <LazyMount className="absolute inset-0">
                        <Model3D kind="container" tilt={0.25} />
                    </LazyMount>
                </div>
                <div className="relative">
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#ff8a3d]">Admin panel</p>
                    <h2 className="mt-3 max-w-[460px] text-[clamp(2rem,3.4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.04em]">
                        Moving what matters <span className="text-[#ff7a1a]">most.</span>
                    </h2>
                    <p className="mt-3 max-w-[400px] text-[15px] text-white/60">Manage orders, couriers and tracking, all in one place.</p>
                </div>
            </aside>

            {/* form */}
            <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
                <div className="mx-auto w-full max-w-[440px]">
                    <div className="mb-10 lg:hidden">
                        <Logo />
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5a0a]/10 text-[#ff5a0a]">
                        <ShieldCheck size={24} />
                    </span>
                    <h1 className="mt-5 text-[clamp(2rem,4vw,2.6rem)] font-medium leading-tight tracking-[-0.035em] text-[#12123f]">Welcome back</h1>
                    <p className="mt-1.5 text-[15px] text-[#12123f]/55">Sign in to the GlobexiaCorp admin panel.</p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-4" noValidate={false}>
                        <label className="relative block">
                            <span className="sr-only">Email</span>
                            <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#12123f]/40" />
                            <input type="email" required autoComplete="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={field} />
                        </label>
                        <label className="relative block">
                            <span className="sr-only">Password</span>
                            <Lock size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#12123f]/40" />
                            <input type={show ? "text" : "password"} required autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={`${field} pr-12`} />
                            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#12123f]/50 hover:bg-[#eef0fb]">
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </label>

                        {error && (
                            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-600">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={busy}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ff4d00] text-[16px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,90,10,0.85)] transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                        >
                            {busy ? <Loader2 size={20} className="animate-spin" /> : null}
                            {busy ? "Signing in…" : "Login"}
                        </button>
                    </form>

                    <button type="button" onClick={() => router.push("/")} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#12123f]/15 text-[15px] font-medium text-[#12123f] transition-colors hover:bg-white">
                        <ArrowLeft size={18} /> Back to homepage
                    </button>
                </div>
            </main>
        </div>
    );
}
