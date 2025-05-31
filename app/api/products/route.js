// app/api/products/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchTermFromQuery = searchParams.get('category'); // Renamed for clarity
        const excludeProductId = searchParams.get('excludeProductId');
        const limitParam = searchParams.get('limit');
        const random = searchParams.get('random');

        const db = await getDb();
        const productsCollection = db.collection('products');

        let query = {};
        // By default, only show approved products unless fetching for a specific admin/seller context
        query.status = 'approved';

        if (searchTermFromQuery) {
            // Split the search term by spaces and filter out empty strings
            const individualTerms = searchTermFromQuery.split(/\s+/).filter(term => term.length > 0);

            if (individualTerms.length > 0) {
                const orConditions = [];
                individualTerms.forEach(term => {
                    // Add regex conditions for each term against both 'type' and 'category'
                    orConditions.push({ type: { $regex: term, $options: 'i' } });
                    orConditions.push({ category: { $regex: term, $options: 'i' } });
                });
                query.$or = orConditions;
            }
        }
        if (excludeProductId && ObjectId.isValid(excludeProductId)) {
            query._id = { $ne: new ObjectId(excludeProductId) };
        }

        let products;
        const limit = limitParam ? parseInt(limitParam, 10) : 0; // Default to 0 if not specified or invalid

        if (random === 'true' && limit > 0) {
            products = await productsCollection.aggregate([
                { $match: query },
                { $sample: { size: limit } }
            ]).toArray();
        } else {
            let cursor = productsCollection.find(query);
            if (limit > 0) {
                cursor = cursor.limit(limit);
            }
            // Optional: Add a default sort if not random, e.g., by newest, or most popular
            // cursor = cursor.sort({ createdAt: -1 }); // Example: newest first
            products = await cursor.toArray();
        }

        const serializableProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(),
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
