import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

// GET a specific product for the seller
export async function GET(request, { params }) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    const { productId } = await params;
    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const product = await db.collection('products').findOne({
            _id: new ObjectId(productId),
            sellerId: new ObjectId(userPayload.userId) // Ensure seller owns this product
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found or you do not have permission to view it.' }, { status: 404 });
        }
        // Serialize _id and other ObjectIds if necessary
        product._id = product._id.toString();
        if (product.sellerId) product.sellerId = product.sellerId.toString();

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('Error fetching product by seller:', error);
        return NextResponse.json({ message: 'Failed to fetch product.', details: error.message }, { status: 500 });
    }
}


// PUT to update a product by the seller
export async function PUT(request, { params }) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    const { productId } = await params;
    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const db = await getDb();
        const productsCollection = db.collection('products');

        // Exclude fields that shouldn't be updated directly by seller or are immutable
        const { _id, sellerId, createdAt, ratings, status: currentStatus, ...updateDataFromClient } = body;

        const updateFields = { ...updateDataFromClient };

        // Recalculate discounted price if original price or percentage changes
        if (updateFields.discount && (updateFields.discount.original_price !== undefined || updateFields.discount.percentage !== undefined)) {
            const currentProduct = await productsCollection.findOne({ _id: new ObjectId(productId), sellerId: new ObjectId(userPayload.userId) });
            if (!currentProduct) {
                return NextResponse.json({ message: 'Product not found or you do not have permission to update it.' }, { status: 404 });
            }
            const originalPrice = parseFloat(updateFields.discount.original_price !== undefined ? updateFields.discount.original_price : currentProduct.discount.original_price) || 0;
            const discountPercentage = parseFloat(updateFields.discount.percentage !== undefined ? updateFields.discount.percentage : currentProduct.discount.percentage) || 0;
            updateFields.discount.discounted_price = originalPrice - (originalPrice * (discountPercentage / 100));
            updateFields.discount.currency = updateFields.discount.currency || currentProduct.discount.currency || 'BDT';
        }

        // Handle availability if total_quantity changes
        if (updateFields.availability && updateFields.availability.total_quantity !== undefined) {
            const currentProduct = await productsCollection.findOne({ _id: new ObjectId(productId), sellerId: new ObjectId(userPayload.userId) });
            if (!currentProduct) {
                return NextResponse.json({ message: 'Product not found or you do not have permission to update it.' }, { status: 404 });
            }
            const newTotalQuantity = parseInt(updateFields.availability.total_quantity) || 0;
            const soldQuantity = currentProduct.availability.sold || 0;
            updateFields.availability.remaining = Math.max(0, newTotalQuantity - soldQuantity);
            updateFields.availability.sold = soldQuantity;
        }

        const updatePayload = {
            $set: {
                ...updateFields,
                updatedAt: new Date(),
                status: 'pending' // Reset status to 'pending' for admin review after any edit
            }
        };

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId), sellerId: new ObjectId(userPayload.userId) },
            updatePayload
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Product not found or you do not have permission to update it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product updated successfully and is pending re-approval.' }, { status: 200 });

    } catch (error) {
        console.error('Error updating product by seller:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Failed to update product.', details: error.message }, { status: 500 });
    }
}

// DELETE a product by the seller
export async function DELETE(request, { params }) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    const { productId } = params;
    if (!isValidObjectId(productId)) {
        return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const result = await db.collection('products').deleteOne({
            _id: new ObjectId(productId),
            sellerId: new ObjectId(userPayload.userId) // Ensure seller owns this product
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Product not found or you do not have permission to delete it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product by seller:', error);
        return NextResponse.json({ message: 'Failed to delete product.', details: error.message }, { status: 500 });
    }
}
