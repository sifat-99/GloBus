'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios'; // For DELETE requests
import Swal from 'sweetalert2'; // For confirmations

// Removed fetchData as we'll use axios for delete

export default function SellerProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });


    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // const data = await fetchData('/api/seller/products'); // Old way
            const response = await axios.get('/api/seller/products');
            setProducts(response.data);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDeleteProduct = async (productId, productName) => {
        Swal.fire({
            title: `Delete ${productName}?`,
            text: "Are you sure you want to delete this product? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setActionMessage({ type: '', text: '' });
                    const response = await axios.delete(`/api/seller/products/${productId}`);
                    Swal.fire(
                        'Deleted!',
                        response.data.message || 'Product has been deleted.',
                        'success'
                    );
                    // Refresh product list
                    loadProducts();
                } catch (err) {
                    const delError = err.response?.data?.message || err.message || 'Failed to delete product.';
                    Swal.fire(
                        'Error!',
                        delError,
                        'error'
                    );
                    setActionMessage({ type: 'error', text: delError });
                }
            }
        });
    };


    if (loading) return <div className="container mx-auto p-4 text-center">Loading products...</div>;
    if (error) return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link href="/seller/products/new" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                    Add New Product
                </Link>
            </div>

            {actionMessage.text && (
                <div className={`p-3 mb-4 rounded-md text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {actionMessage.text}
                </div>
            )}

            {products.length > 0 ? (
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Price (BDT)</th>
                                <th scope="col" className="px-6 py-3">Sold</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {product.model || product.name || 'N/A'}
                                    </th>
                                    <td className="px-6 py-4">{product.availability?.remaining ?? 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {product.discount?.discounted_price?.toFixed(2) ?? (product.price?.toFixed(2) ?? 'N/A')}
                                    </td>
                                    <td className="px-6 py-4">{product.availability?.sold ?? 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {product.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <Link href={`/seller/products/edit/${product._id}`} className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id, product.model || product.name)}
                                            className="font-medium text-red-600 hover:text-red-800 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-center text-gray-600">You have no products listed yet. Click &quot;Add New Product&quot; to get started!</p>}
        </div>
    );
}
