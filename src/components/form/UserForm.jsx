import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Grid2 
} from '@mui/material';

const UserForm = ({ user, setUser }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  return (
    <Box component="form" noValidate autoComplete="off">
      <Typography variant="h6" gutterBottom>
        User Details
      </Typography>
      <Grid2 container spacing={2}>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            value={user.firstName || ''}
            onChange={handleInputChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            name="lastName"
            label="Last Name"
            value={user.lastName || ''}
            onChange={handleInputChange}
          />
        </Grid2>
        <Grid2 item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={user.email || ''}
            onChange={handleInputChange}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default UserForm;