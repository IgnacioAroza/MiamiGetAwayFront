import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import {
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  BookOnline as BookOnlineIcon,
  Payment as PaymentIcon,
  Reviews as ReviewsIcon,
} from '@mui/icons-material';

const DashboardCards = ({ stats, onCardClick }) => {
  const dashboardItems = [
    {
      title: 'Users',
      count: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/admin/users'
    },
    {
      title: 'Apartments',
      count: stats.totalApartments,
      icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/admin/apartments'
    },
    {
      title: 'Reservations',
      count: stats.totalReservations,
      icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/admin/reservations'
    },
    {
      title: 'Payments',
      count: stats.totalPayments,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/admin/payments'
    },
    {
      title: 'Reviews',
      count: stats.totalReviews,
      icon: <ReviewsIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/admin/reviews'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 2 }}>
      {dashboardItems.map((item) => (
        <Grid item xs={12} sm={6} md={2.4} key={item.title}>
          <Paper
            sx={{
              p: 2,
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              bgcolor: '#1e1e1e',
              '&:hover': {
                bgcolor: '#2a2a2a'
              }
            }}
            onClick={() => onCardClick(item.path)}
          >
            <Box sx={{ color: item.color, mb: 1 }}>
              {item.icon}
            </Box>
            <Typography variant="h6" component="div" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="h3" component="div">
              {item.count}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards; 