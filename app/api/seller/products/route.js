import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

async function getSellerProducts(sellerId) {
    const db = await getDb();
    const productsFromDB = await db.collection('products').find({ sellerId: new ObjectId(sellerId) }).sort({ createdAt: -1 }).toArray();
    console.log(`Fetching products for sellerId: ${sellerId}`);

    // Return products with _id as string and other relevant fields
    return productsFromDB.map(p => ({
        ...p, // Spread all original product fields
        _id: p._id.toString(), // Ensure _id is a string
        sellerId: p.sellerId.toString(), // Ensure sellerId is a string
    }));
}

export async function GET(request) {

    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    try {
        const productsData = await getSellerProducts(userPayload.userId);
        return NextResponse.json(productsData);
    } catch (error) {
        console.error('Error fetching seller products:', error);
        return NextResponse.json({ message: 'Failed to fetch seller products.' }, { status: 500 });
    }
}

export async function POST(request) {
    const token = request.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload || !userPayload.userId || userPayload.role !== 'seller') {
        return NextResponse.json({ message: 'Access denied or invalid token for seller.' }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Basic validation (more comprehensive validation should be added)
        if (!body.model || !body.brand || !body.category || !body.discount?.original_price || !body.availability?.total_quantity || !body.image_url) {
            return NextResponse.json({ message: 'Missing required product fields.' }, { status: 400 });
        }

        const db = await getDb();
        const productsCollection = db.collection('products');

        const originalPrice = parseFloat(body.discount.original_price) || 0;
        const discountPercentage = parseFloat(body.discount.percentage) || 0;
        const discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));
        const totalQuantity = parseInt(body.availability.total_quantity) || 0;

        const newProduct = {
            product_id: body.product_id || `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`, // Auto-generate if not provided
            brand: body.brand,
            model: body.model, // Product Title
            category: body.category,
            type: body.type || '',
            description: body.description || '',
            technology: body.technology || '',
            warranty: {
                parts: body.warranty?.parts || '',
                service: body.warranty?.service || '',
            },
            badges: Array.isArray(body.badges) ? body.badges : [],
            discount: {
                percentage: discountPercentage,
                original_price: originalPrice,
                discounted_price: discountedPrice,
                currency: body.discount?.currency || 'BDT',
            },
            ratings: { // Default ratings
                stars: 0,
                total_reviews: 0,
            },
            availability: {
                total_quantity: totalQuantity,
                sold: 0, // New product, so 0 sold
                remaining: totalQuantity,
            },
            features: Array.isArray(body.features) ? body.features : [],
            vendor: body.vendor || userPayload.name, // Default to seller's name or shop name from profile
            image_url: body.image_url,
            labels: Array.isArray(body.labels) ? body.labels : [],
            service_includes: Array.isArray(body.service_includes) ? body.service_includes : [],
            sellerId: new ObjectId(userPayload.userId),
            status: 'pending', // All new products are pending approval
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await productsCollection.insertOne(newProduct);

        return NextResponse.json({ message: 'Product added successfully and is pending approval.', productId: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error('Error adding new product:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Failed to add new product.', details: error.message }, { status: 500 });
    }
}

// TODO: Implement PUT for updating a product
// export async function PUT(request) { ... }
