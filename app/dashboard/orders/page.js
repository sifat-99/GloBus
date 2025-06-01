'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Keep Link if you plan to link to individual order details
import axios from 'axios';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
        const user = localStorage.getItem('user'); // Assuming user data is stored in localStorage
        const userId = user ? JSON.parse(user)._id : null; // Extract user ID from stored user data
        const loadOrdersData = async () => {
            try {
                const ordersData = await axios.get(`/api/orders/${userId}`); // Adjust the endpoint as needed
                if (!ordersData.data || !Array.isArray(ordersData.data)) {
                    throw new Error('Invalid orders data format');
                }
                // console.log('Fetched orders:', ordersData.data);
                setOrders(ordersData.data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadOrdersData();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading orders...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading orders: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">My Orders</h1>
            {orders.length > 0 ? (
                <ul className="space-y-4">
                    {orders.map(order => (
                        <li key={order._id} className="p-4 border rounded-lg shadow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-4">
                                <h2 className="text-xl font-semibold">Order #{order._id}</h2>
                                <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
                                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <p><strong>Status:</strong>
                                    <span className={`ml-1 ${order.transactionId ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.transactionId ? ' Paid' : ' Unpaid'}
                                    </span>
                                </p>
                                <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                                <p><strong>Shipping Address:</strong> {order.customerDetails.deliveryAddress || 'N/A'}</p>

                                <p><strong>Status:</strong> {order.orderStatus || 'N/A'}</p>


                            </div>

                            <div className="mt-1">
                                <h3 className="font-medium text-md mb-1">Items:</h3>
                                <ul className="list-disc pl-5 space-y-0.5 text-sm">
                                    {order.items.map((item, index) => (
                                        <li key={index}>{item.name} (Qty: {item.quantity})</li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p>You have no orders yet.</p>}
        </div>
    );
}
