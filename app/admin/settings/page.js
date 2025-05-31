// app/admin/settings/page.js
'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
    const [adminDetails, setAdminDetails] = useState({
        name: '',
        email: '',
        phone: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch current admin details when the component mounts
    useEffect(() => {
        const fetchAdminDetails = async () => {
            setLoading(true);
            setError(null);
            setSuccessMessage('');
            try {
                const response = await axios.get('/api/admin/me');
                setAdminDetails(response.data || { name: '', email: '', phone: '', description: '' });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch admin details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminDetails();
    }, []);

    const handleChange = (e) => {
        setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            // The PUT request in /api/admin/me/route.js handles the update
            const response = await axios.put('/api/admin/me', adminDetails);
            setSuccessMessage(response.data.message || 'Admin details updated successfully!');
            // API in /api/admin/me/route.js (PUT) doesn't return the updated admin object, so we don't update state from response here.
            if (response.data.admin) setAdminDetails(response.data.admin);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update admin details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !adminDetails.email) return <p className="text-center mt-8">Loading admin settings...</p>;

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Admin Settings</h1>
            <p className="mb-4">Update your admin profile details below.</p>

            {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}
            {successMessage && <p className="mb-4 text-center text-green-500 bg-green-100 p-3 rounded">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded px-4 sm:px-8 pt-6 pb-8 mb-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={adminDetails.name || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={adminDetails.email || ''}
                        onChange={handleChange}
                        disabled // Assuming email is not editable
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={adminDetails.phone || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows="3"
                        value={adminDetails.description || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Add more fields as needed, e.g., password change */}
                {/*
                <div>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input type="password" name="currentPassword" id="currentPassword" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="newPassword">New Password</label>
                    <input type="password" name="newPassword" id="newPassword" onChange={handleChange} />
                </div>
                */}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Details'}
                    </button>
                </div>
            </form>
        </div>
    );
}
