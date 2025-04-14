import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Button, Alert, Snackbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { fetchReservationById } from '../../../redux/reservationSlice';
import ReservationForm from './ReservationForm';
import PaymentSummary from '../payments/PaymentSummary';
import reservationService from '../../../services/reservationService';

const ReservationManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedReservation, loading, error } = useSelector(state => state.reservations);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
    const [initialData, setInitialData] = useState(null);
    
    useEffect(() => {
        const loadReservationData = async () => {
            if (id) {
                try {
                    const reservation = await reservationService.getById(id);
                    
                    if (reservation) {
                        setInitialData({
                            checkInDate: reservation.checkInDate || '',
                            checkOutDate: reservation.checkOutDate || '',
                            nights: reservation.nights || 1,
                            price: reservation.pricePerNight || 0,
                            pricePerNight: reservation.pricePerNight || 0,
                            cleaningFee: reservation.cleaningFee || 0,
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
                    console.error('Error al cargar los datos de la reserva:', error);
                    setNotification({
                        open: true,
                        message: 'Error loading reservation data',
                        type: 'error'
                    });
                }
            }
        };

        loadReservationData();
    }, [id]);
    
    const handleFormSubmit = async (formData) => {
        try {
            console.log('Enviando datos del formulario:', formData);
            const response = await reservationService.update(id, formData);
            setNotification({
                open: true,
                message: id ? 'Reservation updated successfully' : 'Reservation created successfully',
                type: 'success'
            });
            navigate('/admin/reservations');
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
        navigate('/admin/reservations');
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
                
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <ReservationForm
                                    initialData={initialData}
                                    onSubmit={handleFormSubmit}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {selectedReservation && (
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <PaymentSummary
                                        reservation={selectedReservation}
                                        onPaymentRegistered={() => dispatch(fetchReservationById(id))}
                                    />
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
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
