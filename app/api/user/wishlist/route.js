import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Placeholder for database interaction
async function getUserWishlist(userId) {
    const db = await getDb();
    const wishlistItems = await db.collection('wishlists').find({ userId: new ObjectId(userId) }).toArray();
    console.log(`Fetching wishlist for userId: ${userId}`);
    return wishlistItems.map(item => ({ ...item, _id: item._id.toString(), productId: item.productId.toString() }));
    // Example if you were storing full product details:
    // return [ { productId: 'prod202', name: 'Fancy Watch', price: 199.50, imageUrl: '/placeholder-image.jpg', addedDate: '2024-04-20' },];
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
        const wishlistData = await getUserWishlist(userPayload.userId);
        return NextResponse.json(wishlistData);
    } catch (error) {
        console.error('Error fetching user wishlist:', error);
        return NextResponse.json({ message: 'Failed to fetch wishlist data.' }, { status: 500 });
    }
}

export async function POST(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
        }

        const db = await getDb();
        const productsCollection = db.collection('products');
        const wishlistsCollection = db.collection('wishlists');

        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        const existingWishlistItem = await wishlistsCollection.findOne({
            userId: new ObjectId(userPayload.userId),
            productId: new ObjectId(productId),
        });

        if (existingWishlistItem) {
            return NextResponse.json({ message: 'Product already in wishlist.' }, { status: 409 }); // 409 Conflict
        }

        const wishlistItem = {
            userId: new ObjectId(userPayload.userId),
            productId: new ObjectId(productId),
            productName: product.model, // or product.name
            price: product.discount?.discounted_price || product.price,
            imageUrl: product.image_url,
            addedAt: new Date(),
        };

        await wishlistsCollection.insertOne(wishlistItem);
        return NextResponse.json({ message: 'Product added to wishlist.' }, { status: 201 });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ message: 'Failed to add product to wishlist.', error: error.message }, { status: 500 });
    }
}
