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

export default function SettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Add state for form inputs if you plan to make settings editable

    useEffect(() => {
        const loadSettingsData = async () => {
            try {
                const data = await fetchData('/api/user/settings');
                setSettings(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadSettingsData();
    }, []);

    // Handle form submission for updating settings
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        // Implement API call to update settings
        console.log("Saving settings:", settings);
        // Example: await fetch('/api/user/settings', { method: 'PUT', body: JSON.stringify(settings), headers: {'Content-Type': 'application/json'} });
        alert("Settings saved (mock)! Implement API call.");
    };

    if (loading) return <div className="container mx-auto p-4"><p>Loading settings...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading settings: {error}</p></div>;
    if (!settings) return <div className="container mx-auto p-4"><p>No settings data found.</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
            <form onSubmit={handleSaveChanges} className="space-y-6 p-6 border rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                    <input type="checkbox" checked={settings.emailNotifications} onChange={e => setSettings(s => ({ ...s, emailNotifications: e.target.checked }))} className="mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                    <input type="checkbox" checked={settings.smsNotifications} onChange={e => setSettings(s => ({ ...s, smsNotifications: e.target.checked }))} className="mt-1" />
                </div>
                {/* Add more settings fields here: Theme, Language, Newsletter */}
                <p><strong>Theme:</strong> {settings.theme}</p>
                <p><strong>Language:</strong> {settings.language}</p>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Changes</button>
            </form>
        </div>
    );
}
