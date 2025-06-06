'use client';

import React, { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

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
        }
    };

    return (
        <>
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto mt-20">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border w-full p-2" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border w-full p-2" />
                <button type="submit" className="bg-blue-600 text-white p-2 w-full">Login</button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
            <div>
                <button type="button" onClick={() => router.push("/")} className="border-primary-200 text-black bg-transparent p-2 w-full rounded-2xl">Back to homepage</button>
            </div>
        </>
    );
}
