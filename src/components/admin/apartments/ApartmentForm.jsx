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
    Typography,
    Divider,
    Alert
} from '@mui/material';
import { createAdminApartment, updateAdminApartment, selectSelectedApartment } from '../../../redux/adminApartmentSlice';
import ImageUploader from '../../images/ImageUploader';
import useImageFiles from '../../../hooks/useImageFiles';
import useSubmitLock from '../../../hooks/useSubmitLock';
import { useTranslation } from 'react-i18next';

const ApartmentForm = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { submitting, run } = useSubmitLock('apartment');
    const selectedApartment = useSelector(selectSelectedApartment);
    const [formData, setFormData] = React.useState({
        name: '',
        unitNumber: '',
        bathrooms: '',
        rooms: '',
        description: '',
        address: '',
        capacity: 0,
        price: 0
    });
    const [existingImages, setExistingImages] = React.useState([]);
    const [uploadError, setUploadError] = React.useState('');
    const imageQueue = useImageFiles({ limit: 30 });
    const { resetFiles } = imageQueue;
    const newImages = imageQueue.files;

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
                price: Number(selectedApartment.price) || 0
            });
            setExistingImages(selectedApartment.images || []);
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
                price: 0
            });
            setExistingImages([]);
        }
        resetFiles();
        setUploadError('');
    }, [selectedApartment, resetFiles]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? Number(value) : value
        }));
    };

    const handleImageUpload = (e) => {
        imageQueue.addFiles(e.target.files, existingImages.length);
    };

    const handleRemoveImage = (index, isNewImage) => {
        if (isNewImage) {
            imageQueue.removeFile(index - existingImages.length);
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleReorderImages = (reorderedImages, reorderedNewImages) => {
        setExistingImages(reorderedImages);
        imageQueue.setFiles(reorderedNewImages);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageQueue.canSubmit()) return;
        return run(async () => {
        setUploadError('');
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            formDataToSend.append('existingImages', JSON.stringify(existingImages));
            newImages.forEach(image => {
                formDataToSend.append('images', image);
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
            setUploadError(typeof error === 'string' ? error : error?.message || '');
        }
        });
    };

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {selectedApartment ? 'Edit Apartment' : 'New Apartment'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
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
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Images</Typography>
                            <ImageUploader
                                images={existingImages}
                                newImages={newImages}
                                onImageUpload={handleImageUpload}
                                onRemoveImage={handleRemoveImage}
                                onReorder={handleReorderImages}
                                processing={imageQueue.processing}
                                done={imageQueue.done}
                                total={imageQueue.total}
                                issues={imageQueue.issues}
                                clearIssues={imageQueue.clearIssues}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting || imageQueue.processing || imageQueue.issues.length > 0}>
                        {submitting ? t('imageUpload.saving') : selectedApartment ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ApartmentForm; 
