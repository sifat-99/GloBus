'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import ProductHoverModal from './ProductHoverModal';

const BestSellingSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalProduct, setModalProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hoverTimeoutRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/products');
                if (Array.isArray(response.data)) {
                    const sortedProducts = [...response.data]
                        .sort((a, b) => (b.ratings?.total_reviews || 0) - (a.ratings?.total_reviews || 0))
                        .slice(0, 8);
                    setProducts(sortedProducts);
                    setError(null);
                } else {
                    setProducts([]);
                    setError('Received invalid product data format.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleMouseEnterCard = (product) => {
        clearTimeout(hoverTimeoutRef.current);
        setModalProduct(product);
        setIsModalVisible(true);
    };

    const handleMouseLeaveCard = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsModalVisible(false);
        }, 200);
    };

    const handleMouseEnterModal = () => {
        clearTimeout(hoverTimeoutRef.current);
    };

    const handleMouseLeaveModal = () => {
        setIsModalVisible(false);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setModalProduct(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <p className="text-lg text-gray-500">Loading best selling products...</p>
            </div>
        );
    }

    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (products.length === 0) return <div className="text-center p-10 text-gray-500">No best selling products to display.</div>;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                {products.map((product) => (
                    <div
                        key={product._id || product.product_id}
                        onMouseEnter={() => handleMouseEnterCard(product)}
                        onMouseLeave={handleMouseLeaveCard}
                        className="relative group rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 flex flex-col w-full border border-gray-100 overflow-hidden"
                    >
                        <Link href={`/products/${product._id || product.product_id}`} passHref>
                            <div className="flex flex-col h-full cursor-pointer">
                                {/* Product Image */}
                                <div className="relative w-full h-28 sm:h-32 md:h-40 lg:h-48 bg-gray-50 flex items-center justify-center">
                                    <Image
                                        src={product.image_url}
                                        alt={product.model}
                                        fill
                                        className="object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                    />
                                </div>
                                {/* Card Content */}
                                <div className="flex flex-col flex-1 p-2 sm:p-3 md:p-4">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[10px] font-semibold text-gray-500">{product.brand}</span>
                                        <span className="text-[8px] text-gray-400">#{product.product_id}</span>
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-0.5 truncate" title={product.model}>{product.model}</h3>
                                    <div className="flex items-center gap-0.5 text-yellow-500 mb-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={10}
                                                fill={i < Math.round(product.ratings?.stars || 0) ? 'currentColor' : 'none'}
                                                strokeWidth={i < Math.round(product.ratings?.stars || 0) ? 1 : 0.5}
                                                stroke={i < Math.round(product.ratings?.stars || 0) ? 'currentColor' : 'gray'}
                                            />
                                        ))}
                                        <span className="text-[9px] text-gray-500 ml-0.5">({product.ratings?.total_reviews || 0})</span>
                                    </div>
                                    <div className="flex flex-wrap items-end justify-start gap-x-2 gap-y-0 mb-1">
                                        <span className="font-bold text-green-600 text-[13px] md:text-base">
                                            ৳{product.discount?.discounted_price}
                                        </span>
                                        {product.discount?.original_price > product.discount?.discounted_price && (
                                            <span className="line-through text-[10px] text-red-500">
                                                ৳{product.discount?.original_price}
                                            </span>
                                        )}
                                        <span className="text-[10px] sm:text-[12px] text-gray-500">Stock: {product.availability?.remaining}</span>
                                    </div>
                                    <div className="flex flex-col items-start justify-between mb-1">
                                        <div className="flex gap-1 flex-wrap">
                                            {product.labels?.map((label, i) => (
                                                <span key={i} className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.5 rounded">
                                                    {label}
                                                </span>
                                            ))}
                                            {product.badges?.map((badge, i) => (
                                                <span key={i} className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0.5 rounded">
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="mt-auto w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold py-2 rounded-lg shadow hover:from-green-500 hover:to-emerald-600 transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            {isModalVisible && modalProduct && (
                <ProductHoverModal
                    product={modalProduct}
                    onClose={handleCloseModal}
                    onMouseEnter={handleMouseEnterModal}
                    onMouseLeave={handleMouseLeaveModal}
                />
            )}
        </>
    );
};

export default BestSellingSection;
