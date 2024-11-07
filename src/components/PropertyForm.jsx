import React from 'react';
import { TextField, Grid2 } from '@mui/material';

const PropertyForm = ({ property, setProperty }) => {
  return (
    <Grid2 container spacing={2} sx={{ mt: 2 }}>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Name"
          value={property.name || ''}
          onChange={(e) => setProperty({...property, name: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={property.description || ''}
          onChange={(e) => setProperty({...property, description: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={property.address || ''}
          onChange={(e) => setProperty({...property, address: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Capacity"
          type="number"
          value={property.capacity || ''}
          onChange={(e) => setProperty({...property, capacity: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={property.price || ''}
          onChange={(e) => setProperty({...property, price: e.target.value})}
        />
      </Grid2>
    </Grid2>
  );
};

export default PropertyForm;