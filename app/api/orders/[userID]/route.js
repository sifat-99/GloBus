import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
    const db = await getDb();
    const database = db.collection('orders');

    const { userID } = await params;
    console.log(userID)

    try {
        const userOrders = await database.find({ userId: userID }).toArray();
        console.log('Fetched user orders:', userOrders);
        if (!userOrders) {
            return NextResponse.json({ message: 'No orders found for this user.' }, { status: 404 });
        }
        // If no orders are found, return a 404 response

        if (userOrders.length === 0) {
            return NextResponse.json({ message: 'No orders found for this user.' }, { status: 404 });
        }

        return NextResponse.json(userOrders);
    } catch (error) {
        return NextResponse.json({ message: 'Database error.' }, { status: 500 });
    }
}
