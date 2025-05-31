// app/api/products/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    try {
        const db = await getDb();
        const productsCollection = db.collection('products');

        // Fetch a limited number of products, e.g., latest 8, or sort by a "best-selling" metric if available
        // For now, let's fetch up to 8 products sorted by creation date (newest first)
        const products = await productsCollection.find().toArray();

        // Ensure products have an _id that is serializable and map _id to product_id
        // to match the structure expected by BestSellingSection.js (from testData.json)
        const serializableProducts = products.map(product => ({
            ...product,
            product_id: product._id.toString(), // Map _id to product_id
            _id: product._id.toString(), // Keep _id as well, converted to string
        }));

        return NextResponse.json(serializableProducts, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json(
            { message: 'Failed to fetch products', details: error.message },
            { status: 500 }
        );
    }
}
