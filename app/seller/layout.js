import ResponsiveDrawer from "@/Components/DashNav";

export default function SellerDashboardLayout({ children }) {
    // This layout would use the ResponsiveDrawer (DashNav)
    // The DashNav component should already handle showing seller-specific menu items
    // based on the authenticated user's role.
    return (
        <main>
            <ResponsiveDrawer>{children}</ResponsiveDrawer>
        </main>
    );
}
