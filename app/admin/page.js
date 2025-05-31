// app/admin/page.js
'use client';

import Link from 'next/link';

export default function AdminRootPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <p className="mb-4">Welcome to the admin dashboard. Select a section to manage:</p>
            <ul className="space-y-2">
                <li>
                    <Link href="/admin/products" className="text-blue-500 hover:underline">
                        Manage Products
                    </Link>
                </li>
                <li>
                    <Link href="/admin/users" className="text-blue-500 hover:underline">
                        Manage Users
                    </Link>
                </li>
                <li>
                    <Link href="/admin/reports" className="text-blue-500 hover:underline">
                        Reports
                    </Link>
                </li>
                <li>
                    <Link href="/admin/settings" className="text-blue-500 hover:underline">
                        Admin Settings
                    </Link>
                </li>
                {/* Add links to other admin sections here as they are created, e.g., Manage Orders */}
            </ul>
        </div>
    );
}
