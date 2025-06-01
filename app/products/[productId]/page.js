// app/products/[productId]/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Image from 'next/image'; // Using next/image for optimization
import Link from 'next/link'; // Import Link for navigation
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage({ params: paramsPromise }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    const mainContentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const relatedSectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, staggerChildren: 0.1 } }
    };

    const listItemVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };
    const params = React.use(paramsPromise);
    const productId = params.productId;

    useEffect(() => {
        if (productId) {
            const fetchProductAndRelated = async () => {
                setLoading(true);
                setError(null);
                setProduct(null);
                setIsWishlisted(false);
                setRelatedProducts([]); // Reset related products
                setLoadingRelated(false); // Reset loading state for related

                try {
                    // Fetch main product
                    const productResponse = await axios.get(`/api/products/${productId}`);
                    const fetchedProduct = productResponse.data;
                    setProduct(fetchedProduct);

                    // Fetch wishlist status for main product
                    if (fetchedProduct && fetchedProduct._id) {
                        try {
                            const wishlistStatusRes = await axios.get(`/api/user/wishlist/item-status?productId=${fetchedProduct._id}`);
                            if (wishlistStatusRes.data && wishlistStatusRes.data.isWishlisted) {
                                setIsWishlisted(true);
                            }
                        } catch (wishlistError) {
                            console.warn('Could not fetch wishlist status:', wishlistError.message);
                        }

                        // Fetch related products
                        // Ensure fetchedProduct.category exists and is a string
                        if (fetchedProduct.category && typeof fetchedProduct.category === 'string') {
                            setLoadingRelated(true);
                            try {
                                const relatedParams = new URLSearchParams({
                                    category: fetchedProduct.category,
                                    excludeProductId: fetchedProduct._id,
                                    limit: 4, // Show 4 related products
                                    random: 'true' // Request random products from the category
                                });
                                const relatedResponse = await axios.get(`/api/products?${relatedParams.toString()}`);
                                setRelatedProducts(relatedResponse.data);
                            } catch (relatedError) {
                                console.error('Failed to fetch related products:', relatedError.message);
                                // Not a critical error for the main page, so don't set the main error state
                                // Optionally, set a specific error state for related products if needed
                            } finally {
                                setLoadingRelated(false);
                            }
                        } else {
                            console.warn('Product category is not available or invalid for fetching related products.');
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch product ${productId}:`, err);
                    setError(err.response?.data?.message || 'Could not load product details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProductAndRelated();
        }
    }, [productId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading product details...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><p className="text-red-500">Error: {error}</p></div>;
    }

    if (!product) {
        return <div className="flex justify-center items-center h-screen"><p>Product not found.</p></div>;
    }

    // Centralized function to update local product availability
    const updateLocalProductAvailability = (quantityChange) => {
        // quantityChange:
        //   - A positive number (e.g., 1) means one item was added to the cart,
        //     so local 'remaining' availability should decrease.
        //   - A negative number (e.g., -1) means one item was removed/decreased from the cart,
        //     so local 'remaining' availability should increase.
        setProduct(prevProduct => {
            if (!prevProduct || typeof prevProduct.availability?.remaining !== 'number') {
                console.warn("Product data or availability.remaining is not valid for update.");
                return prevProduct;
            }
            // Calculate new remaining, ensuring it doesn't go below zero.
            // A more advanced version might cap at an original maximum if known.
            const newRemaining = Math.max(0, prevProduct.availability.remaining - quantityChange);
            return {
                ...prevProduct,
                availability: { ...prevProduct.availability, remaining: newRemaining }
            };
        });
    };

    const handleAddToCart = async () => {
        if (!product || !product._id) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Product details not available.',
            });
            return;
        }
        try {
            const response = await axios.post('/api/user/cart', {
                productId: product._id,
                quantity: 1, // Default quantity to 1
            });
            Swal.fire({
                icon: 'success',
                title: 'Added!',
                text: response.data.message || 'Product added to cart!',
                timer: 1500,
                showConfirmButton: false
            });
            // On successful add to cart, reflect this by passing a positive quantityChange (1),
            // which will decrease the displayed 'remaining' availability.
            updateLocalProductAvailability(1);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Could not add to cart.',
            });
        }
    };

    // Example of how you would update availability if an item is removed or quantity decreased:
    // This function would be called after a successful API call to modify the cart.
    // const handleItemRemovedOrDecreasedInCart = async (productId, quantityRemoved = 1) => {
    //     // try {
    //     //     // ... your API call to remove/decrease item in cart ...
    //     //     // On success from API:
    //          // Pass a negative quantityChange (-quantityRemoved) to increase displayed 'remaining' availability.
    //          updateLocalProductAvailability(-quantityRemoved);
    //     // } catch (error) {
    //     //     // ... handle error ...
    //     // }
    // };

    const handleAddToWishlist = async () => {
        if (!product || !product._id) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Product details not available.',
            });
            return;
        }
        try {
            const response = await axios.post('/api/user/wishlist', {
                productId: product._id,
            });
            Swal.fire({
                icon: 'success',
                title: 'Added!',
                text: response.data.message || 'Product added to wishlist!',
                timer: 1500,
                showConfirmButton: false
            });
            setIsWishlisted(true); // Mark as wishlisted on successful add
        } catch (err) {
            console.error('Failed to add to wishlist:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Could not add to wishlist.',
            });
            setIsWishlisted(true);
        }
    };

    const renderDetailRow = (label, value) => {
        if (!value && typeof value !== 'number') return null; // Don't render if value is empty, null, or undefined (except for 0)
        return (
            <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold text-gray-600 w-1/3 md:w-1/4">{label}</td>
                <td className="py-2 px-4 text-gray-800">{value}</td>
            </tr>
        );
    };

    const renderArrayDetailRow = (label, values) => {
        if (!values || values.length === 0) return null;
        return (
            <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold text-gray-600 align-top w-1/3 md:w-1/4">{label}</td>
                <td className="py-2 px-4 text-gray-800">
                    <ul className="list-disc list-inside">
                        {values.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </td>
            </tr>
        );
    };

    return (
        <motion.main
            className="container mx-auto p-4 md:p-8 flex-grow"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    className="rounded-lg overflow-hidden shadow-lg group relative w-full md:w-5/6 lg:w-4/5 mx-auto h-80 md:h-96"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Image src={product?.image_url} alt={product.model} layout="fill" objectFit="contain" className="transition-transform duration-300 ease-in-out group-hover:scale-110" />
                    {/* layout="fill" and objectFit="contain" for better responsive handling within fixed container.
                        group-hover:scale-125 for zoom effect */}
                </motion.div>
                <motion.div className="space-y-4">
                    <motion.h1 layout="position" className="text-3xl font-bold text-gray-800">{product.model}</motion.h1>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={20} fill={i < Math.round(product.ratings.stars) ? 'orange' : 'gray'} className="text-yellow-500" />
                        ))}
                        <span className="text-gray-600">({product.ratings.total_reviews} reviews)</span>
                    </div>
                    <div>
                        <motion.span layout="position" className="text-2xl font-bold text-green-600">৳{product.discount.discounted_price}</motion.span>
                        {product.discount.percentage > 0 && (
                            <motion.span layout="position" className="text-lg line-through text-gray-400 ml-2">৳{product.discount.original_price}</motion.span>
                        )}
                        {product.discount.percentage > 0 && (
                            <motion.span layout="position" className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded ml-2">
                                {product.discount.percentage}% OFF
                            </motion.span>
                        )}
                    </div>
                    <div className='flex  gap-2'>
                        <p className="text-gray-600">Available: {product.availability.remaining} piece       ||</p>
                        <p className="text-green-600">Sold: {product.availability.sold}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-150">
                            <ShoppingCart size={20} /> Add to Cart
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddToWishlist} className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-150">
                            <Heart size={20} fill={isWishlisted ? 'red' : 'none'} /> Wishlist
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Product Details Table Section */}
            <motion.div className="mt-12 bg-white shadow-lg rounded-lg p-6" variants={mainContentVariants}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Specifications</h2>
                <table className="w-full">
                    <tbody>
                        <AnimatePresence>
                            {renderDetailRow("Brand", product?.brand) && <motion.tr key="brand-detail" layout variants={listItemVariants}>{renderDetailRow("Brand", product?.brand)}</motion.tr>}
                            {renderDetailRow("Model", product?.model) && <motion.tr key="model-detail" layout variants={listItemVariants}>{renderDetailRow("Model", product?.model)}</motion.tr>}
                            {renderDetailRow("Category", product?.category) && <motion.tr key="category-detail" layout variants={listItemVariants}>{renderDetailRow("Category", product?.category)}</motion.tr>}
                            {renderDetailRow("Type", product?.type) && <motion.tr key="type-detail" layout variants={listItemVariants}>{renderDetailRow("Type", product?.type)}</motion.tr>}
                            {renderDetailRow("Product ID (SKU)", product?.product_id) && <motion.tr key="sku-detail" layout variants={listItemVariants}>{renderDetailRow("Product ID (SKU)", product?.product_id)}</motion.tr>}
                            {product.description && renderDetailRow("Description", product?.description) && <motion.tr key="description-detail" layout variants={listItemVariants}>{renderDetailRow("Description", product?.description)}</motion.tr>}
                            {product.technology && renderDetailRow("Technology / Key Specs", product?.technology) && <motion.tr key="tech-detail" layout variants={listItemVariants}>{renderDetailRow("Technology / Key Specs", product.technology)}</motion.tr>}
                            {product.warranty?.parts && renderDetailRow("Parts Warranty", product.warranty.parts) && <motion.tr key="parts-warranty-detail" layout variants={listItemVariants}>{renderDetailRow("Parts Warranty", product.warranty.parts)}</motion.tr>}
                            {product.warranty?.service && renderDetailRow("Service Warranty", product.warranty.service) && <motion.tr key="service-warranty-detail" layout variants={listItemVariants}>{renderDetailRow("Service Warranty", product.warranty.service)}</motion.tr>}
                            {renderArrayDetailRow("Badges", product.badges) && <motion.tr key="badges-detail" layout variants={listItemVariants}>{renderArrayDetailRow("Badges", product.badges)}</motion.tr>}
                            {renderArrayDetailRow("Features", product.features) && <motion.tr key="features-detail" layout variants={listItemVariants}>{renderArrayDetailRow("Features", product.features)}</motion.tr>}
                            {renderArrayDetailRow("Labels", product.labels) && <motion.tr key="labels-detail" layout variants={listItemVariants}>{renderArrayDetailRow("Labels", product.labels)}</motion.tr>}
                            {renderArrayDetailRow("Service Includes", product.service_includes) && <motion.tr key="service-includes-detail" layout variants={listItemVariants}>{renderArrayDetailRow("Service Includes", product.service_includes)}</motion.tr>}
                            {renderDetailRow("Vendor", product.vendor) && <motion.tr key="vendor-detail" layout variants={listItemVariants}>{renderDetailRow("Vendor", product.vendor)}</motion.tr>}
                        </AnimatePresence>
                    </tbody>
                </table>
            </motion.div>

            {/* Related Products Section */}
            {loadingRelated && <p className="mt-12 text-center text-lg">Loading related products...</p>}
            {!loadingRelated && product && product.category && ( // Show section if we attempted to load based on category
                <motion.div className="mt-16" variants={relatedSectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
                    <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                        <AnimatePresence>
                            {relatedProducts.map((relatedProduct) => (
                                <motion.div key={relatedProduct._id} variants={listItemVariants} className="flex-none w-64"> {/* Adjust width as needed */}
                                    <Link href={`/products/${relatedProduct._id}`} className=" border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
                                        <div className="relative w-full h-64 bg-gray-200"> {/* Adjusted height for carousel items */}
                                            <Image
                                                src={relatedProduct.image_url || '/placeholder-image.jpg'}
                                                alt={relatedProduct.model || relatedProduct.name || 'Related Product'}
                                                layout="fill"
                                                objectFit="cover"
                                                className="group-hover:scale-105 transition-transform duration-300 "
                                            />
                                        </div>
                                        <div className="p-3 flex flex-col flex-grow">
                                            <h3 className="text-sm font-semibold text-gray-700 truncate group-hover:text-blue-600">{relatedProduct.model || relatedProduct.name}</h3>
                                            <p className="text-xs text-gray-500 mb-1">{relatedProduct.brand}</p>
                                            <div className="mt-auto">
                                                <p className="text-md font-bold text-green-600">৳{relatedProduct.discount?.discounted_price || relatedProduct.price}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {relatedProducts.length === 0 && (
                            <p className="text-gray-500">No related products found for this category.</p>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.main >
    );
}
