"use client"
import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Grid, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import ACImage from '../Assets/AC.png';

const categories = [
    'Air Conditioner ',
    'Television',
    'Electronics & Appliances',
    'Smartphones',
    'Mobile Accessories',
    'Computers',
    'Computer Accessories',
    'Lifestyle',
];

const BannerSection = () => {
    return (
        <Box display="flex" >
            {/* Sidebar */}
            <Box width="20%" bgcolor="#000" p={1}>
                <List>
                    {categories.map((item, index) => (
                        <ListItemButton key={index}>
                            <div className='flex items-center justify-between w-full'>
                                <ListItemText primary={item} className='text-white' />
                                <RightArrowIcon className='hover:rotate-45 text-white' />
                            </div>
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            {/* Main Banner */}
            <Box
                width="80%"
                p={4}
                bgcolor="linear-gradient(to right, #3f51b5, #2196f3)"
                display="flex"
                justifyContent="space-between"
                alignItems="center"

                sx={{
                    background: 'linear-gradient(to right, #270082, #2687c4)',
                    color: 'white',
                    position: 'relative',
                }}
            >
                <Box className="ml-4">
                    <Typography variant="h3" fontWeight="bold">THIS SUMMER</Typography>
                    <Typography variant="h3" fontWeight="bold" mb={2}>STAY COOL!</Typography>
                    <div className='flex items-center gap-4'>
                        <Typography variant="h2" color="white" fontWeight="bold">UP TO </Typography>
                        <Typography variant="h2" color="yellow" fontWeight="bold">40% OFF</Typography>
                    </div>
                    <Box display="flex" gap={3} mt={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <VerifiedUserIcon />
                            <Typography>Official Warranty</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocalShippingIcon />
                            <Typography>Fast Delivery</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box component="img" src="https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVx2ViGgDbtXyw20LMFg5vTe9IhqOJf8RzpEcn" alt="AC" className='mr-32' />
            </Box>
        </Box>
    );
};

export default BannerSection;
