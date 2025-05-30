// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
    // This layout would typically include authentication checks
    // to ensure only logged-in users can access the dashboard.
    // For simplicity, these checks are omitted here.
    return (
        <main className="p-4 flex-grow container mx-auto"> {/* Added flex-grow and container */}
            <nav className="mb-4 p-2 bg-gray-100 rounded">
                <h2 className="text-xl font-semibold">User Dashboard Navigation</h2>
                {/* Add links to /dashboard/orders, /dashboard/profile etc. */}
            </nav>
            <div className="border p-4 rounded bg-white shadow-sm">
                {children}
            </div>
        </main>
    );
}
