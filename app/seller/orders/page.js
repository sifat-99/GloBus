'use client';

import { useEffect, useState } from 'react';

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchData('/api/seller/orders');
                setOrders(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading orders...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Sales Orders</h1>
            {orders.length > 0 ? (
                <ul className="space-y-4">
                    {orders.map(order => (
                        <li key={order.orderId} className="p-4 border rounded-lg shadow">
                            <h2 className="text-xl font-semibold">Order ID: {order.orderId}</h2>
                            <p><strong>Customer:</strong> {order.customerName}</p>
                            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            {/* Add button to view order details or update status */}
                        </li>
                    ))}
                </ul>
            ) : <p>You have no orders yet.</p>}
        </div>
    );
}
