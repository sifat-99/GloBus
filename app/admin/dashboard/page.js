'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AdminDashboardPage() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    const limit = 10;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            setActionError(null);
            setActionSuccess(null);
            try {
                const response = await axios.get(`/api/admin/products?page=${currentPage}&limit=${limit}`);
                setProducts(response.data.products);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const clearActionMessages = () => {
        setActionError(null);
        setActionSuccess(null);
    };

    const handleDeleteProduct = async (productId) => {
        clearActionMessages();
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await axios.delete(`/api/admin/products/${productId}`);
            setActionSuccess(response.data.message || 'Product deleted successfully.');
            setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));

            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else if (products.length === 1 && currentPage === 1 && totalPages > 1) {
                setCurrentPage(1);

            }
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to delete product.');
            console.error('Failed to delete product:', err);
        }
    };

    const handleUpdateProductStatus = async (productId, status) => {
        clearActionMessages();
        try {
            const response = await axios.put(`/api/admin/products/${productId}`, { status });
            setActionSuccess(response.data.message || `Product status updated to ${status}.`);
            setProducts(prevProducts => prevProducts.map(p =>
                p._id === productId ? { ...p, status: status } : p
            ));
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to update product status.');
            console.error('Failed to update product status:', err);
        }
    };


    if (loading && products.length === 0) return <p className="text-center mt-8">Loading products...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

    const tableRowVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Admin Dashboard - Manage Products</h1>

            <AnimatePresence>
                {actionError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 text-center text-red-500 bg-red-100 p-2 rounded">{actionError}</motion.p>}
                {actionSuccess && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 text-center text-green-500 bg-green-100 p-2 rounded">{actionSuccess}</motion.p>}
            </AnimatePresence>


            {products.length === 0 && !loading ? (
                <p className="text-center mt-4">No products found. Ensure your &apos;products&apos; collection has data.</p>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500 ">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                                <tr>
                                    <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Product Name</th>
                                    <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Brand</th>
                                    <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Price</th>
                                    <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Status</th>
                                    <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Actions</th>
                                </tr>
                            </thead>
                            <AnimatePresence>
                                {products.map((product) => (
                                    <motion.tr
                                        key={product._id}
                                        variants={tableRowVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        layout // Animates layout changes (e.g., when an item is removed)
                                        className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {product.model || product.name || 'N/A'}
                                        </th>
                                        <td className="px-3 py-2 md:px-6 md:py-4">{product.brand || 'N/A'}</td>
                                        <td className="px-3 py-2 md:px-6 md:py-4">
                                            ৳{product.discount?.discounted_price || product.price || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 md:px-6 md:py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 md:px-6 md:py-4 space-x-1 md:space-x-2 whitespace-nowrap">
                                            {product.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleUpdateProductStatus(product._id, 'approved')}
                                                    className="font-medium text-green-600 hover:underline text-xs sm:text-sm"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {product.status !== 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateProductStatus(product._id, 'pending')}
                                                    className="font-medium text-yellow-600 hover:underline text-xs sm:text-sm"
                                                >
                                                    Set Pending
                                                </button>
                                            )}
                                            {product.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleUpdateProductStatus(product._id, 'rejected')}
                                                    className="font-medium text-orange-500 hover:underline text-xs sm:text-sm"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="font-medium text-red-600 hover:underline text-xs sm:text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 sm:gap-0">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-xs sm:text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </motion.div>
    );
}
