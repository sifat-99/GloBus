import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db'; // Assuming seller profiles are in 'users' or a 'sellers' collection
import { ObjectId } from 'mongodb';

async function getSellerProfile(sellerId) {
    const db = await getDb();
    // Assuming seller specific details might be in the same user document or a linked 'sellerProfiles' collection
    const seller = await db.collection('users').findOne({ _id: new ObjectId(sellerId), role: 'seller' });

    if (!seller) return null;

    console.log(`Fetching profile for sellerId: ${sellerId}`);
    return {
        id: sellerId,
        shopName: seller.shopName || 'My Awesome Shop',
        email: seller.email, // from users collection
        phone: seller.phone || '', // from users collection
        businessAddress: seller.businessAddress || '123 Seller Street, Commerce City',
        description: seller.shopDescription || 'Selling the best widgets!',
        memberSince: seller.createdAt || new Date().toISOString(),
        // Add other seller-specific fields like bank details (handle with care), policies, etc.
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token.' }, { status: 403 });
    }

    try {
        const profileData = await getSellerProfile(userPayload.userId);
        if (!profileData) return NextResponse.json({ message: 'Seller profile not found.' }, { status: 404 });
        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Error fetching seller profile:', error);
        return NextResponse.json({ message: 'Failed to fetch seller profile.' }, { status: 500 });
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
        // Fields to update: shopName, phone, businessAddress, description etc.
        // Ensure you only update fields relevant to the seller profile.
        const db = await getDb();
        await db.collection('users').updateOne({ _id: new ObjectId(userPayload.userId) }, { $set: body }); // Be specific with $set
        return NextResponse.json({ message: 'Seller profile updated successfully.' });
    } catch (error) {
        console.error('Error updating seller profile:', error);
        return NextResponse.json({ message: 'Failed to update seller profile.', error: error.message }, { status: 500 });
    }
}
