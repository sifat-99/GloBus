// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10); // Default 10 items per page
        const skip = (page - 1) * limit;

        const db = await getDb();
        const productsCollection = db.collection('products'); // Ensure you have a 'products' collection

        const products = await productsCollection.find({})
            .sort({ createdAt: -1 }) // Optional: sort by creation date
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalProducts = await productsCollection.countDocuments({});
        const totalPages = Math.ceil(totalProducts / limit);

        // Ensure products have an _id that is serializable
        const serializableProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(), // Convert ObjectId to string
        }));

        return NextResponse.json({
            products: serializableProducts,
            currentPage: page,
            totalPages,
            totalProducts,
        }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ message: 'Failed to fetch products', details: error.message }, { status: 500 });
    }
}
