import ResponsiveDrawer from "@/Components/DashNav";

// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
    // This layout would typically include authentication checks
    // to ensure only logged-in users can access the dashboard.
    // For simplicity, these checks are omitted here.
    return (
        <main > {/* Added flex-grow and container */}
            <ResponsiveDrawer>
                {children}
            </ResponsiveDrawer>
        </main>
    );
}
