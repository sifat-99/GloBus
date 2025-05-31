'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image'; // If you have image URLs

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    return response.json();
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const loadCartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchData('/api/user/cart');
                // Initialize isSelected for each item
                setCartItems(data.map(item => ({ ...item, isSelected: false })));
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadCartData();
    }, []);

    const handleUpdateQuantity = async (cartItemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;

        if (newQuantity <= 0) {
            Swal.fire({
                title: 'Remove item?',
                text: "Are you sure you want to remove this item from your cart?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await handleRemoveItem(cartItemId, true); // Pass skipConfirmation = true
                }
            });
            return;
        }

        try {
            const response = await fetch(`/api/user/cart/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update quantity');

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );
            // Swal.fire('Updated!', 'Quantity updated successfully.', 'success'); // Optional: too noisy
        } catch (err) {
            setError(err.message);
            Swal.fire('Error', err.message || 'Could not update quantity.', 'error');
        }
    };

    const handleRemoveItem = async (cartItemId, skipConfirmation = false) => {
        const confirmRemoval = async () => {
            try {
                const response = await fetch(`/api/user/cart/${cartItemId}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to remove item');

                setCartItems(prevItems => prevItems.filter(item => item._id !== cartItemId));
                Swal.fire('Removed!', result.message || 'Item removed from cart.', 'success');
            } catch (err) {
                setError(err.message);
                Swal.fire('Error', err.message || 'Could not remove item.', 'error');
            }
        };

        if (skipConfirmation) {
            await confirmRemoval();
        } else {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    confirmRemoval();
                }
            });
        }
    };

    const handleToggleSelectItem = (cartItemId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === cartItemId ? { ...item, isSelected: !item.isSelected } : item
            )
        );
    };

    const handleProceedToCheckout = () => {
        const selectedItems = cartItems.filter(item => item.isSelected);
        if (selectedItems.length === 0) {
            Swal.fire('No items selected', 'Please select items to proceed to checkout.', 'info');
            return;
        }
        // For now, log selected items. Implement navigation to checkout page as needed.
        console.log('Selected items for checkout:', selectedItems.map(item => ({ productId: item.productId, quantity: item.quantity, cartItemId: item._id })));
        Swal.fire('Proceeding', `Proceeding with ${selectedItems.length} item(s). Implement checkout navigation.`, 'info');
        // Example: router.push('/checkout'); // You might pass selected items via query or context
    };

    const calculateSubtotal = (item) => item.quantity * item.price;
    const calculateTotal = () => cartItems.reduce((total, item) => total + (item.isSelected ? calculateSubtotal(item) : 0), 0);

    if (loading) return <div className="container mx-auto p-4"><p>Loading cart...</p></div>;
    if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading cart: {error}</p></div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Cart</h1>
            {cartItems.length > 0 ? (
                <div className="space-y-4">
                    {cartItems.map(item => {
                        const subtotal = calculateSubtotal(item);
                        return (
                            <div key={item._id} className="flex flex-col md:flex-row items-start md:items-center p-4 border rounded-lg shadow gap-4">
                                <input
                                    type="checkbox"
                                    checked={item.isSelected}
                                    onChange={() => handleToggleSelectItem(item._id)}
                                    className="form-checkbox h-5 w-5 text-indigo-600 mr-2 self-center md:self-auto"
                                />
                                {item.imageUrl && (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.productName || 'Product Image'}
                                        width={80}
                                        height={80}
                                        className="rounded object-cover"
                                    />
                                )}
                                <div className="flex-grow">
                                    <h2 className="text-xl font-semibold">{item.productName || 'Product Name N/A'}</h2>
                                    <p className="text-sm text-gray-600">Price: ৳{item.price.toFixed(2)} each</p>
                                    <div className="flex items-center space-x-2 my-2">
                                        <button onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)} className="px-2 py-1 border rounded hover:bg-gray-100">-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)} className="px-2 py-1 border rounded hover:bg-gray-100">+</button>
                                    </div>
                                </div>
                                <div className="text-right md:text-left">
                                    <p className="text-lg font-semibold">Subtotal: ৳{subtotal.toFixed(2)}</p>
                                    <button
                                        onClick={() => handleRemoveItem(item._id)}
                                        className="text-red-500 hover:text-red-700 text-sm mt-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div className="text-right mt-6">
                        <p className="text-xl font-semibold mb-2">Total for selected items: ৳{calculateTotal().toFixed(2)}</p>
                        <button
                            onClick={handleProceedToCheckout}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            disabled={cartItems.filter(item => item.isSelected).length === 0}
                        >
                            Proceed to Checkout with Selected Items
                        </button>
                    </div>
                </div>
            ) : <p>Your cart is empty.</p>}
        </div>
    );
}
