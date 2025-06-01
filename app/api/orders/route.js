import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
    try {
        const orderPayload = await request.json();

        const db = await getDb();
        const ordersCollection = db.collection('orders');

        console.log('Received order payload on backend:', orderPayload);

        // Add a timestamp for when the order was created in the database
        const orderToInsert = {
            ...orderPayload,
            createdAt: new Date(),
        };

        const result = await ordersCollection.insertOne(orderToInsert);

        if (!result.insertedId) {
            throw new Error('Failed to insert order into database.');
        }

        // Retrieve the inserted document to include it in the response
        const savedOrder = await ordersCollection.findOne({ _id: result.insertedId });

        return NextResponse.json({ message: 'Order created successfully', order: savedOrder }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { params } = new URL(request.url);
        // const userId = params.get('userId');
        console.log('Fetching orders for userId:', params);
        if (!params) {
            return NextResponse.json({ message: 'Missing userId in query parameters' }, { status: 400 });
        }

        const db = await getDb();
        const ordersCollection = db.collection('orders');

        const userOrders = await ordersCollection.find().toArray();
        console.log('Fetched user orders:', userOrders);

        return NextResponse.json({ orders: userOrders }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
    }
}
