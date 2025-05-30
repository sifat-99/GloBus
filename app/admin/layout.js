// app/admin/layout.js
export default function AdminLayout({ children }) {
    // This layout would typically include authentication and authorization checks
    // to ensure only admin users can access these routes.
    // For simplicity, these checks are omitted here.
    return (
        <main className="p-4 flex-grow container mx-auto"> {/* Added flex-grow and container */}
            <nav className="mb-4 p-2 bg-gray-100 rounded">
                <h2 className="text-xl font-semibold">Admin Navigation</h2>
                {/* Add links to /admin/products, /admin/users, /admin/orders etc. */}
            </nav>
            <div className="border p-4 rounded bg-white shadow-sm">
                {children}
            </div>
        </main>
    );
}
