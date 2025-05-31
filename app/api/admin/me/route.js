// app/api/admin/me/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils'; // Adjust path as per your project structure
import { getDb } from '@/lib/db'; // Assuming admin profiles are in 'users' or a 'admins' collection
import { ObjectId } from 'mongodb';

async function getAdminProfile(adminId) {
    const db = await getDb();
    // Assuming admin specific details might be in the same user document or a linked 'adminProfiles' collection
    const admin = await db.collection('users').findOne({ _id: new ObjectId(adminId), role: 'admin' });

    if (!admin) return null;

    console.log(`Fetching profile for adminId: ${adminId}`);
    return {
        id: adminId,
        name: admin.name || 'Admin Shop', // from users collection
        email: admin.email, // from users collection
        phone: admin.phone || '', // from users collection
        description: admin.shopDescription || 'I am an admin', // from users collection
        memberSince: admin.createdAt || new Date().toISOString(),
        // Add other admin-specific fields like bank details (handle with care), policies, etc.
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied or invalid token.' }, { status: 403 });
    }

    try {
        const profileData = await getAdminProfile(userPayload.userId);
        if (!profileData) return NextResponse.json({ message: 'admin profile not found.' }, { status: 404 });
        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        return NextResponse.json({ message: 'Failed to fetch admin profile.' }, { status: 500 });
    }
}

export async function PUT(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied or invalid token.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        // Fields to update: shopName, phone, businessAddress, description etc.
        // Ensure you only update fields relevant to the admin profile.
        const db = await getDb();
        await db.collection('users').updateOne({ _id: new ObjectId(userPayload.userId) }, { $set: body }); // Be specific with $set
        return NextResponse.json({ message: 'admin profile updated successfully.' });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        return NextResponse.json({ message: 'Failed to update admin profile.', error: error.message }, { status: 500 });
    }
}
