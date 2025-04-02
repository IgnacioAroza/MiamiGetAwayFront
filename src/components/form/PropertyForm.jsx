import React from 'react';
import { TextField, Grid } from '@mui/material';

const PropertyForm = ({ property, setProperty, type }) => {
  if (!property) {
    return null;
  }

  // Determinar si es un apartamento
  const isApartment = type === 'apartments';

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Name"
          value={property?.name || ''}
          onChange={(e) => setProperty({...property, name: e.target.value})}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={property?.description || ''}
          onChange={(e) => setProperty({...property, description: e.target.value})}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={property?.address || ''}
          onChange={(e) => setProperty({...property, address: e.target.value})}
        />
      </Grid>
      {isApartment && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Unit Number"
            value={property?.unitNumber || ''}
            onChange={(e) => setProperty({...property, unitNumber: e.target.value})}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Capacity"
          type="number"
          value={property?.capacity || ''}
          onChange={(e) => setProperty({...property, capacity: e.target.value})}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Bathrooms"
          type="number"
          value={property?.bathrooms || ''}
          onChange={(e) => setProperty({...property, bathrooms: e.target.value})}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Rooms"
          type="number"
          value={property?.rooms || ''}
          onChange={(e) => setProperty({...property, rooms: e.target.value})}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={property?.price || ''}
          onChange={(e) => setProperty({...property, price: e.target.value})}
        />
      </Grid>
    </Grid>
  );
};

export default PropertyForm;