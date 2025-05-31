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

export default function InboxPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInboxData = async () => {
            try {
                const data = await fetchData('/api/user/inbox');
                setMessages(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadInboxData();
    }, []);

    if (loading) return <div className="container mx-auto p-4"><p>Loading inbox...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading inbox: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Inbox ({messages.filter(msg => !msg.read).length} unread)</h1>
            {messages.length > 0 ? (
                <ul className="space-y-3">
                    {messages.map(message => (
                        <li key={message.id} className={`p-4 border rounded-lg shadow ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-1">
                                <h2 className={`text-lg font-semibold ${!message.read ? 'text-blue-700' : ''}`}>{message.subject}</h2>
                                <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-center">{new Date(message.date).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-600">From: {message.sender}</p>
                            <p className="mt-1 text-gray-700">{message.snippet}</p>
                            {/* Add click handler to mark as read or navigate to full message view */}
                        </li>
                    ))}
                </ul>
            ) : <p>Your inbox is empty.</p>}
        </div>
    );
}
