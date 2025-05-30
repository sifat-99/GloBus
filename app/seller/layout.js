// app/seller/layout.js
export default function SellerLayout({ children }) {
    // This layout would typically include authentication and authorization checks
    // to ensure only authorized sellers can access these routes.
    // For simplicity, these checks are omitted here.
    return (
        <main className="p-4 flex-grow container mx-auto"> {/* Added flex-grow and container */}
            <nav className="mb-4 p-2 bg-gray-100 rounded">
                <h2 className="text-xl font-semibold">Seller Navigation</h2>
                {/* Add links to /seller/products, /seller/orders, /seller/earnings etc. */}
            </nav>
            <div className="border p-4 rounded bg-white shadow-sm">
                {children}
            </div>
        </main>
    );
}
