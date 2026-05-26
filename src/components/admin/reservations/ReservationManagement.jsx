import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Button, Alert, Snackbar, Skeleton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ReservationForm from './ReservationForm';
import reservationService from '../../../services/reservationService';
import { fetchAdminApartments } from '../../../redux/adminApartmentSlice';

const ReservationManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const apartmentsStatus = useSelector(state => state.adminApartments.status);
    const [reservationLoading, setReservationLoading] = useState(!!id);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        // Disparar carga de apartamentos lo antes posible, antes de que el form monte
        if (apartmentsStatus === 'idle' || apartmentsStatus === 'failed') {
            dispatch(fetchAdminApartments());
        }

        const loadReservationData = async () => {
            if (id) {
                setReservationLoading(true);
                try {
                    const reservation = await reservationService.getById(id);

                    if (reservation) {
                        setInitialData({
                            id: reservation.id || id,
                            checkInDate: reservation.checkInDate || '',
                            checkOutDate: reservation.checkOutDate || '',
                            nights: reservation.nights || 1,
                            price: reservation.pricePerNight || 0,
                            pricePerNight: reservation.pricePerNight || 0,
                            cleaningFee: reservation.cleaningFee || 0,
                            cancellationFee: reservation.cancellationFee || 0,
                            parkingFee: reservation.parkingFee || 0,
                            otherExpenses: reservation.otherExpenses || 0,
                            amountPaid: reservation.amountPaid || 0,
                            originalAmountPaid: reservation.amountPaid || 0,
                            taxes: reservation.taxes || 0,
                            totalAmount: reservation.totalAmount || 0,
                            amountDue: reservation.amountDue || 0,
                            paymentStatus: reservation.paymentStatus || 'pending',
                            clientName: reservation.clientName || '',
                            clientEmail: reservation.clientEmail || '',
                            clientPhone: reservation.clientPhone || '',
                            apartmentId: reservation.apartmentId || '',
                            status: reservation.status || 'pending',
                            clientLastname: reservation.clientLastname || '',
                            clientAddress: reservation.clientAddress || '',
                            clientCity: reservation.clientCity || '',
                            clientCountry: reservation.clientCountry || '',
                            clientNotes: reservation.clientNotes || '',
                            notes: reservation.notes || '',
                            apartmentName: reservation.apartmentName || '',
                            apartmentAddress: reservation.apartmentAddress || ''
                        });
                    }
                } catch (error) {
                    setNotification({
                        open: true,
                        message: 'Error loading reservation data',
                        type: 'error'
                    });
                } finally {
                    setReservationLoading(false);
                }
            }
        };

        loadReservationData();
    }, [id]);
    
    const handleFormSubmit = async (formData) => {
        try {
            let response;
            
            if (id) {
                // Si hay ID, actualizar reserva existente
                response = await reservationService.update(id, formData);
            } else {
                // Si no hay ID, crear nueva reserva
                response = await reservationService.create(formData);
            }

            setNotification({
                open: true,
                message: id ? 'Reservation updated successfully' : 'Reservation created successfully',
                type: 'success'
            });

            if (id) {
                navigate(`/admin/reservations/view/${id}`);
            } else {
                // Redirigir al form de edición para que el usuario pueda asignar supplier y ver todos los paneles
                const newId = response?.id || response?.reservationId;
                navigate(`/admin/reservations/edit/${newId}`);
            }
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            setNotification({
                open: true,
                message: `Error: ${error.message || 'Failed to save reservation'}`,
                type: 'error'
            });
        }
    };
    
    const handleBack = () => {
        if (id) {
            // Si estamos editando una reserva existente, volver a la vista de detalles
            navigate(`/admin/reservations/view/${id}`);
        } else {
            // Si estamos creando una nueva reserva, volver a la lista
            navigate('/admin/reservations');
        }
    };
    
    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };
    
    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBack}
                        variant="outlined"
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1">
                        {id ? 'Edit Reservation' : 'New Reservation'}
                    </Typography>
                </Box>
                
                {reservationLoading ? (
                    <Box>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 2 }} />
                            <Skeleton variant="text" width={240} height={40} />
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                                    {[...Array(8)].map((_, idx) => (
                                        <Skeleton key={idx} variant="text" width={`${80 - idx * 5}%`} />
                                    ))}
                                    <Skeleton variant="rectangular" height={48} sx={{ mt: 2 }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Skeleton variant="text" width={160} height={28} />
                                    {[...Array(6)].map((_, idx) => (
                                        <Skeleton key={idx} variant="text" width={`${70 - idx * 5}%`} />
                                    ))}
                                    <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <ReservationForm
                        initialData={initialData}
                        onSubmit={handleFormSubmit}
                    />
                )}
                
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                >
                    <Alert 
                        onClose={handleCloseNotification} 
                        severity={notification.type}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default ReservationManagement;
