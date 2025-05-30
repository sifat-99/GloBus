'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


const BestSellingSection = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch('/testData.json')
            .then((res) => res.json())
            .then((data) => setProducts(data));

    }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <Link key={product.product_id} href={`/products/${product.product_id}`} passHref>
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
