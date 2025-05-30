// app/api/auth/logout/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Clear the session-token cookie
        cookies().set('session-token', '', { httpOnly: true, path: '/', maxAge: 0 });

        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Logout failed', details: error.message }, { status: 500 });
    }
}
