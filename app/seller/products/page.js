'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchData('/api/seller/products');
                setProducts(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading products...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link href="/seller/products/new" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Add New Product
                </Link>
            </div>
            {products.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Stock</th>
                                <th className="text-left py-3 px-4">Price</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b">
                                    <td className="py-3 px-4">{product.name}</td>
                                    <td className="py-3 px-4">{product.stock}</td>
                                    <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs rounded-full ${product.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{product.status}</span></td>
                                    <td className="py-3 px-4">
                                        <Link href={`/seller/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                                        {/* Add Delete button here */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p>You have no products listed yet.</p>}
        </div>
    );
}
