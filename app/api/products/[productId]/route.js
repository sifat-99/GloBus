// app/api/products/[productId]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Helper to validate ObjectId
function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

export async function GET(request, { params }) {
    const { productId } = params;

    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const productsCollection = db.collection('products');

        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // Ensure _id is serialized
        const serializableProduct = { ...product, _id: product._id.toString() };

        return NextResponse.json(serializableProduct, { status: 200 });
    } catch (error) {
        console.error(`Failed to fetch product ${productId}:`, error);
        return NextResponse.json({ message: 'Failed to fetch product', details: error.message }, { status: 500 });
    }
}
