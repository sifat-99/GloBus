import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';

// Placeholder for database interaction
async function getUserOrders(userId) {
    // In a real app, fetch from database:
    // e.g., const orders = await db.order.findMany({ where: { userId: userId }, orderBy: { orderDate: 'desc' } });
    console.log(`Fetching orders for userId: ${userId}`);
    return [
        { id: 'order123', date: '2024-05-01', status: 'Delivered', total: 99.99, items: [{ name: 'Product A', quantity: 1 }] },
        { id: 'order124', date: '2024-05-10', status: 'Shipped', total: 45.50, items: [{ name: 'Product B', quantity: 2 }] },
        { id: 'order125', date: '2024-05-15', status: 'Processing', total: 120.00, items: [{ name: 'Product C', quantity: 1 }, { name: 'Product D', quantity: 3 }] },
    ];
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

    // Optional: Check if the role is 'user' if these APIs are strictly for users
    // if (userPayload.role !== 'user') {
    //     return NextResponse.json({ message: 'Access denied.' }, { status: 403 });
    // }

    try {
        const ordersData = await getUserOrders(userPayload.userId);
        return NextResponse.json(ordersData);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ message: 'Failed to fetch orders data.' }, { status: 500 });
    }
}
