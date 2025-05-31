import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils'; // Assuming @ refers to the root directory
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';

async function getUserProfile(userId) {
    const db = await getDb();
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        return null;
    }

    console.log(`Fetched profile for userId: ${userId}`);
    return {
        id: userId,
        name: user.name,
        email: user.email,
        address: user.address || '',
        deliveryAddress: user.deliveryAddress || user.address || '', // Default to address if deliveryAddress is not set
        phone: user.phone || '',
        dateJoined: user.createdAt || new Date().toISOString(),
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    try {
        const profileData = await getUserProfile(userPayload.userId);
        if (!profileData) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }
        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'Failed to fetch profile data.' }, { status: 500 });
    }
}

export async function PUT(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, phone, address, deliveryAddress } = body;

        const db = await getDb();
        const userCollection = db.collection('users');

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (deliveryAddress) updateData.deliveryAddress = deliveryAddress;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }

        const result = await userCollection.updateOne(
            { _id: new ObjectId(userPayload.userId) },
            { $set: updateData }
        );

        return NextResponse.json({ message: 'Profile updated successfully.', data: result });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ message: 'Failed to update profile data.', error: error.message }, { status: 500 });
    }
}
