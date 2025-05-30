// app/products/[productId]/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Image from 'next/image'; // Using next/image for optimization

export default function ProductDetailPage({ params: paramsPromise }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const params = React.use(paramsPromise);
    const productId = params.productId;
    console.log("Product ID:", productId);

    console.log(params)

    useEffect(() => {
        if (productId) {
            fetch('/testData.json') // Assuming testData.json is in the public folder
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch product data');
                    }
                    return res.json();
                })
                .then((data) => {
                    const foundProduct = data.find(p => p.product_id.toString() === productId);
                    if (foundProduct) {
                        setProduct(foundProduct);
                    } else {
                        setError('Product not found');
                    }
                })
                .catch((err) => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [productId]);

    console.log(product)

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading product details...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><p className="text-red-500">Error: {error}</p></div>;
    }

    if (!product) {
        return <div className="flex justify-center items-center h-screen"><p>Product not found.</p></div>;
    }

    return (
        <main className="container mx-auto p-4 md:p-8 flex-grow"> {/* Added flex-grow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <Image src={product?.image_url} alt={product.model} width={600} height={600} className="w-full h-auto object-cover" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800">{product.model}</h1>
                    <p className="text-xl font-semibold text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={20} fill={i < Math.round(product.ratings.stars) ? 'orange' : 'gray'} className="text-yellow-500" />
                        ))}
                        <span className="text-gray-600">({product.ratings.total_reviews} reviews)</span>
                    </div>
                    <p className="text-gray-700 text-sm">{product.description || "No description available."}</p>
                    <div>
                        <span className="text-2xl font-bold text-green-600">৳{product.discount.discounted_price}</span>
                        {product.discount.percentage > 0 && (
                            <span className="text-lg line-through text-gray-400 ml-2">৳{product.discount.original_price}</span>
                        )}
                        {product.discount.percentage > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded ml-2">
                                {product.discount.percentage}% OFF
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">Availability: {product.availability.remaining > 0 ? `${product.availability.remaining} remaining` : 'Out of Stock'}</p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4"> {/* Responsive flex direction */}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-150">
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                        <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-150">
                            <Heart size={20} /> Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
