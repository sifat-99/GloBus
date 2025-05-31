import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

async function getSellerDashboardOverview(sellerId) {
    const db = await getDb();
    const sellerObjectId = new ObjectId(sellerId);

    const productsCollection = db.collection('products');
    const ordersCollection = db.collection('orders'); // Assuming you have an orders collection

    const totalProducts = await productsCollection.countDocuments({ sellerId: sellerObjectId });
    const activeListings = await productsCollection.countDocuments({ sellerId: sellerObjectId, stock: { $gt: 0 }, status: 'Active' }); // Example status

    // Get current date for "today's orders"
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const newOrdersToday = await ordersCollection.countDocuments({
        sellerId: sellerObjectId, // Assuming orders also store sellerId
        orderDate: { $gte: todayStart, $lte: todayEnd }
    });

    const pendingShipment = await ordersCollection.countDocuments({ sellerId: sellerObjectId, status: 'Processing' }); // Example status

    // Calculate total sales for the current month
    const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const salesThisMonthCursor = await ordersCollection.aggregate([
        { $match: { sellerId: sellerObjectId, status: 'Delivered', orderDate: { $gte: currentMonthStart } } }, // Or 'Completed'
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const salesData = await salesThisMonthCursor.toArray();
    const totalSalesMonth = salesData.length > 0 ? salesData[0].totalSales : 0;

    const sellerProfile = await db.collection('users').findOne({ _id: sellerObjectId });

    console.log(`Fetching dashboard overview for sellerId: ${sellerId}`);
    return {
        totalProducts,
        activeListings,
        newOrdersToday,
        pendingShipment,
        totalSalesMonth,
        shopName: sellerProfile?.shopName || "Seller's Shop",
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    try {
        const overviewData = await getSellerDashboardOverview(userPayload.userId);
        return NextResponse.json(overviewData);
    } catch (error) {
        console.error('Error fetching seller dashboard overview:', error);
        return NextResponse.json({ message: 'Failed to fetch seller dashboard data.' }, { status: 500 });
    }
}
