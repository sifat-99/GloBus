// app/api/admin/products/[productId]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Helper to validate ObjectId
function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

// DELETE a product
export async function DELETE(request, { params }) {
    const { productId } = params;

    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const productsCollection = db.collection('products');

        const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Product not found or already deleted' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete product:', error);
        return NextResponse.json({ message: 'Failed to delete product', details: error.message }, { status: 500 });
    }
}

// PUT to update product status (e.g., approve)
export async function PUT(request, { params }) {
    const { productId } = params;

    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
    }

    try {
        const { status } = await request.json(); // Expecting { "status": "approved" | "pending" | "rejected" }

        if (!['approved', 'pending', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status value. Must be one of: approved, pending, rejected.' }, { status: 400 });
        }

        const db = await getDb();
        const productsCollection = db.collection('products');

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { status: status, updatedAt: new Date() } } // also update an 'updatedAt' timestamp
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: `Product status updated to ${status}` }, { status: 200 });

    } catch (error) {
        console.error('Failed to update product status:', error);
        if (error instanceof SyntaxError) { // Handle JSON parsing errors
            return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Failed to update product status', details: error.message }, { status: 500 });
    }
}
