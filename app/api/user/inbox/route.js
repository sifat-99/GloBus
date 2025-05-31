import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';

// Placeholder for database interaction
async function getUserInbox(userId) {
    // In a real app, fetch from database:
    // e.g., const messages = await db.message.findMany({ where: { recipientId: userId }, orderBy: { sentDate: 'desc' } });
    console.log(`Fetching inbox for userId: ${userId}`);
    return [
        { id: 'msg001', sender: 'Admin', subject: 'Welcome to GloBus!', date: '2024-05-15', read: false, snippet: 'We are excited to have you...' },
        { id: 'msg002', sender: 'Support Team', subject: 'Your recent inquiry', date: '2024-05-14', read: true, snippet: 'Regarding your question about...' },
        { id: 'msg003', sender: 'Promotions', subject: 'Special Offer Just For You!', date: '2024-05-13', read: false, snippet: 'Don\'t miss out on our summer sale...' },
    ];
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
        const inboxData = await getUserInbox(userPayload.userId);
        return NextResponse.json(inboxData);
    } catch (error) {
        console.error('Error fetching user inbox:', error);
        return NextResponse.json({ message: 'Failed to fetch inbox data.' }, { status: 500 });
    }
}
