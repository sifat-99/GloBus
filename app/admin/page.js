// app/admin/page.js
'use client';

import Link from 'next/link';

export default function AdminRootPage() {
    return (
        <div className="p-4 sm:p-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>
            <p className="mb-4 text-sm sm:text-base">Welcome to the admin dashboard. Select a section to manage:</p>
            <ul className="space-y-3 sm:space-y-2">
                <li>
                    <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg">
                        Manage Products (Dashboard)
                    </Link>
                </li>
                <li>
                    <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg">
                        Manage Products
                    </Link>
                </li>
                <li>
                    <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg">
                        Manage Users
                    </Link>
                </li>
                <li>
                    <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg">
                        Reports
                    </Link>
                </li>
                <li>
                    <Link href="/admin/settings" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg">
                        Admin Settings
                    </Link>
                </li>
                {/* Add links to other admin sections here as they are created, e.g., Manage Orders */}
            </ul>
        </div>
    );
}
