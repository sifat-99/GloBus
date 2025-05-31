import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

export async function GET(request, { params }) {
    const { productId: identifier } = await params; // Renamed to identifier for clarity

    try {
        const db = await getDb();
        let query;

        if (isValidObjectId(identifier)) {
            query = {
                _id: new ObjectId(identifier),
                status: 'approved' // Ensure only approved products are publicly accessible
            };
        } else {
            // If not a valid ObjectId, assume it's a product name (model)
            // Use a case-insensitive regex for searching by name
            query = {
                model: { $regex: `^${identifier}$`, $options: 'i' }, // Exact match, case-insensitive
                status: 'approved'
            };
        }
        const product = await db.collection('products').findOne(query);

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
        console.error(`Error fetching product ${identifier}:`, error);
        return NextResponse.json({ message: 'Failed to fetch product details.', details: error.message }, { status: 500 });
    }
}
