// app/api/admin/me/update/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Adjust path
import User from '@/models/User'; // Adjust path
import { verifyToken } from '@/lib/authUtils'; // Adjust path
// You might need bcrypt if you allow password updates
// import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        const token = request.cookies.get('session-token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userPayload = await verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email /*, currentPassword, newPassword */ } = body;

        if (!name || !email) {
            return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
        }

        await connectToDatabase();

        const admin = await User.findById(userPayload.id);

        if (!admin) {
            return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }

        // Update fields
        admin.name = name;
        admin.email = email; // Consider if email changes require re-verification

        // Example: Password update (ensure you handle this securely)
        // if (currentPassword && newPassword) {
        //     const isMatch = await bcrypt.compare(currentPassword, admin.password);
        //     if (!isMatch) {
        //         return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
        //     }
        //     admin.password = await bcrypt.hash(newPassword, 10);
        // }

        await admin.save();
        const { password, ...adminData } = admin.toObject(); // Exclude password from response

        return NextResponse.json({ message: 'Admin details updated successfully', admin: adminData }, { status: 200 });

    } catch (error) {
        console.error('Error updating admin details:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
        if (error.code === 11000) { // MongoDB duplicate key error
            return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
