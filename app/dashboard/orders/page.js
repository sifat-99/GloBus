'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Keep Link if you plan to link to individual order details

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrdersData = async () => {
            try {
                const ordersData = await fetchData('/api/user/orders');
                setOrders(ordersData);
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
                        <li key={order.id} className="p-4 border rounded-lg shadow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-4">
                                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                                <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
                                    <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs sm:text-sm rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></p>
                            </div>

                            <div className="mt-1">
                                <h3 className="font-medium text-md mb-1">Items:</h3>
                                <ul className="list-disc pl-5 space-y-0.5 text-sm">
                                    {order.items.map((item, index) => (
                                        <li key={index}>{item.name} (Qty: {item.quantity})</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Optional: Link to a detailed order view page */}
                            {/* <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline mt-2 inline-block">View Details</Link> */}
                        </li>
                    ))}
                </ul>
            ) : <p>You have no orders yet.</p>}
        </div>
    );
}
