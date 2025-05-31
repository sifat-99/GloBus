// app/api/user/cart/[cartItemId]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/authUtils';

async function getVerifiedUserId(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return null;
    const userPayload = await verifyToken(token);
    return userPayload?.userId;
}

// Helper to validate ObjectId
function isValidObjectId(id) {
    return ObjectId.isValid(id) && (String(new ObjectId(id)) === id);
}

// PUT to update cart item quantity
export async function PUT(request, { params }) {
    const { cartItemId } = await params;
    const userId = await getVerifiedUserId(request);

    if (!userId) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    if (!isValidObjectId(cartItemId)) {
        return NextResponse.json({ message: 'Invalid cart item ID format.' }, { status: 400 });
    }

    try {
        const { quantity: newQuantityFromRequest } = await request.json();

        if (typeof newQuantityFromRequest !== 'number' || newQuantityFromRequest < 0) {
            return NextResponse.json({ message: 'Invalid quantity.' }, { status: 400 });
        }

        const db = await getDb();
        const cartsCollection = db.collection('carts');
        const productsCollection = db.collection('products');
        // const session = db.client.startSession(); // Removed session

        try {
            // await session.withTransaction(async () => { // Removed transaction
            const cartItem = await cartsCollection.findOne({ _id: new ObjectId(cartItemId), userId: new ObjectId(userId) }/*, { session }*/);

            if (!cartItem) {
                return NextResponse.json({ message: 'Cart item not found or not authorized.' }, { status: 404 });
            }

            const oldQuantityInCart = cartItem.quantity;
            const productId = cartItem.productId;

            if (newQuantityFromRequest === 0) {
                // Treat as deletion: restore stock and delete item
                await productsCollection.updateOne(
                    { _id: new ObjectId(productId) },
                    { $inc: { 'availability.remaining': oldQuantityInCart, 'availability.sold': -oldQuantityInCart } }
                    // { session }
                );
                const deleteResult = await cartsCollection.deleteOne({ _id: new ObjectId(cartItemId) }/*, { session }*/);
                if (deleteResult.deletedCount === 0) {
                    // This should ideally not happen if cartItem was found
                    return NextResponse.json({ message: 'Failed to delete cart item.' }, { status: 500 });
                }
            } else {
                // Update quantity: adjust stock
                const quantityDifference = newQuantityFromRequest - oldQuantityInCart;

                if (quantityDifference > 0) { // Quantity increased
                    const product = await productsCollection.findOne({ _id: new ObjectId(productId) }/*, { session }*/);
                    if (!product || product.availability.remaining < quantityDifference) {
                        return NextResponse.json({ message: 'Not enough stock available for quantity increase.' }, { status: 400 });
                    }
                    await productsCollection.updateOne(
                        { _id: new ObjectId(productId), 'availability.remaining': { $gte: quantityDifference } },
                        { $inc: { 'availability.remaining': -quantityDifference, 'availability.sold': quantityDifference } }
                        // { session }
                    );
                } else if (quantityDifference < 0) { // Quantity decreased
                    await productsCollection.updateOne(
                        { _id: new ObjectId(productId) },
                        { $inc: { 'availability.remaining': -quantityDifference, 'availability.sold': quantityDifference } } // quantityDifference is negative
                        // { session }
                    );
                }
                // If quantityDifference is 0, no stock change, only cart update

                const updateResult = await cartsCollection.updateOne(
                    { _id: new ObjectId(cartItemId) },
                    { $set: { quantity: newQuantityFromRequest, updatedAt: new Date() } }
                    // { session }
                );
                if (updateResult.matchedCount === 0) {
                    return NextResponse.json({ message: 'Failed to update cart item quantity.' }, { status: 500 });
                }
            }
            // }); // End transaction // Removed transaction

            if (newQuantityFromRequest === 0) {
                return NextResponse.json({ message: 'Cart item removed and stock updated.' });
            }
            return NextResponse.json({ message: 'Cart item quantity updated and stock adjusted.' });
        } catch (error) {
            console.error('Transaction failed in PUT /api/user/cart/[cartItemId]:', error);
            // await session.abortTransaction(); // Removed session
            // Add manual rollback logic here if necessary and feasible
            return NextResponse.json({ message: error.message || 'Failed to update cart item.', details: error.message }, { status: error.message.includes('stock') ? 400 : 500 });
        }
    } catch (error) {
        console.error('Failed to update cart item:', error);
        return NextResponse.json({ message: 'Outer error: Failed to update cart item.', details: error.message }, { status: 500 });
    }
}

// DELETE a cart item
export async function DELETE(request, { params }) {
    const { cartItemId } = params;
    const userId = await getVerifiedUserId(request);

    if (!userId) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    if (!isValidObjectId(cartItemId)) return NextResponse.json({ message: 'Invalid cart item ID.' }, { status: 400 });

    const db = await getDb();
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');
    // const session = db.client.startSession(); // Removed session

    try {
        // await session.withTransaction(async () => { // Removed transaction
        const cartItem = await cartsCollection.findOne({ _id: new ObjectId(cartItemId), userId: new ObjectId(userId) }/*, { session }*/);

        if (!cartItem) {
            return NextResponse.json({ message: 'Cart item not found or not authorized.' }, { status: 404 });
        }

        const { productId, quantity } = cartItem;

        // Increase product stock
        await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $inc: { 'availability.remaining': quantity, 'availability.sold': -quantity } }
            // { session }
        );

        // Delete cart item
        const result = await cartsCollection.deleteOne({ _id: new ObjectId(cartItemId) }/*, { session }*/);
        if (result.deletedCount === 0) {
            // This should ideally not happen if cartItem was found
            // Potentially roll back stock increase if possible
            return NextResponse.json({ message: 'Failed to delete cart item.' }, { status: 500 });
        }
        // }); // End transaction // Removed transaction
        return NextResponse.json({ message: 'Cart item removed and stock updated successfully.' });
    } catch (error) {
        console.error('Transaction failed in DELETE /api/user/cart/[cartItemId]:', error);
        // await session.abortTransaction(); // Removed session
        // Add manual rollback logic here if necessary and feasible
        return NextResponse.json({ message: error.message || 'Failed to remove cart item.', details: error.message }, { status: 500 });
    }
}
