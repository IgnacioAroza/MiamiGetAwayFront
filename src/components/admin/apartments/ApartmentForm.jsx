import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Input,
    Typography
} from '@mui/material';
import { createAdminApartment, updateAdminApartment, selectSelectedApartment } from '../../../redux/adminApartmentSlice';

const ApartmentForm = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const selectedApartment = useSelector(selectSelectedApartment);
    const [formData, setFormData] = React.useState({
        name: '',
        unitNumber: '',
        bathrooms: '',
        rooms: '',
        description: '',
        address: '',
        capacity: 0,
        price: 0,
        images: []
    });

    useEffect(() => {
        if (selectedApartment) {
            setFormData({
                name: selectedApartment.name || '',
                unitNumber: selectedApartment.unitNumber || '',
                bathrooms: selectedApartment.bathrooms || '',
                rooms: selectedApartment.rooms || '',
                description: selectedApartment.description || '',
                address: selectedApartment.address || '',
                capacity: Number(selectedApartment.capacity) || 0,
                price: Number(selectedApartment.price) || 0,
                images: selectedApartment.images || []
            });
        } else {
            // Resetear el formulario cuando se crea uno nuevo
            setFormData({
                name: '',
                unitNumber: '',
                bathrooms: '',
                rooms: '',
                description: '',
                address: '',
                capacity: 0,
                price: 0,
                images: []
            });
        }
    }, [selectedApartment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? Number(value) : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'images') {
                    formData.images.forEach(image => {
                        formDataToSend.append('images', image);
                    });
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (selectedApartment) {
                await dispatch(updateAdminApartment({
                    id: selectedApartment.id,
                    data: formDataToSend
                })).unwrap();
            } else {
                await dispatch(createAdminApartment(formDataToSend)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {selectedApartment ? 'Edit Apartment' : 'New Apartment'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="name"
                                label="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="unitNumber"
                                label="Unit Number"
                                value={formData.unitNumber}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="bathrooms"
                                label="Bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="rooms"
                                label="Rooms"
                                value={formData.rooms}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="description"
                                label="Description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="address"
                                label="Address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                name="capacity"
                                label="Capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                name="price"
                                label="Price per night"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Input
                                type="file"
                                inputProps={{
                                    multiple: true,
                                    accept: 'image/*'
                                }}
                                onChange={handleImageChange}
                            />
                            <Typography variant="caption" display="block">
                                {formData.images.length} images selected
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {selectedApartment ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ApartmentForm; 