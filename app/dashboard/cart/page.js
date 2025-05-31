'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // If you have image URLs

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCartData = async () => {
            try {
                const data = await fetchData('/api/user/cart');
                setCartItems(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadCartData();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading cart...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading cart: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Cart</h1>
            {cartItems.length > 0 ? (
                <div className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.productId} className="flex items-center p-4 border rounded-lg shadow">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded mr-4" />}
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold">{item.name}</h2>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: ${item.price.toFixed(2)} each</p>
                            </div>
                            <p className="text-lg font-semibold">Subtotal: ${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="text-right mt-6">
                        <Link href="/checkout" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Proceed to Checkout</Link>
                    </div>
                </div>
            ) : <p>Your cart is empty.</p>}
        </div>
    );
}
