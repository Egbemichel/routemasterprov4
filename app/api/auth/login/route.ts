// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

const allowedAdmins = ['besongtambe72@gmail.com', 'egbemichel39@gmail.com','harrisonwusegho237@gmail.com'];

export async function POST(req: Request) {
    const { token } = await req.json();

    try {
        const decoded = await adminAuth.verifyIdToken(token);

        if (!decoded.email || !allowedAdmins.includes(decoded.email)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const res = NextResponse.json({ success: true });

        res.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return res;
    } catch (err) {
        console.error('Invalid token:', err);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
