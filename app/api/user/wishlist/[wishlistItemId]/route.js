// app/api/user/wishlist/[wishlistItemId]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/authUtils';

async function getVerifiedUserId(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return null;
    const userPayload = await verifyToken(token);
    return userPayload?.userId;
}

// Helper to validate ObjectId
function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

export async function DELETE(request, { params }) {
    const { wishlistItemId } = params;
    const userId = await getVerifiedUserId(request);

    if (!userId) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    if (!isValidObjectId(wishlistItemId)) {
        return NextResponse.json({ message: 'Invalid wishlist item ID format.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('wishlists').deleteOne({ _id: new ObjectId(wishlistItemId), userId: new ObjectId(userId) });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Wishlist item not found or not authorized.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Item removed from wishlist successfully.' });
}
