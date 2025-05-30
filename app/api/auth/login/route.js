// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }); // User not found
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }); // Incorrect password
        }

        const { password: _, ...userWithoutPassword } = user; // Exclude password from response

        // Create JWT
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const expirationTime = process.env.JWT_EXPIRES_IN || '1d';
        const token = await new SignJWT({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(expirationTime)
            .sign(jwtSecret);

        const cookieStore = await cookies(); // Await the cookies() function call
        cookieStore.set('session-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Or 'strict'
            path: '/',
            maxAge: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '86400', 10), // Default to 1 day
        });

        return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An unexpected error occurred during login.', details: error.message }, { status: 500 });
    }
}
