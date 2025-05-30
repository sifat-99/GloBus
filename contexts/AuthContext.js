// contexts/AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To handle initial auth state check
    const router = useRouter();

    useEffect(() => {
        // Check for user in localStorage on initial load
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user'); // Clear corrupted item
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        // Redirect logic can be handled by the page calling login or here
        // Example:
        // if (userData.role === 'admin') router.push('/admin');
        // else if (userData.role === 'seller') router.push('/seller');
        // else router.push('/dashboard');
    };

    const logout = async () => {
        localStorage.removeItem('user');
        setUser(null);
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error("Failed to clear session cookie via API:", error);
            // Proceed with client-side logout anyway
        }
        router.push('/login');
    };

    const value = {
        user,
        setUser, // You might not need to expose setUser directly if login/logout handle it
        login,
        logout,
        isAuthenticated: !!user,
        loading, // Expose loading state for initial auth check
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    if (context === null && process.env.NODE_ENV === 'development') {
        // This warning helps during development if the provider is missing.
        // In Next.js 13+ with server components, context might be null initially on the server.
        // The client-side useEffect in AuthProvider will set the actual context value.
        console.warn('AuthContext is null, ensure AuthProvider wraps this component.');
    }
    return context;
};
