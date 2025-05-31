"use client"
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import { ShoppingBag } from '@mui/icons-material';
import { Button, List, ListItemButton, ListItemText, SwipeableDrawer, Paper } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // For navigation
import axios from 'axios'; // For API calls


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

// Debounce helper function
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};


export default function Header() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [cartItems, setCartItems] = React.useState(0);
    const auth = useAuth(); // Use the Auth context
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const router = useRouter();

    const [allProducts, setAllProducts] = React.useState([]);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    // Define encodeCategory function
    const encodeCategory = (categoryName) => encodeURIComponent(categoryName);

    const categories = [
        { name: 'Home', href: '/' },
        { name: 'Air Conditioner', href: `/products/category/${encodeCategory('Air Conditioner')}` },
        { name: 'Refrigerator', href: `/products/category/${encodeCategory('Refrigerator')}`, },
        { name: 'Washing Machine', href: `/products/category/${encodeCategory('Washing Machine')}` },
        { name: 'Television', href: `/products/category/${encodeCategory('Television')}` },
        { name: 'Electronics & Appliances', href: `/products/category/${encodeCategory('Electronics & Appliance')}` },
        { name: 'Smartphones', href: `/products/category/${encodeCategory('Smartphone')}` },
        { name: 'Mobile Accessories', href: `/products/category/${encodeCategory('Mobile Accessories')}` },
        { name: 'Computers', href: `/products/category/${encodeCategory('Computer')}` },
        { name: 'Computer Accessories', href: `/products/category/${encodeCategory('Computer Accessories')}` }, // Could use Mouse, Keyboard etc.


    ];

    // State for search functionality
    const [searchTerm, setSearchTerm] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestionsPanel, setShowSuggestionsPanel] = React.useState(false);
    const searchRef = React.useRef(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        auth.logout();
        handleMenuClose();
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) { return; }
        setDrawerOpen(open);
    };

    // Fetch all products on component mount
    React.useEffect(() => {
        const fetchAllProducts = async () => {
            setIsInitialLoading(true);
            try {
                // Assuming '/api/products' fetches all (or a relevant subset of) products
                const response = await axios.get('/api/products');
                if (response.data && Array.isArray(response.data)) {
                    setAllProducts(response.data);
                } else {
                    console.error("Failed to fetch all products: Invalid data format", response.data);
                    setAllProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch all products:", error);
                setAllProducts([]); // Set to empty array on error
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    const handleSearchInputChange = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);

        if (newSearchTerm.trim() === "" || isInitialLoading) {
            setSuggestions([]);
            setShowSuggestionsPanel(false);
            return;
        }

        const filteredSuggestions = allProducts.filter(product =>
            (product.model && product.model.toLowerCase().includes(newSearchTerm.toLowerCase())) ||
            (product.brand && product.brand.toLowerCase().includes(newSearchTerm.toLowerCase()))
        ).slice(0, 10); // Show top 10 suggestions

        setSuggestions(filteredSuggestions);
        setShowSuggestionsPanel(true);
    };

    const handleSuggestionItemClick = (productId) => {
        router.push(`/products/${productId}`);
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestionsPanel(false);
    };

    // Effect to handle clicks outside the search suggestions panel
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestionsPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        auth && auth.isAuthenticated ? (<Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem
                onClick={handleMenuClose}
                component={Link}
                href={
                    auth.user?.role === 'admin' ? '/admin/dashboard' :
                        auth.user?.role === 'seller' ? '/seller/dashboard' :
                            auth.user?.role === 'user' ? '/dashboard' : '/' // Fallback to home
                }>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <p>{auth.user?.name || 'Profile'}</p>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
                <IconButton size="large" aria-label="logout" color="inherit">
                    <LogoutIcon />
                </IconButton>
                <p>Logout</p>
            </MenuItem>
        </Menu >) : (
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                id={menuId}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose} component={Link} href="/login">
                    <IconButton
                        size="large"
                        aria-label="login"
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <p>Login</p>
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} href="/register">
                    <IconButton
                        size="large"
                        aria-label="register"
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <p>Register</p>
                </MenuItem>
            </Menu>
        )
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                    <Badge badgeContent={4} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                >
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            {auth && auth.isAuthenticated
                ? [
                    <MenuItem key="profile" onClick={() => { handleMobileMenuClose(); window.location.href = (auth.user?.role === 'admin' ? '/admin/dashboard' : auth.user?.role === 'seller' ? '/seller/dashboard' : '/dashboard'); }}>
                        <IconButton size="large" aria-label="account of current user" color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <p>Profile</p>
                    </MenuItem>,
                    <MenuItem key="logout" onClick={handleLogout}>
                        <IconButton size="large" aria-label="logout" color="inherit">
                            <LogoutIcon />
                        </IconButton>
                        <p>Logout</p>
                    </MenuItem>
                ]
                : (
                    <MenuItem onClick={() => { handleMobileMenuClose(); window.location.href = '/login'; }}>
                        <IconButton size="large" aria-label="login" color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <p>Login</p>
                    </MenuItem>
                )}
        </Menu>
    );

    // Handle case where auth context might still be loading or not available
    if (auth && auth.loading) {
        return <Box sx={{ flexGrow: 1, maxWidth: '100%' }} className='mx-auto' ><AppBar position="static"><Toolbar><Typography>Loading...</Typography></Toolbar></AppBar></Box>; // Or a more sophisticated loader
    }
    return (
        <Box sx={{ flexGrow: 1, maxWidth: '100%' }} className='mx-auto' >
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h4"
                        className='font-bold text-white cursor-pointer'
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                        onClick={() => { window.location.href = '/'; }} // Use Next.js router for client-side navigation
                    >
                        GloBus
                    </Typography>
                    <Search ref={searchRef}>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            onFocus={() => {
                                if (searchTerm.trim() && suggestions.length > 0 && !isInitialLoading) {
                                    setShowSuggestionsPanel(true);
                                }
                            }}
                            className='w-fit rounded-2xl'
                        />
                        {showSuggestionsPanel && (
                            <Paper
                                elevation={4}
                                sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: (theme) => theme.zIndex.modal + 1, // Ensure it's above other elements
                                    mt: 0.5,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <List dense component="nav" aria-label="product suggestions">
                                    {isInitialLoading && searchTerm.trim() !== '' && (
                                        <ListItemButton disabled><ListItemText primary="Loading products..." /></ListItemButton>
                                    )}
                                    {!isInitialLoading && suggestions.length === 0 && searchTerm.trim() !== '' && (
                                        <ListItemButton disabled><ListItemText primary={`No results for "${searchTerm}"`} /></ListItemButton>
                                    )}
                                    {!isInitialLoading && suggestions.map((product) => (
                                        <ListItemButton
                                            key={product._id} // Assuming products have a unique _id
                                            onClick={() => handleSuggestionItemClick(product._id)}
                                        >
                                            <ListItemText primary={product.model} secondary={product.brand} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Search>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                            <Badge badgeContent={cartItems} color="error">
                                <ShoppingBag />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        {auth && auth.isAuthenticated ? (
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                        ) : (
                            // Show Login button if not authenticated and auth is not loading
                            !auth?.loading && (
                                <Button color="inherit" component={Link} href="/login">
                                    Login
                                </Button>
                            )
                        )}
                    </Box>
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
            <SwipeableDrawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                <Box
                    sx={{ width: 250, bgcolor: '#000', p: 1 }} // Set a fixed width for the drawer
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    {/* The sx={{ width: { xs: '100%', md: '20%' } }} was moved to the parent Box with fixed width */}
                    {/* bgcolor and p are also applied to the parent Box */}
                    <List dense>
                        {categories.map((item, index) => (
                            <Link href={item.href} key={index} >
                                <div className='flex items-center justify-between w-full'>
                                    <ListItemText primary={item.name} className='text-white' />
                                    <RightArrowIcon className='hover:rotate-45 text-white' />
                                </div>
                            </Link>
                        ))}
                    </List>
                </Box>
            </SwipeableDrawer>
        </Box>
    );
}
