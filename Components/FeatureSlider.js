"use client"
import React from 'react';
import { Box, Typography, IconButton, Grid, Divider, useTheme, Icon } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';


const topFeatures = [
    { icon: <VolunteerActivismIcon />, details: 'Up to 36 Months EMI' },
    { icon: <AssignmentReturnIcon />, details: 'Easy Returns' },
    { icon: <LocalShippingIcon />, details: 'Evening Express' },
    { icon: <EmojiEventsIcon />, details: 'Best Price Guaranteed' },
    { icon: <WorkspacePremiumIcon />, details: '100% Genuine Products' },




]

const bottomItems = [
    { icon: "https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVJdIGpgN2jTo8Wlx7Uns0tvCqGMyAe15PiRDc", label: '3 Hours Delivery' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVkyClJCjVNwQARdDgH0xG6Cvljmb7XV2KzM83', label: '0% EMI Facility' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVFTfhXCAwOUtjcFLH6IT8VCkZhm5wqbQv2zsP', label: 'Above 50% Discount' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVQtNbzJaLlwki8uZOTyhLdMoKseW63FNxEmV9', label: 'Get trimmer at ৳499!' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVfHRgpzfkBLuyNkpq1g5JsPoU6C0cKfHMn4jX', label: 'Best Price Guaranteed' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVVkPtCmHDS3tLFE5BYmJwnUqyP0MCHhsIxOdG', label: 'Best Deals on 1.5 ton AC' },
    { icon: 'https://nx91e1z55v.ufs.sh/f/wMVhzGWYItJVkyQCt3DVNwQARdDgH0xG6Cvljmb7XV2KzM83', label: 'Under TK. 999' },
];

const FeatureSlider = () => {


    return (
        <Box sx={{ bgcolor: '#fff', p: 2, boxShadow: 1 }}>
            {/* Top Row */}
            <Grid container spacing={2} justifyContent="space-around" alignItems="center">
                {topFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center justify-center gap-2">
                        <Icon className='text-blue-500 text-6xl'>
                            {feature.icon}
                        </Icon>
                        <Typography variant="body2" fontWeight={500}>{feature.details}</Typography>
                    </div>
                ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Bottom Slider */}
            <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => scroll('left')}>
                    <ArrowBackIosNewIcon />
                </IconButton>

                <Box
                    sx={{
                        overflowX: 'auto',
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'nowrap',
                        '::-webkit-scrollbar': { display: 'none' },
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: "space-between"
                    }}
                >
                    {bottomItems.map((item, i) => (
                        <Box
                            key={i}
                            minWidth={100}
                            textAlign="center"
                            sx={{
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                p: 1,
                                boxShadow: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src={item.icon}
                                alt={item.label}
                                className='w-full h-24'
                                sx={{ objectFit: 'contain', mb: 1 }}
                            />
                            <Typography variant="caption">{item.label}</Typography>
                        </Box>
                    ))}
                </Box>

                <IconButton onClick={() => scroll('right')}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default FeatureSlider;
