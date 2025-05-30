"use client"
import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Grid, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import ACImage from '../Assets/AC.png';
import Link from 'next/link';

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

const BannerSection = () => {
    return (
        <Box display="flex" sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Sidebar */}
            <Box sx={{ width: { xs: '100%', md: '20%', }, bgcolor: '#000', p: 1, display: { xs: 'none', md: 'block' } }}>
                <List> {/* Added dense for smaller screens, optional */}
                    {categories.map((item, index) => (
                        <Link href={`/${item.Link}`} key={index}>
                            <div className='flex items-center justify-between w-full'>
                                <ListItemText primary={item.Name} className='text-white' />
                                <RightArrowIcon className='hover:rotate-45 text-white' />
                            </div>
                        </Link>
                    ))}
                </List>
            </Box>

            {/* Main Banner */}
            <Box
                sx={{
                    width: { xs: '100%', md: '80%' }, p: {
                        xs: 2, md: 4, background: 'linear-gradient(to right, #270082, #2687c4)',
                        color: 'white',
                        position: 'relative',
                    }
                }}
                // bgcolor="linear-gradient(to right, #3f51b5, #2196f3)" // This is overridden by sx below
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexDirection={{ xs: 'column-reverse', sm: 'row' }} // Stack image on top on very small screens
            // sx={{

            // }}
            >
                <Box className="ml-4">
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
                    >
                        THIS SUMMER
                    </Typography>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        mb={2}
                        sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
                    >
                        STAY COOL!
                    </Typography>
                    <div className='flex items-center gap-4'>
                        <Typography
                            variant="h2"
                            color="white"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.75rem' } }}
                        >
                            UP TO
                        </Typography>
                        <Typography
                            variant="h2"
                            color="yellow"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.75rem' } }}
                        >
                            40% OFF
                        </Typography>
                    </div>
                    <Box
                        display="flex"
                        gap={3}
                        mt={2}
                        sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <VerifiedUserIcon />
                            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>Official Warranty</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocalShippingIcon />
                            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>Fast Delivery</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box
                    component="img"
                    src="https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVx2ViGgDbtXyw20LMFg5vTe9IhqOJf8RzpEcn"
                    alt="AC"
                    // className='mr-32' // Replaced with sx for better control
                    sx={{
                        mr: { md: 16 }, // mr-32 is 8rem, which is 128px. MUI spacing unit is 8px, so 16*8 = 128px
                        width: { xs: '60%', sm: '40%', md: 'auto' }, // Adjust image size
                        maxHeight: { xs: 200, sm: 250, md: 300 }, // Control max height
                        objectFit: 'contain',
                        mt: { xs: 2, sm: 0 } // Add margin top on small screens when image is stacked
                    }}
                />
            </Box>
        </Box>
    );
};

export default BannerSection;
