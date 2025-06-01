// app/admin/users/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' }); // type: 'success' or 'error'

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        setActionMessage({ type: '', text: '' }); // Clear previous messages
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data.users || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users.');
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updateData) => {
        setActionMessage({ type: '', text: '' });
        try {
            const response = await axios.put(`/api/admin/users/${userId}`, updateData);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, ...response.data.user } : user
                )
            );
            setActionMessage({ type: 'success', text: response.data.message || 'User updated successfully.' });
        } catch (err) {
            // setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update user.' });
            console.error('Update user error:', err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        setActionMessage({ type: '', text: '' });
        try {
            const response = await axios.delete(`/api/admin/users/${userId}`);
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            setActionMessage({ type: 'success', text: response.data.message || 'User deleted successfully.' });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user.' });
            console.error('Delete user error:', err);
        }
    };

    if (loading) return <p className="text-center mt-8">Loading users...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Manage Users</h1>

            {actionMessage.text && (
                <p className={`mb-4 text-center p-2 rounded ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {actionMessage.text}
                </p>
            )}

            {users.length === 0 && !loading ? (
                <p className="text-center mt-4">No users found.</p>
            ) : (
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Name</th>
                                <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Email</th>
                                <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Role</th>
                                <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Status</th>
                                <th scope="col" className="px-3 py-2 md:px-6 md:py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap">{user.name || 'N/A'}</td>
                                    <td className="px-3 py-2 md:px-6 md:py-4">{user.email}</td>
                                    <td className="px-3 py-2 md:px-6 md:py-4">{user.role}</td>
                                    <td className="px-3 py-2 md:px-6 md:py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.isActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 space-x-1 md:space-x-2 whitespace-nowrap">
                                        {user.role === 'user' && (
                                            <button onClick={() => handleUpdateUser(user._id, { role: 'seller' })} className="font-medium text-blue-600 hover:underline text-xs sm:text-sm">Make Seller</button>
                                        )}
                                        {user.role === 'seller' && (
                                            <button onClick={() => handleUpdateUser(user._id, { role: 'user' })} className="font-medium text-blue-600 hover:underline text-xs sm:text-sm">Make User</button>
                                        )}
                                        {/* Consider if admin should change other admins' roles or their own status via this UI */}
                                        {user.isActive !== false ? (
                                            <button onClick={() => handleUpdateUser(user._id, { isActive: false })} className="font-medium text-yellow-600 hover:underline text-xs sm:text-sm">Deactivate</button>
                                        ) : (
                                            <button onClick={() => handleUpdateUser(user._id, { isActive: true })} className="font-medium text-green-600 hover:underline text-xs sm:text-sm">Activate</button>
                                        )}
                                        <button onClick={() => handleDeleteUser(user._id)} className="font-medium text-red-600 hover:underline text-xs sm:text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
