'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.productId;

    const [productData, setProductData] = useState({
        product_id: '',
        brand: '',
        model: '',
        category: '',
        type: '',
        description: '',
        technology: '',
        warranty_parts: '',
        warranty_service: '',
        badges: '',
        discount_percentage: 0,
        discount_original_price: 0,
        availability_total_quantity: 0,
        features: '',
        vendor: '',
        image_url: '',
        labels: '',
        service_includes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId) {
            const fetchProductData = async () => {
                setIsFetching(true);
                setError(null);
                try {
                    const response = await axios.get(`/api/seller/products/${productId}`);
                    const data = response.data;
                    setProductData({
                        product_id: data.product_id || '',
                        brand: data.brand || '',
                        model: data.model || '',
                        category: data.category || '',
                        type: data.type || '',
                        description: data.description || '',
                        technology: data.technology || '',
                        warranty_parts: data.warranty?.parts || '',
                        warranty_service: data.warranty?.service || '',
                        badges: Array.isArray(data.badges) ? data.badges.join(', ') : '',
                        discount_percentage: data.discount?.percentage || 0,
                        discount_original_price: data.discount?.original_price || 0,
                        availability_total_quantity: data.availability?.total_quantity || 0,
                        features: Array.isArray(data.features) ? data.features.join(', ') : '',
                        vendor: data.vendor || '',
                        image_url: data.image_url || '',
                        labels: Array.isArray(data.labels) ? data.labels.join(', ') : '',
                        service_includes: Array.isArray(data.service_includes) ? data.service_includes.join(', ') : '',
                    });
                } catch (err) {
                    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch product data.';
                    setError(errorMessage);
                    Swal.fire({
                        icon: 'error',
                        title: 'Fetch Failed',
                        text: errorMessage,
                    });
                } finally {
                    setIsFetching(false);
                }
            };
            fetchProductData();
        } else {
            setError("Product ID is missing.");
            setIsFetching(false);
            router.push('/seller/products'); // Redirect if no ID
        }
    }, [productId, router]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                ...productData, // Spread current form data
                badges: productData.badges.split(',').map(s => s.trim()).filter(s => s),
                features: productData.features.split(',').map(s => s.trim()).filter(s => s),
                labels: productData.labels.split(',').map(s => s.trim()).filter(s => s),
                service_includes: productData.service_includes.split(',').map(s => s.trim()).filter(s => s),
                warranty: {
                    parts: productData.warranty_parts,
                    service: productData.warranty_service,
                },
                discount: {
                    percentage: productData.discount_percentage,
                    original_price: productData.discount_original_price,
                },
                availability: {
                    total_quantity: productData.availability_total_quantity,
                }
            };
            // Remove flat fields that are now nested
            delete payload.warranty_parts;
            delete payload.warranty_service;
            // discount_percentage, discount_original_price are handled within discount object
            // availability_total_quantity is handled within availability object

            const response = await axios.put(`/api/seller/products/${productId}`, payload);

            Swal.fire({
                icon: 'success',
                title: 'Product Updated!',
                text: response.data.message || 'Your product has been updated and is pending re-approval.',
                timer: 2500,
                showConfirmButton: false,
            });
            router.push('/seller/products');

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update product.';
            setError(errorMessage);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    if (isFetching) {
        return <div className="container mx-auto p-4 sm:p-6 text-center text-lg">Loading product data...</div>;
    }
    // If there was an error fetching and we don't have a model name (critical data), show error.
    if (error && !productData.model) {
        return <div className="container mx-auto p-4 sm:p-6 text-center text-red-500 text-lg">{error}</div>;
    }

    return (
        <div className="container mx-auto p-2 sm:p-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Product: {productData.model || 'Loading...'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

                {/* Form fields are identical to AddNewProductPage, just pre-filled */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label htmlFor="model" className={labelClass}>Model Name (Product Title)</label><input type="text" name="model" id="model" value={productData.model} onChange={handleChange} className={inputClass} required /></div>
                    <div><label htmlFor="brand" className={labelClass}>Brand</label><input type="text" name="brand" id="brand" value={productData.brand} onChange={handleChange} className={inputClass} required /></div>
                    <div><label htmlFor="product_id" className={labelClass}>Product ID (SKU)</label><input type="text" name="product_id" id="product_id" value={productData.product_id} onChange={handleChange} className={inputClass} /></div>
                    <div><label htmlFor="category" className={labelClass}>Category</label><input type="text" name="category" id="category" value={productData.category} onChange={handleChange} className={inputClass} required /></div>
                    <div><label htmlFor="type" className={labelClass}>Type (e.g., Laptop, Smartphone)</label><input type="text" name="type" id="type" value={productData.type} onChange={handleChange} className={inputClass} /></div>
                    <div><label htmlFor="image_url" className={labelClass}>Image URL</label><input type="url" name="image_url" id="image_url" value={productData.image_url} onChange={handleChange} className={inputClass} required /></div>
                </div>

                <div><label htmlFor="description" className={labelClass}>Description</label><textarea name="description" id="description" rows="4" value={productData.description} onChange={handleChange} className={inputClass}></textarea></div>
                <div><label htmlFor="technology" className={labelClass}>Technology / Key Specs</label><textarea name="technology" id="technology" rows="3" value={productData.technology} onChange={handleChange} className={inputClass}></textarea></div>

                <fieldset className="border p-3 sm:p-4 rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Warranty</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div><label htmlFor="warranty_parts" className={labelClass}>Parts Warranty</label><input type="text" name="warranty_parts" id="warranty_parts" value={productData.warranty_parts} onChange={handleChange} className={inputClass} placeholder="e.g., 1 year" /></div>
                        <div><label htmlFor="warranty_service" className={labelClass}>Service Warranty</label><input type="text" name="warranty_service" id="warranty_service" value={productData.warranty_service} onChange={handleChange} className={inputClass} placeholder="e.g., 1 year" /></div>
                    </div>
                </fieldset>

                <fieldset className="border p-3 sm:p-4 rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Pricing & Availability</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <div><label htmlFor="discount_original_price" className={labelClass}>Original Price (BDT)</label><input type="number" name="discount_original_price" id="discount_original_price" value={productData.discount_original_price} onChange={handleChange} className={inputClass} min="0" required /></div>
                        <div><label htmlFor="discount_percentage" className={labelClass}>Discount Percentage (%)</label><input type="number" name="discount_percentage" id="discount_percentage" value={productData.discount_percentage} onChange={handleChange} className={inputClass} min="0" max="100" /></div>
                        <div><label htmlFor="availability_total_quantity" className={labelClass}>Total Quantity</label><input type="number" name="availability_total_quantity" id="availability_total_quantity" value={productData.availability_total_quantity} onChange={handleChange} className={inputClass} min="0" required /></div>
                    </div>
                </fieldset>

                <fieldset className="border p-3 sm:p-4 rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Additional Details</legend>
                    <div className="space-y-4 mt-2">
                        <div><label htmlFor="features" className={labelClass}>Features (comma-separated)</label><input type="text" name="features" id="features" value={productData.features} onChange={handleChange} className={inputClass} placeholder="e.g., Feature 1, Feature 2" /></div>
                        <div><label htmlFor="badges" className={labelClass}>Badges (comma-separated)</label><input type="text" name="badges" id="badges" value={productData.badges} onChange={handleChange} className={inputClass} placeholder="e.g., Official Warranty, Fastpick" /></div>
                        <div><label htmlFor="labels" className={labelClass}>Labels (comma-separated)</label><input type="text" name="labels" id="labels" value={productData.labels} onChange={handleChange} className={inputClass} placeholder="e.g., -10%, New Model" /></div>
                        <div><label htmlFor="service_includes" className={labelClass}>Service Includes (comma-separated)</label><input type="text" name="service_includes" id="service_includes" value={productData.service_includes} onChange={handleChange} className={inputClass} placeholder="e.g., Free delivery, 1-year warranty" /></div>
                        <div><label htmlFor="vendor" className={labelClass}>Vendor/Shop Name</label><input type="text" name="vendor" id="vendor" value={productData.vendor} onChange={handleChange} className={inputClass} /></div>
                    </div>
                </fieldset>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
