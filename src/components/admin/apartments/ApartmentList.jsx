import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Skeleton,
    Card,
    CardContent,
    CardActions,
    Grid,
    Divider,
    Chip,
    useTheme,
    Stack
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { 
    fetchAdminApartments,
    deleteAdminApartment,
    setSelectedApartment,
    selectAllApartments,
    selectApartmentStatus,
    selectApartmentError
} from '../../../redux/adminApartmentSlice';
import ApartmentForm from './ApartmentForm';
import DeleteConfirmDialog from '../../common/DeleteConfirmDialog';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ApartmentList = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceDetection();
    const apartments = useSelector(selectAllApartments);
    const status = useSelector(selectApartmentStatus);
    const error = useSelector(selectApartmentError);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [apartmentToDelete, setApartmentToDelete] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAdminApartments());
        }
    }, [status, dispatch]);

    const handleEdit = (item) => {
        dispatch(setSelectedApartment(item));
        setDialogOpen(true);
    };

    const handleDelete = async (item) => {
        setApartmentToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteAdminApartment(apartmentToDelete.id)).unwrap();
            setDeleteDialogOpen(false);
            setApartmentToDelete(null);
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    };

    const handleCreate = () => {
        dispatch(setSelectedApartment(null));
        setDialogOpen(true);
    };

    // Función para renderizar tarjetas en vista móvil
    const renderMobileCards = () => {
        if (apartments.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">No apartments available</Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {apartments.map((apartment) => (
                    <Grid item xs={12} key={apartment.id}>
                        <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" component="div">
                                        <HomeIcon sx={{ mr: 1, verticalAlign: 'top' }} />
                                        {apartment.name}
                                    </Typography>
                                    {apartment.unitNumber && (
                                        <Chip 
                                            label={`Unit: ${apartment.unitNumber}`} 
                                            size="small" 
                                            color="primary"
                                        />
                                    )}
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {apartment.address || 'No address specified'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BedIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {apartment.rooms} rooms
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BathtubIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {apartment.bathrooms} bathrooms
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                ${apartment.price}/night
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PhotoLibraryIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {apartment.images?.length || 0} images
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            {apartment.description || 'No description available'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEdit(apartment)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(apartment)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    if (status === 'loading') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="rectangular" width={160} height={36} />
                </Box>
                {isMobile || isTablet ? (
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, idx) => (
                            <Grid item xs={12} key={idx}>
                                <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Skeleton variant="text" width={220} height={28} />
                                            <Skeleton variant="rounded" width={90} height={24} />
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Skeleton variant="text" width="70%" />
                                        <Skeleton variant="text" width="50%" />
                                        <Skeleton variant="text" width="40%" />
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Name','Unit Number','Distribution','Description','Address','Capacity','Price per night','Images','Actions'].map(h => (
                                        <TableCell key={h}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(5)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell><Skeleton variant="text" width={160} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={180} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={220} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={200} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={60} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                        <TableCell>
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Apartments
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    New Apartment
                </Button>
            </Box>
            
            {isMobile || isTablet ? (
                renderMobileCards()
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Unit Number</TableCell>
                                <TableCell>Distribution</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Price per night</TableCell>
                                <TableCell>Images</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {apartments.map((apartment) => (
                                <TableRow key={apartment.id}>
                                    <TableCell>{apartment.name}</TableCell>
                                    <TableCell>{apartment.unitNumber}</TableCell>
                                    <TableCell>
                                        {apartment.bathrooms} bathrooms, {apartment.rooms} rooms
                                    </TableCell>
                                    <TableCell>{apartment.description}</TableCell>
                                    <TableCell>{apartment.address}</TableCell>
                                    <TableCell>{apartment.capacity}</TableCell>
                                    <TableCell>${apartment.price}</TableCell>
                                    <TableCell>{apartment.images?.length || 0} images</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(apartment)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(apartment)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {apartments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No apartments available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <ApartmentForm
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setApartmentToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Apartment"
                content="Are you sure you want to delete this apartment? This action cannot be undone."
            />
        </Box>
    );
};

export default ApartmentList;
