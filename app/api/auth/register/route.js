// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await usersCollection.insertOne({
            name,
            email,
            password: hashedPassword,
            role, // 'user' or 'seller'
            createdAt: new Date(),
        });

        if (result.insertedId) {
            return NextResponse.json({ message: 'User registered successfully', userId: result.insertedId }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'User registration failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Registration error:', error);
        // Sanitize error message for client
        let errorMessage = 'An unexpected error occurred during registration.';
        if (error.message.includes('duplicate key error')) { // Example of more specific error handling
            errorMessage = 'User with this email already exists.';
            return NextResponse.json({ message: errorMessage }, { status: 409 });
        }
        return NextResponse.json({ message: errorMessage, details: error.message }, { status: 500 });
    }
}
