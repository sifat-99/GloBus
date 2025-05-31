// app/login/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const auth = useAuth();

    useEffect(() => {

        const user = localStorage.getItem('user');
        if (user) {
            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (user.role === 'seller') {
                router.push('/seller');
            } else if (user.role === 'user') {
                router.push('/dashboard'); // Default for 'user' role
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }
        , [auth, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            auth.login(response.data.user); // Use context to set user

            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: `Welcome, ${response.data.user.name}!`,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Redirect based on role
                const userRole = response.data.user.role;
                if (userRole === 'admin') {
                    router.push('/admin');
                } else if (userRole === 'seller') {
                    router.push('/seller');
                } else {
                    router.push('/dashboard'); // Default for 'user' role
                }
            });

        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.response?.data?.message || 'Please check your credentials.',
            });
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
