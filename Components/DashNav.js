'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

// Define menu items for different roles
const userMenuItems = [
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/dashboard' },
    { text: 'My Orders', icon: <ListAltIcon />, path: '/dashboard/orders' },
    { text: 'Cart', icon: <ShoppingCartIcon />, path: '/dashboard/cart' },
    { text: 'Wishlist', icon: <FavoriteBorderIcon />, path: '/dashboard/wishlist' },
    { text: 'Inbox', icon: <InboxIcon />, path: '/dashboard/inbox' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

const adminMenuItems = [
    { text: 'Overview', icon: <InboxIcon />, path: '/admin/dashboard' },
    { text: 'Manage Users', icon: <AccountCircleIcon />, path: '/admin/users' },
    { text: 'Manage Products', icon: <ShoppingCartIcon />, path: '/admin/products' },
    { text: 'Reports', icon: <ListAltIcon />, path: '/admin/reports' },
    { text: 'Admin Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const sellerMenuItems = [
    { text: 'Dashboard', icon: <InboxIcon />, path: '/seller/dashboard' },
    { text: 'My Products', icon: <ShoppingCartIcon />, path: '/seller/products' },
    { text: 'Orders', icon: <ListAltIcon />, path: '/seller/orders' },
    { text: 'Seller Profile', icon: <AccountCircleIcon />, path: '/seller/profile' },
    { text: 'Seller Settings', icon: <SettingsIcon />, path: '/seller/settings' },
];

function ResponsiveDrawer(props) {
    const pathname = usePathname(); // Get the current path
    const { children } = props; // Destructure children from props
    const { window } = props;
    // TODO: Replace this with your actual role detection logic
    // This could come from context, props, or a global state manager
    const userRole = 'seller'; // Example roles: 'admin', 'seller', 'user'

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    let menuItemsToDisplay = userMenuItems; // Default to user
    if (userRole === 'admin') {
        menuItemsToDisplay = adminMenuItems;
    } else if (userRole === 'seller') {
        menuItemsToDisplay = sellerMenuItems;
    }

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List >
                {menuItemsToDisplay.map((item) => (
                    <ListItem key={item.text} disablePadding >
                        <Link href={item.path} passHref className='w-full'>
                            <ListItemButton
                                sx={{
                                    // Apply background if the current path matches the item's path
                                    bgcolor: pathname === item.path ? 'action.selected' : 'transparent',
                                    '&:hover': {
                                        bgcolor: pathname === item.path ? 'action.selected' : 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    // Remove this const when copying and pasting into your project.
    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    slotProps={{
                        root: {
                            keepMounted: true, // Better open performance on mobile.
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

ResponsiveDrawer.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * Remove this when copying and pasting into your project.
     */
    window: PropTypes.func,
    children: PropTypes.node,
    // You might want to add userRole as a prop if it's passed down
    // userRole: PropTypes.oneOf(['admin', 'seller', 'user']),
};

export default ResponsiveDrawer;
