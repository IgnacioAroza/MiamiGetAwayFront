import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, selectSelectedUser } from '../../../redux/userSlice';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

const EditUser = ({ isDialog = false, onSuccess, onCancel, initialData }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const selectedUser = useSelector(selectSelectedUser);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDialog && initialData) {
      setFormData({
        name: initialData.firstName || initialData.name || '',
        lastname: initialData.lastName || initialData.lastname || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        country: initialData.country || '',
        notes: initialData.notes || ''
      });
      setLoading(false);
    } else if (!isDialog) {
      const loadUser = async () => {
        try {
          await dispatch(fetchUserById(id)).unwrap();
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos del usuario');
          setLoading(false);
        }
      };

      loadUser();
    }
  }, [dispatch, id, isDialog, initialData]);

  useEffect(() => {
    if (!isDialog && selectedUser) {
      setFormData({
        name: selectedUser.name || '',
        lastname: selectedUser.lastname || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        address: selectedUser.address || '',
        city: selectedUser.city || '',
        country: selectedUser.country || '',
        notes: selectedUser.notes || ''
      });
    }
  }, [selectedUser, isDialog]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        notes: formData.notes
      };
      
      const updatedUser = await dispatch(updateUser({ 
        id: isDialog ? initialData.id : id, 
        data: userData 
      })).unwrap();
      
      setSuccess(true);
      
      if (isDialog && onSuccess) {
        onSuccess({
          ...updatedUser,
          firstName: updatedUser.name,
          lastName: updatedUser.lastname
        });
      } else {
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar el usuario');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={isDialog ? onCancel : () => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Update User
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  if (isDialog) {
    return renderForm();
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit User
        </Typography>
        {renderForm()}
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            User updated successfully
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default EditUser; 