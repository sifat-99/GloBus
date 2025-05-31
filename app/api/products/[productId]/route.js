import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

export async function GET(request, { params }) {
    const { productId } = params;

    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const product = await db.collection('products').findOne({
            _id: new ObjectId(productId),
            status: 'approved' // Ensure only approved products are publicly accessible
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found or not available.' }, { status: 404 });
        }

        // Serialize _id and other ObjectIds if necessary for the client
        product._id = product._id.toString();
        if (product.sellerId) {
            product.sellerId = product.sellerId.toString();
        }
        // Add any other ObjectId fields that need string conversion

        return NextResponse.json(product, { status: 200 });

    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return NextResponse.json({ message: 'Failed to fetch product details.', details: error.message }, { status: 500 });
    }
}
