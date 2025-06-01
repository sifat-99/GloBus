'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';




export default function SSLCommerzDemoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        country: 'Bangladesh',
        sellerId: null, // Optional, if you need to set a seller ID
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserString = localStorage.getItem('user');
        console.log('Stored user data from localStorage:', storedUserString);
        setCustomerDetails((prev) => ({
            ...prev,
            ...(storedUserString ? JSON.parse(storedUserString) : {})
        }));
        const itemsQueryParam = searchParams.get('items');
        if (itemsQueryParam) {
            try {
                const decodedItems = JSON.parse(decodeURIComponent(itemsQueryParam));
                setCheckoutItems(decodedItems);
                const total = decodedItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
                setTotalAmount(total);
            } catch (e) {
                console.error('Failed to parse checkout items:', e);
                Swal.fire('Error', 'Invalid checkout data. Please try again.', 'error').then(() =>
                    router.push('/dashboard/cart')
                );
            }
        } else {
            Swal.fire('No Items', 'No items found for checkout. Redirecting to cart.', 'warning').then(() =>
                router.push('/dashboard/cart')
            );
        }
        setLoading(false);
    }, [searchParams, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleDemoPayment = async (e) => {
        e.preventDefault();
        if (
            !customerDetails.name ||
            !customerDetails.email ||
            !customerDetails.phone ||
            !customerDetails.address
        ) {
            Swal.fire('Missing Information', 'Please fill in all required customer details.', 'warning');
            return;
        }

        let userId = null;
        let userName = null;
        let sellerId = null;
        // Fallback to form name if needed
        if (customerDetails.name) {
            userName = customerDetails.name;
        }
        // Try to get userId from localStorage
        const storedUserString = localStorage.getItem('user');
        console.log('Stored user data from localStorage:',
            storedUserString
        );
        if (storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString);
                userId = storedUser._id;
            } catch (e) {
                console.error('Failed to parse stored user data:', e);
                Swal.fire('Error', 'Invalid user data in localStorage. Please log in again.', 'error');
                return;
            }
        }



        if (!userId) {
            Swal.fire('Authentication Error', 'User information not found. Please log in to proceed.', 'error');
            // Optionally, redirect to login: router.push('/login');
            return;
        }

        const transactionId = `DEMO_TXN_${Date.now()}`;
        const orderPayload = {
            userId,
            userName: userName || customerDetails.name, // Use stored userName, fallback to form name if needed
            items: checkoutItems,
            totalAmount: totalAmount,
            customerDetails: customerDetails, // Shipping/billing details from form
            transactionId: transactionId,
            paymentMethod: 'SSLCommerz (Demo)',
            orderStatus: 'Completed (Demo)', // Or 'Pending'
        };

        console.log('Order Payload to be sent to backend:', orderPayload);

        Swal.fire({
            title: 'Processing Demo Payment...',
            text: 'Simulating payment and saving your order. Please wait.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Simulate API call to save order
            // Replace '/api/orders' with your actual backend endpoint
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include Authorization header if your API requires it
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderPayload),
            });

            const result = await response.json(); // Assuming your API returns JSON

            if (!response.ok) {
                // If API returns an error, throw it to be caught by the catch block
                throw new Error(result.message || 'Failed to save the order.');
            }

            Swal.fire(
                'Demo Payment Successful!',
                `Your order has been placed (simulated). Transaction ID: ${transactionId}`,
                'success'
            ).then(() => router.push('/dashboard/orders'));

        } catch (error) {
            console.error('Error during demo payment or order saving:', error);
            Swal.fire('Error', error.message || 'An error occurred while processing your order.', 'error');
        }
    };

    if (loading || checkoutItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                Loading checkout details or redirecting...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">SSLCommerz Demo Payment</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    <div className="bg-white p-6 rounded-lg shadow">
                        {checkoutItems.map((item) => (
                            <div
                                key={item.productId || item.cartItemId}
                                className="flex justify-between items-center border-b py-3"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.name} (x{item.quantity})
                                    </p>
                                    <p className="text-sm text-gray-600">Price: ৳{item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold text-xl mt-4 pt-3 border-t">
                            <span>Total:</span>
                            <span>৳{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Customer & Shipping Details</h2>
                    <form onSubmit={handleDemoPayment} className="bg-white p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={customerDetails.name}
                            onChange={handleInputChange}
                            required
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={customerDetails.email}
                            onChange={handleInputChange}
                            required
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={customerDetails.phone}
                            onChange={handleInputChange}
                            required
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <textarea
                            name="address"
                            placeholder="Full Address"
                            value={customerDetails.address}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={customerDetails.city}
                            onChange={handleInputChange}
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="text"
                            name="postcode"
                            placeholder="Postcode"
                            value={customerDetails.postcode}
                            onChange={handleInputChange}
                            className="border p-3 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150"
                        >
                            Pay ৳{totalAmount.toFixed(2)} with SSLCommerz (Demo)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
