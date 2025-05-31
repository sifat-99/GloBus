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

export default function SellerSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({
        newOrderEmailNotifications: true,
        lowStockAlerts: true,
        vacationMode: false,
        returnPolicy: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: null });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchData('/api/seller/settings');
                setSettings(data);
                if (data) {
                    setFormData({
                        newOrderEmailNotifications: data.newOrderNotifications?.email || true,
                        lowStockAlerts: data.lowStockAlerts || true,
                        vacationMode: data.vacationMode || false,
                        returnPolicy: data.returnPolicy || '',
                    });
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: null, success: null });
        const payload = {
            newOrderNotifications: { email: formData.newOrderEmailNotifications },
            lowStockAlerts: formData.lowStockAlerts,
            vacationMode: formData.vacationMode,
            returnPolicy: formData.returnPolicy,
        };
        try {
            const response = await fetch('/api/seller/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update settings');
            setUpdateStatus({ loading: false, error: null, success: 'Settings updated!' });
        } catch (err) {
            setUpdateStatus({ loading: false, error: err.message, success: null });
        }
    };

    if (loading) return <div className="container mx-auto p-4"><p>Loading settings...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
    if (!settings) return <div className="container mx-auto p-4"><p>No settings data found.</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Seller Settings</h1>
            <form onSubmit={handleSaveChanges} className="space-y-6 p-6 bg-white rounded-lg shadow">
                <div><label className="flex items-center"><input type="checkbox" name="newOrderEmailNotifications" checked={formData.newOrderEmailNotifications} onChange={handleInputChange} className="checkbox checkbox-primary mr-2" /> Email Notifications for New Orders</label></div>
                <div><label className="flex items-center"><input type="checkbox" name="lowStockAlerts" checked={formData.lowStockAlerts} onChange={handleInputChange} className="checkbox checkbox-primary mr-2" /> Low Stock Alerts</label></div>
                <div><label className="flex items-center"><input type="checkbox" name="vacationMode" checked={formData.vacationMode} onChange={handleInputChange} className="checkbox checkbox-primary mr-2" /> Vacation Mode</label></div>
                <div><label className="block text-sm font-medium">Return Policy</label><textarea name="returnPolicy" value={formData.returnPolicy} onChange={handleInputChange} className="mt-1 block w-full textarea textarea-bordered" rows="4"></textarea></div>
                <button type="submit" disabled={updateStatus.loading} className="btn btn-success">{updateStatus.loading ? 'Saving...' : 'Save Settings'}</button>
                {updateStatus.error && <p className="text-red-500 text-sm">{updateStatus.error}</p>}
                {updateStatus.success && <p className="text-green-500 text-sm">{updateStatus.success}</p>}
            </form>
        </div>
    );
}
