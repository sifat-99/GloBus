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

export default function UserDashboardPage() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '', // Email is usually not editable from profile page directly
        address: '',
        deliveryAddress: '',
        phone: '',
    });
    const [loading, setLoading] = useState({
        profile: true,
    });
    const [error, setError] = useState({
        profile: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: null });

    useEffect(() => {
        const loadProfileData = async () => {
            // Fetch Profile
            try {
                const profileData = await fetchData('/api/user/profile');
                setProfile(profileData);
                if (profileData) {
                    setFormData({
                        name: profileData.name || '',
                        email: profileData.email || '',
                        address: profileData.address || '',
                        deliveryAddress: profileData.deliveryAddress || profileData.address || '',
                        phone: profileData.phone || '',
                    });
                }
            } catch (e) {
                setError(prev => ({ ...prev, profile: e.message }));
            } finally {
                setLoading(prev => ({ ...prev, profile: false }));
            }
        };
        loadProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: null, success: null });
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    deliveryAddress: formData.deliveryAddress,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }
            setUpdateStatus({ loading: false, error: null, success: 'Profile updated successfully!' });
            setProfile(prev => ({ ...prev, ...formData, deliveryAddress: formData.deliveryAddress || formData.address })); // Update local profile state
            setIsEditing(false); // Exit editing mode on success
        } catch (err) {
            setUpdateStatus({ loading: false, error: err.message, success: null });
        }
    };
    const renderLoadingOrError = (section) => {
        if (loading[section]) return <p>Loading {section}...</p>;
        if (error[section]) return <p className="text-red-500">Error loading {section}: {error[section]}</p>;
        return null;
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">My Profile</h1>

            {/* Profile Section */}
            <section className="mb-8 p-4 border rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                    <h2 className="text-2xl font-semibold text-center sm:text-left">Profile Details</h2>
                    {!isEditing && profile && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {renderLoadingOrError('profile') || (profile && !isEditing && (
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
                        <p><strong>Primary Address:</strong> {profile.address || 'Not set'}</p>
                        <p><strong>Default Delivery Address:</strong> {profile.deliveryAddress || 'Not set'}</p>
                        <p><strong>Joined:</strong> {new Date(profile.dateJoined).toLocaleDateString()}</p>
                    </div>
                ))}

                {profile && isEditing && (
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (cannot be changed here)</label>
                            <input type="email" name="email" id="email" value={formData.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Primary Address</label>
                            <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Default Delivery Address</label>
                            <textarea name="deliveryAddress" id="deliveryAddress" rows="3" value={formData.deliveryAddress} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <button type="submit" disabled={updateStatus.loading} className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
                                {updateStatus.loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={() => { setIsEditing(false); /* Reset form if needed */ }} className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                        {updateStatus.error && <p className="text-red-500 text-sm mt-2">Error: {updateStatus.error}</p>}
                        {updateStatus.success && <p className="text-green-500 text-sm mt-2">{updateStatus.success}</p>}
                    </form>
                )}
            </section>

        </div>
    );
}
