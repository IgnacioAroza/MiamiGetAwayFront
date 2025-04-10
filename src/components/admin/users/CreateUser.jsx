import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createUser } from '../../../redux/userSlice';
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

const CreateUser = ({ isDialog = false, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const result = await dispatch(createUser(formData)).unwrap();
            console.log(result);
            setSuccess(true);
            if (isDialog && onSuccess) {
                onSuccess(result);
            } else {
                navigate('/admin/users');
            }
        } catch (err) {
            setError(err.message || 'Error al crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    const formContent = (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        helperText={!formData.name ? "The name is required" : ""}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Last Name"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                        helperText={!formData.lastname ? "The last name is required" : ""}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        helperText={!formData.email ? "The email is required" : ""}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
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
                        value={formData.notes}
                        onChange={handleChange}
                        multiline
                        rows={3}
                    />
                </Grid>
            </Grid>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                * Required fields
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {isDialog ? (
                    <>
                        <Button 
                            onClick={onCancel} 
                            color="secondary"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading || !formData.name || !formData.lastname || !formData.email}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button 
                            onClick={() => navigate('/admin/users')} 
                            color="secondary"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading || !formData.name || !formData.lastname || !formData.email}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create User'}
                        </Button>
                    </>
                )}
            </Box>
        </form>
    );

    if (isDialog) {
        return formContent;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create New User
                </Typography>
                <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: '#fff' }}>
                    {formContent}
                </Paper>
            </Box>
            <Snackbar 
                open={success} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success">
                    User created successfully
                </Alert>
            </Snackbar>
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CreateUser; 