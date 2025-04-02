import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Services = () => {
    const dispatch = useDispatch();
    const { services, loading, error } = useSelector(state => state.services);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: ''
    });

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    const handleOpenDialog = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price,
                image: service.image
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                image: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            image: ''
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingService) {
                await dispatch(updateService({ id: editingService.id, ...formData }));
            } else {
                await dispatch(createService(formData));
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error al guardar el servicio:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            try {
                await dispatch(deleteService(id));
            } catch (error) {
                console.error('Error al eliminar el servicio:', error);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Servicios
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Servicio
                </Button>
            </Box>

            <Grid container spacing={3}>
                {services.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={service.image || 'https://via.placeholder.com/300x200'}
                                alt={service.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {service.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {service.description}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    ${service.price}
                                </Typography>
                                <Box mt={2} display="flex" gap={1}>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleOpenDialog(service)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDelete(service.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            label="Precio"
                            fullWidth
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <TextField
                            label="URL de la imagen"
                            fullWidth
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingService ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Services;