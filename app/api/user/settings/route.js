import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';

// Placeholder for database interaction
async function getUserSettings(userId) {
    // In a real app, fetch from database:
    // e.g., const settings = await db.userSettings.findUnique({ where: { userId: userId } });
    console.log(`Fetching settings for userId: ${userId}`);
    return {
        userId: userId,
        emailNotifications: true,
        smsNotifications: false,
        theme: 'light', // 'light' or 'dark'
        language: 'en',
        newsletterSubscribed: true,
    };
}

export async function GET(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    try {
        const settingsData = await getUserSettings(userPayload.userId);
        return NextResponse.json(settingsData);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return NextResponse.json({ message: 'Failed to fetch settings data.' }, { status: 500 });
    }
}
