'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation'; // Changed from useSearchParams
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

function ProductsGrid({ products }) {
    console.log("Rendering ProductsGrid with products:", products);
    if (!products || products.length === 0) {
        return <p className="text-center text-gray-500 col-span-full">No products found in this category.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <Link key={product._id} href={`/products/${product._id}`} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
                    <div className="relative w-full h-90 bg-gray-200"> {/* Fixed height for product images */}
                        <Image
                            src={product.image_url || '/placeholder-image.jpg'} // Provide a fallback placeholder
                            alt={product.model || product.name || 'Product Image'}
                            layout="fill"
                            objectFit="cover" // Or "contain" based on preference
                            className="group-hover:scale-105 transition-transform duration-300 h-fit"
                        />
                        {product.discount?.percentage > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                {product.discount.percentage}% OFF
                            </span>
                        )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {product.model || product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                        <div className="mt-auto"> {/* Pushes price to the bottom */}
                            <p className="text-xl font-bold text-green-600">
                                ৳{product.discount?.discounted_price ?? product.price}
                            </p>
                            {product.discount?.original_price && product.discount?.percentage > 0 && (
                                <p className="text-sm text-gray-400 line-through">
                                    ৳{product.discount.original_price}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function ProductListingPageContent() {
    const params = useParams();
    // Get category from URL path and decode it (e.g., "Air%20Conditioner" becomes "Air Conditioner")
    const categoryFromPath = params.category ? decodeURIComponent(params.category) : null;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                let apiUrl = '/api/products'; // Your API endpoint for fetching products
                if (categoryFromPath) {
                    // The API likely still expects the category as a query parameter
                    apiUrl += `?category=${encodeURIComponent(categoryFromPath)}`;
                }
                // You can add other query params like page, limit, sort if your API supports them
                // e.g., apiUrl += `&page=1&limit=12`;

                const response = await axios.get(apiUrl);
                setProducts(response.data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError(err.response?.data?.message || 'Could not load products.');
            } finally {
                setLoading(false);
            }
        };

        // Fetch products if categoryFromPath is available (or always, if you want to show "All Products" by default)
        // if (categoryFromPath) { // Uncomment if you only want to fetch if a category is present
        fetchProducts();
        // } else {
        //     setLoading(false); // No category, so not loading
        //     setProducts([]); // No products to show
        // }
    }, [categoryFromPath]); // Re-fetch when categoryFromPath changes

    const pageTitle = categoryFromPath ? `${categoryFromPath}` : 'All Products';

    return (
        <main className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">{pageTitle}</h1>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <p>Loading products...</p>
                </div>
            )}
            {error && (
                <div className="text-center py-10">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            )}
            {!loading && !error && <ProductsGrid products={products} />}
        </main>
    );
}

// This is the actual page component for the route app/products/[category]/page.js
export default function CategoryProductPage() {
    return (
        <Suspense fallback={<div className="container mx-auto p-4 md:p-8 text-center">Loading category products...</div>}>
            <ProductListingPageContent />
        </Suspense>
    );
}
