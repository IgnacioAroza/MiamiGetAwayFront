import React from 'react';
import { TextField, Grid2 } from '@mui/material';

const YachtForm = ({ yacht, setYacht }) => {
  return (
    <Grid2 container spacing={2} sx={{ mt: 2 }}>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Name"
          value={yacht.name || ''}
          onChange={(e) => setYacht({...yacht, name: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={yacht.description || ''}
          onChange={(e) => setYacht({...yacht, description: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Capacity"
          type="number"
          value={yacht.capacity || ''}
          onChange={(e) => setYacht({...yacht, capacity: e.target.value})}
        />
      </Grid2>
      <Grid2 item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={yacht.price || ''}
          onChange={(e) => setYacht({...yacht, price: e.target.value})}
        />
      </Grid2>
    </Grid2>
  );
};

export default YachtForm;