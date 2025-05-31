import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Placeholder for database interaction
async function getUserCart(userId) {
    const db = await getDb();
    // Fetch cart items for the user, potentially joining with product details
    // For simplicity, this example assumes cart items store necessary product info or are joined elsewhere.
    const cartItems = await db.collection('carts').find({ userId: new ObjectId(userId) }).toArray();
    console.log(`Fetching cart for userId: ${userId}`, cartItems);
    return cartItems.map(item => ({
        ...item,
        // Ensure productId and other IDs are strings if needed by frontend
        productId: item.productId.toString(),
        sellerId: item.sellerId.toString(),
        userId: item.userId.toString(),
        _id: item._id.toString()
    }));
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
        const cartData = await getUserCart(userPayload.userId);
        return NextResponse.json(cartData);
    } catch (error) {
        console.error('Error fetching user cart:', error);
        return NextResponse.json({ message: 'Failed to fetch cart data.' }, { status: 500 });
    }
}

export async function POST(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    try {
        const { productId, quantity } = await request.json();

        if (!productId || !quantity || quantity < 1) {
            return NextResponse.json({ message: 'Product ID and valid quantity are required.' }, { status: 400 });
        }

        const db = await getDb();
        const productsCollection = db.collection('products');
        const cartsCollection = db.collection('carts');

        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        try {
            // Re-fetch product for up-to-date stock
            const currentProduct = await productsCollection.findOne({ _id: new ObjectId(productId) });
            if (!currentProduct) {
                // This case should ideally be caught by the earlier 'product' check
                return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
            }

            const existingCartItem = await cartsCollection.findOne({
                userId: new ObjectId(userPayload.userId),
                productId: new ObjectId(productId),
            });

            console.log("currentProduct:", currentProduct);

            if (currentProduct.availability.remaining < quantity) {
                return NextResponse.json({ message: 'Not enough stock available.' }, { status: 400 });
            }

            // Decrease product stock
            const stockUpdateResult = await productsCollection.updateOne(
                { _id: new ObjectId(productId), 'availability.remaining': { $gte: quantity } },
                {
                    $inc: {
                        'availability.remaining': -quantity,
                        'availability.sold': quantity
                    }
                }
            );

            if (stockUpdateResult.modifiedCount === 0) {
                // This could happen if stock was depleted between the read and write.
                return NextResponse.json({ message: 'Failed to update product stock. Stock may have changed. Please try again.' }, { status: 409 }); // 409 Conflict
            }

            if (existingCartItem) {
                await cartsCollection.updateOne(
                    { _id: existingCartItem._id },
                    { $inc: { quantity: quantity }, $set: { updatedAt: new Date() } }
                );
            } else {
                const cartItem = {
                    userId: new ObjectId(userPayload.userId),
                    productId: new ObjectId(productId),
                    sellerId: product.sellerId,
                    quantity: quantity,
                    productName: product.model,
                    price: product.discount?.discounted_price || product.price,
                    imageUrl: product.image_url,
                    addedAt: new Date(),
                };
                await cartsCollection.insertOne(cartItem);
            }

            return NextResponse.json({ message: 'Product processed in cart and stock updated.' }, { status: existingCartItem ? 200 : 201 });
        } catch (error) {
            console.error('Error processing cart and stock:', error);
            // Manual rollback attempt if needed:
            // if (stockUpdateResult && stockUpdateResult.modifiedCount > 0) {
            //     await productsCollection.updateOne({ _id: new ObjectId(productId) }, { $inc: { stock: quantity } });
            //     console.warn('Rolled back stock for productId:', productId);
            // }
            return NextResponse.json({ message: error.message || 'Failed to process cart.', error: error.message }, { status: error.message.includes('stock') ? 400 : 500 });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json({ message: 'Failed to add product to cart.', error: error.message }, { status: 500 });
    }
}
