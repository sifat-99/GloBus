'use client';

import { useEffect, useState } from 'react';

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function SellerDashboardPage() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOverviewData = async () => {
            try {
                const data = await fetchData('/api/seller/dashboard');
                setOverview(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadOverviewData();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading dashboard overview...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
    if (!overview) return <div className="container mx-auto p-4"><p>No overview data found.</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Seller Dashboard - {overview.shopName}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">Total Products</h2>
                    <p className="text-3xl font-bold text-indigo-600">{overview.totalProducts}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">Active Listings</h2>
                    <p className="text-3xl font-bold text-cyan-600">{overview.activeListings}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">New Orders Today</h2>
                    <p className="text-3xl font-bold text-green-600">{overview.newOrdersToday}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">Pending Shipment</h2>
                    <p className="text-3xl font-bold text-orange-600">{overview.pendingShipment}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">Sales This Month</h2>
                    <p className="text-3xl font-bold text-blue-600">${overview.totalSalesMonth.toFixed(2)}</p>
                </div>
                {/* You can add more detailed product-wise sales breakdown here or on a separate report page */}
            </div>
        </div>
    );
}
