// app/admin/products/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    const limit = 10; // Products per page

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            setActionError(null); // Clear action messages on page change/reload
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
            // If the last item on a page is deleted, and it's not the first page, consider refetching or going to prev page
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1); // Or simply refetch current page data if totalPages might change
            } else if (products.length === 1 && currentPage === 1 && totalPages > 1) {
                // If it was the only item on the first page but there are other pages, refetch might be needed if totalPages changes
                // For simplicity, current behavior is okay.
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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Products</h1>

            {actionError && <p className="mb-4 text-center text-red-500 bg-red-100 p-2 rounded">{actionError}</p>}
            {actionSuccess && <p className="mb-4 text-center text-green-500 bg-green-100 p-2 rounded">{actionSuccess}</p>}

            {products.length === 0 && !loading ? (
                <p>No products found. Ensure your &apos;products&apos; collection has data.</p>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500 ">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3">Brand</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {product.model || product.name || 'N/A'}
                                        </th>
                                        <td className="px-6 py-4">{product.brand || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            ৳{product.discount?.discounted_price || product.price || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-1 md:space-x-2 whitespace-nowrap">
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
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
        </div>
    );
}
