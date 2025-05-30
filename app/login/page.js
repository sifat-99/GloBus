// app/login/page.js
'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const auth = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
    setError('');
    setSuccess('');

    try {
        const response = await axios.post('/api/auth/login', { email, password });
        setSuccess(response.data.message + `. Welcome, ${response.data.user.name}!`);
        auth.login(response.data.user); // Use context to set user

        // Redirect based on role
        const userRole = response.data.user.role;
        if (userRole === 'admin') { // Assuming you have an 'admin' role
            router.push('/admin');
        } else if (userRole === 'seller') {
            router.push('/seller');
        } else {
            router.push('/dashboard'); // Default for 'user' role
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        console.error('Login error:', err.response?.data || err.message);
    }
    };

    return (
        <main className="min-h-screen  flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex-grow"> {/* Added flex-grow */}
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
            {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded">{error}</p>}
            {success && <p className="text-center text-green-500 bg-green-100 p-2 rounded">{success}</p>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <button type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <p>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
