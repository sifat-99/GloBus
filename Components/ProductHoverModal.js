'use client';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';


const ProductHoverModal = ({ product, onClose, onMouseEnter, onMouseLeave }) => {



    // Define helper functions directly in the component
    const renderDetailRow = (label, value) => {
        if (!value && typeof value !== 'number') return null;
        return (
            <>
                <td className="py-2 px-4 font-semibold text-gray-600 w-1/3 md:w-1/4">{label}</td>
                <td className="py-2 px-4 text-gray-800">{value}</td>
            </>
        );
    };

    const renderArrayDetailRow = (label, values) => {
        if (!values || values.length === 0) return null;
        return (
            <>
                <td className="py-2 px-4 font-semibold text-gray-600 align-top w-1/3 md:w-1/4">{label}</td>
                <td className="py-2 px-4 text-gray-800">
                    <ul className="list-disc list-inside">
                        {values.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </td>
            </>
        );
    };
    if (!product) {
        return null;
    }

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

    return (

        <motion.main
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="fixed top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-xl z-[1500] w-11/12 max-w-md border border-gray-200 h-2/3 overflow-y-auto"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    className="rounded-lg overflow-hidden shadow-lg group relative w-full md:w-4/6 lg:w-4/5 mx-auto h-80 md:h-48"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Image src={product?.image_url} alt={product.model} layout="fill" objectFit="contain" className="transition-transform duration-300 ease-in-out group-hover:scale-110" />
                </motion.div>
                <motion.div className="space-y-2">
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
                    <div>
                        <motion.button onClick={handleAddToCart} whileHover={{ scale: 1.05 }} whileTap={{
                            scale: 0.95
                        }} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
                            <ShoppingCart size={20} className="inline-block mr-2" />
                            Add to Cart
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
        </motion.main>
    );
};

export default ProductHoverModal;
