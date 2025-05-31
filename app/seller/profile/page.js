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

export default function SellerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        shopName: '',
        email: '',
        phone: '',
        businessAddress: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: null });

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const data = await fetchData('/api/seller/profile');
                setProfile(data);
                if (data) {
                    setFormData({
                        shopName: data.shopName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        businessAddress: data.businessAddress || '',
                        description: data.description || '',
                    });
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, []);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: null, success: null });
        try {
            const response = await fetch('/api/seller/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update profile');
            setUpdateStatus({ loading: false, error: null, success: 'Profile updated!' });
            setProfile(prev => ({ ...prev, ...formData }));
            setIsEditing(false);
        } catch (err) {
            setUpdateStatus({ loading: false, error: err.message, success: null });
        }
    };

    if (loading) return <div className="container mx-auto p-4"><p>Loading profile...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
    if (!profile) return <div className="container mx-auto p-4"><p>No profile data found.</p></div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Seller Profile</h1>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Edit Profile</button>}
            </div>

            {!isEditing ? (
                <div className="space-y-3 p-6 bg-white rounded-lg shadow">
                    <p><strong>Shop Name:</strong> {profile.shopName}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone}</p>
                    <p><strong>Business Address:</strong> {profile.businessAddress}</p>
                    <p><strong>Description:</strong> {profile.description}</p>
                    <p><strong>Member Since:</strong> {new Date(profile.memberSince).toLocaleDateString()}</p>
                </div>
            ) : (
                <form onSubmit={handleSaveChanges} className="space-y-4 p-6 bg-white rounded-lg shadow">
                    <div><label className="block text-sm font-medium">Shop Name</label><input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} className="mt-1 block w-full input input-bordered" /></div>
                    <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" value={formData.email} readOnly className="mt-1 block w-full input input-bordered bg-gray-100" /></div>
                    <div><label className="block text-sm font-medium">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full input input-bordered" /></div>
                    <div><label className="block text-sm font-medium">Business Address</label><textarea name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} className="mt-1 block w-full textarea textarea-bordered"></textarea></div>
                    <div><label className="block text-sm font-medium">Shop Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full textarea textarea-bordered"></textarea></div>
                    <div className="flex items-center space-x-4">
                        <button type="submit" disabled={updateStatus.loading} className="btn btn-success">{updateStatus.loading ? 'Saving...' : 'Save Changes'}</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">Cancel</button>
                    </div>
                    {updateStatus.error && <p className="text-red-500 text-sm">{updateStatus.error}</p>}
                    {updateStatus.success && <p className="text-green-500 text-sm">{updateStatus.success}</p>}
                </form>
            )}
        </div>
    );
}
