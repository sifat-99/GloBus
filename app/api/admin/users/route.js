// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db'; // Ensure this path is correct for your db utility

export async function GET(request) {
    try {
        const token = request.cookies.get('session-token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const adminPayload = await verifyToken(token);
        if (!adminPayload || adminPayload.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const db = await getDb();
        // Fetch all users, excluding their passwords.
        // Add other fields to exclude if necessary (e.g., paymentTokens, etc.)
        const users = await db.collection('users').find({ role: { $in: ['user', 'seller'] } }, { projection: { password: 0 } }).toArray();

        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        console.error('Error fetching users:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal Server Error while fetching users' }, { status: 500 });
    }
}
