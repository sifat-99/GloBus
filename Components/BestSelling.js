'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';


const BestSellingSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/products');
                // Ensure that response.data is an array before setting it
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error("Received non-array data from /api/products:", response.data);
                    setProducts([]); // Fallback to an empty array to prevent .map error
                    setError('Received invalid product data format.');
                }
                setError(null);
            } catch (err) {
                console.error("Failed to fetch best selling products:", err);
                setError(err.response?.data?.message || 'Could not load products.');
                setProducts([]); // Clear products on error
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <p className="text-lg text-gray-500">Loading best selling products...</p>
                {/* You could replace this with a spinner component */}
            </div>
        );
    }

    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <Link key={product.product_id} href={`/products/${product?._id}`} passHref>
                    <div
                        className="rounded-2xl shadow-md bg-white hover:shadow-lg transition duration-300 cursor-pointer h-full flex flex-col"
                    ><Image
                            src={product.image_url}
                            alt={product.model}
                            width={400}
                            height={192}
                            // className="w-full h-48 object-cover rounded-t-2xl"
                            priority
                        />
                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-600">{product.brand}</span>
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                                        {product.discount.percentage}% OFF
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mt-1">{product.model}</h3>
                                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.round(product.ratings.stars) ? 'currentColor' : 'none'}
                                        />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">({product.ratings.total_reviews})</span>
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                    <span className="line-through mr-2 text-gray-400">
                                        ৳{product.discount.original_price}
                                    </span>
                                    <span className="font-bold text-green-600">
                                        ৳{product.discount.discounted_price}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Remaining: {product.availability.remaining}</div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {product.labels.map((label, i) => (
                                    <span
                                        key={i}
                                        className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded"
                                    />
                                ))}
                                {product.badges.map((badge, i) => (
                                    <span
                                        key={i}
                                        className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default BestSellingSection;
