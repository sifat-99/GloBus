'use client';

import axios from 'axios';
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
    const [userDetails, setUserDetails] = useState(null);


    useEffect(() => {
        const user = localStorage.getItem('user'); // Assuming user data is stored in localStorage
        const userId = user ? JSON.parse(user)._id : null; // Extract user ID from stored user data
        setUserDetails(userId);

        const loadOrders = async () => {
            try {
                const data = await fetchData(`/api/seller/orders/${userId}`);
                setOrders(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (loading) return <div className="container mx-auto p-2 sm:p-4 text-center"><p className="text-lg">Loading orders...</p></div>;
    if (error) return <div className="container mx-auto p-2 sm:p-4 text-center"><p className="text-red-500 text-lg">Error: {error}</p></div>;

    return (
        <div className="container mx-auto p-2 sm:p-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Sales Orders</h1>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order._id} className="p-3 sm:p-4 border rounded-lg shadow bg-white">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                <h2 className="text-lg sm:text-xl font-semibold text-indigo-700">Order ID: {order._id}</h2>
                                <span className={`px-2 py-1 text-xs sm:text-sm font-semibold rounded-full self-start sm:self-center mt-1 sm:mt-0 ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Customer:</strong> {order.customerDetails?.name}</p>
                                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Total:</strong> ৳{order.totalAmount?.toFixed(2)}</p>
                            </div>
                            <div className="mt-3 text-right">
                                <button className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                                    View Details
                                </button>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-md sm:text-lg font-semibold mb-2">Items:</h3>
                                <ul className="space-y-2">
                                    {order.items
                                        .filter(item => item.sellerId == userDetails)
                                        .map(item => (
                                            <li key={item.productId} className="flex justify-between items-center">
                                                <span>{item.name} (x{item.quantity})</span>
                                                <span className="text-gray-700">৳{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-center text-gray-600 mt-4 text-sm sm:text-base">You have no orders yet.</p>}
        </div>
    );
}
