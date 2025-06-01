'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
            setLoading(true);
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

    const handleRemoveFromWishlist = async (wishlistItemId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to remove this item from your wishlist?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/user/wishlist/${wishlistItemId}`, {
                        method: 'DELETE',
                    });
                    const resData = await response.json();
                    if (!response.ok) throw new Error(resData.message || 'Failed to remove item');

                    setWishlistItems(prevItems => prevItems.filter(item => item._id !== wishlistItemId));
                    Swal.fire('Removed!', resData.message || 'Item removed from wishlist.', 'success');
                } catch (err) {
                    setError(err.message);
                    Swal.fire('Error', err.message || 'Could not remove item from wishlist.', 'error');
                }
            }
        });
    };

    if (loading) return <div className="container mx-auto p-4"><p>Loading wishlist...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading wishlist: {error}</p></div>;

    const cardVariants = {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } },
        hover: { scale: 1.03, boxShadow: "0px 8px 15px rgba(0,0,0,0.1)" }
    };

    const gridContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">My Wishlist</h1>
            {wishlistItems.length > 0 ? (
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={gridContainerVariants} initial="hidden" animate="visible">
                    <AnimatePresence>
                    {wishlistItems.map(item => (
                        <motion.div key={item._id} variants={cardVariants} exit="exit" whileHover="hover" layout className="p-4 border rounded-lg shadow flex flex-col">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.productName || 'Product Image'} width={200} height={200} className="w-full h-48 object-cover rounded mb-2" />}
                            <div className="flex-grow"> {/* Wraps content to allow actions to be pushed to the bottom */}
                                <h2 className="text-xl font-semibold">{item.productName || 'Product Name N/A'}</h2>
                                <p className="text-gray-700">৳{item.price.toFixed(2)}</p>
                                {item.addedDate && <p className="text-sm text-gray-500 mb-2">Added: {new Date(item.addedDate).toLocaleDateString()}</p>}
                            </div>
                            <div className="mt-auto pt-3"> {/* mt-auto pushes this block to the bottom of the flex-col card */}
                                <Link
                                    href={`/products/${item.productId}`}
                                    className="block w-full text-center py-2 px-3 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                >
                                    View Product
                                </Link>
                                <button
                                    onClick={() => handleRemoveFromWishlist(item._id)}
                                    className="block w-full text-center py-2 px-3 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Remove from Wishlist
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </motion.div>
            ) : <p>Your wishlist is empty.</p>}
        </div>
    );
}
