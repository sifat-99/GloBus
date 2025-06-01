import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, context) {
    const db = await getDb();
    const collection = db.collection('orders');

    const { sellerID } = await context.params; // ✅ correctly await context, then destructure

    try {
        // Fetch only orders where one of the items has matching sellerId
        const sellerOrders = await collection.find({
            items: {
                $elemMatch: { sellerId: sellerID }
            }
        }).toArray();

        if (sellerOrders.length === 0) {
            return NextResponse.json(
                { message: 'No orders found for this seller.' },
                { status: 404 }
            );
        }

        return NextResponse.json(sellerOrders);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { message: 'Database error.' },
            { status: 500 }
        );
    }
}
