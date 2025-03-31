import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';

const ServiceButtons = ({ onServiceSelect }) => {
  const services = [
    { id: 'apartments', label: 'Apartments' },
    { id: 'cars', label: 'Cars' },
    { id: 'yachts', label: 'Yachts' },
    { id: 'villas', label: 'Villas' }
  ];

  const buttonStyle = {
    color: '#fff',
    borderColor: 'rgba(255, 255, 255, 0.23)',
    '&:hover': {
      borderColor: '#fff',
      bgcolor: 'rgba(255, 255, 255, 0.04)'
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        Services
      </Typography>
      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} md={3} key={service.id}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onServiceSelect(service.id)}
              sx={buttonStyle}
            >
              {service.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServiceButtons; 