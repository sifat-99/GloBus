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

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadWishlistData = async () => {
            try {
                const data = await fetchData('/api/user/wishlist');
                setWishlistItems(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadWishlistData();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading wishlist...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading wishlist: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map(item => (
                        <div key={item.productId} className="p-4 border rounded-lg shadow">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={200} height={200} className="w-full h-48 object-cover rounded mb-2" />}
                            <h2 className="text-xl font-semibold">{item.name}</h2>
                            <p className="text-gray-700">${item.price.toFixed(2)}</p>
                            {item.addedDate && <p className="text-sm text-gray-500">Added: {new Date(item.addedDate).toLocaleDateString()}</p>}
                            <div className="mt-3">
                                <Link href={`/products/${item.productId}`} className="text-indigo-600 hover:text-indigo-800 mr-2">View Product</Link>
                                {/* Add a "Remove from Wishlist" button here */}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p>Your wishlist is empty.</p>}
        </div>
    );
}
