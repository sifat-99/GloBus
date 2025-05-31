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
import { Button, List, ListItemButton, ListItemText, SwipeableDrawer } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

const categories = [
    { Name: 'Air Conditioner ', Link: 'airConditioner' },
    { Name: 'Refrigerator', Link: 'refrigerator ' },
    { Name: 'Washing Machine', Link: 'washingMachine' },
    { Name: 'Television', Link: 'television' },
    { Name: 'Electronics & Appliances', Link: 'electronicsAndAppliances' },
    { Name: 'Smartphones', Link: 'smartphones' },
    { Name: 'Mobile Accessories', Link: 'mobileAccessories' },
    { Name: 'Computers', Link: 'computers' },
    { Name: 'Computer Accessories', Link: 'computerAccessories' },
    { Name: 'Lifestyle', Link: 'lifestyle' },
];

export default function Header() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [cartItems, setCartItems] = React.useState(0);
    const auth = useAuth(); // Use the Auth context
    const [drawerOpen, setDrawerOpen] = React.useState(false);

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
                    <MenuItem key="profile" onClick={() => { handleMobileMenuClose(); router.push(auth.user?.role === 'admin' ? '/admin/dashboard' : auth.user?.role === 'seller' ? '/seller/dashboard' : '/dashboard'); }}>
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
                    <MenuItem onClick={() => { handleMobileMenuClose(); router.push('/login'); }}>
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
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            className='w-fit rounded-2xl'
                        />
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
                            <Link href={item.Link} key={index} >
                                <div className='flex items-center justify-between w-full'>
                                    <ListItemText primary={item.Name} className='text-white' />
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
