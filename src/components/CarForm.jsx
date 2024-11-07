import React from 'react';
import { TextField, Grid2 } from '@mui/material';

const CarForm = ({ car, setCar }) => {
  if (!car) {
    return null;
  }

  return (
    <Grid2 container spacing={2} sx={{ mt: 2 }}>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Brand"
          value={car.brand || ''}
          onChange={(e) => setCar({...car, brand: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Model"
          value={car.model || ''}
          onChange={(e) => setCar({...car, model: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={car.description || ''}
          onChange={(e) => setCar({...car, description: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={car.price || ''}
          onChange={(e) => setCar({...car, price: e.target.value})}
        />
      </Grid2>
    </Grid2>
  );
};

export default CarForm;