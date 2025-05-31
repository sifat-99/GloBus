import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
// import { getDb } from '@/lib/db';
// import { ObjectId } from 'mongodb';

async function getSellerSettings(sellerId) {
    // In a real app, fetch from database:
    // e.g., const settings = await db.sellerSettings.findUnique({ where: { sellerId: sellerId } });
    console.log(`Fetching settings for sellerId: ${sellerId}`);
    return {
        sellerId: sellerId,
        newOrderNotifications: { email: true, sms: false },
        lowStockAlerts: true,
        payoutMethod: 'Bank Transfer', // Placeholder
        vacationMode: false,
        returnPolicy: '30-day returns accepted.',
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    try {
        const settingsData = await getSellerSettings(userPayload.userId);
        return NextResponse.json(settingsData);
    } catch (error) {
        console.error('Error fetching seller settings:', error);
        return NextResponse.json({ message: 'Failed to fetch seller settings.' }, { status: 500 });
    }
}

export async function PUT(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        // const db = await getDb();
        // await db.collection('sellerSettings').updateOne({ sellerId: new ObjectId(userPayload.userId) }, { $set: body }, { upsert: true });
        console.log("Updating seller settings for:", userPayload.userId, "with data:", body); // Placeholder
        return NextResponse.json({ message: 'Seller settings updated successfully.' });
    } catch (error) {
        console.error('Error updating seller settings:', error);
        return NextResponse.json({ message: 'Failed to update seller settings.', error: error.message }, { status: 500 });
    }
}
