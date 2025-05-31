// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db'; // Ensure this path is correct
import { ObjectId } from 'mongodb';

export async function PUT(request, { params }) {
    const { userId } = params;
    try {
        const token = request.cookies.get('session-token')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const adminPayload = await verifyToken(token);
        if (!adminPayload || adminPayload.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
        }

        const body = await request.json();
        const { role, isActive } = body;

        const updateData = {};
        if (role !== undefined) {
            if (!['user', 'seller', 'admin'].includes(role)) { // Define allowed roles
                return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
            }
            updateData.role = role;
        }
        if (isActive !== undefined && typeof isActive === 'boolean') {
            // Assuming your User model has an 'isActive' field.
            // If not, you'll need to add it or adjust this logic.
            updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No valid update fields provided (e.g., role, isActive)' }, { status: 400 });
        }

        const db = await getDb();
        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: updateData },
            { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result.value) {
            return NextResponse.json({ message: 'User not found or no update was necessary' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: result.value }, { status: 200 });

    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error while updating user' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { userId } = params;
    try {
        const token = request.cookies.get('session-token')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const adminPayload = await verifyToken(token);
        if (!adminPayload || adminPayload.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
        }

        // Prevent admin from deleting their own account through this endpoint
        if (adminPayload.userId === userId) { // Ensure verifyToken returns userId in payload
            return NextResponse.json({ message: 'Cannot delete your own account via this interface.' }, { status: 400 });
        }

        const db = await getDb();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error while deleting user' }, { status: 500 });
    }
}
