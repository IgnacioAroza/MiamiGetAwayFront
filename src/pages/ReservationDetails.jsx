import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Divider,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { fetchReservationById } from '../redux/reservationSlice';
import PaymentHistory from '../components/admin/payments/PaymentHistory';
import PaymentSummary from '../components/admin/payments/PaymentSummary';

const ReservationDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedReservation: reservation, loading, error } = useSelector(state => state.reservations);

    useEffect(() => {
        if (id) {
            dispatch(fetchReservationById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!reservation) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 3 }}>
                    No se encontró la reserva
                </Alert>
            </Container>
        );
    }

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'warning',
            CONFIRMED: 'success',
            CANCELLED: 'error',
            COMPLETED: 'info',
            // Agrega más estados según necesites
        };
        return statusColors[status] || 'default';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {/* Encabezado */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Reserva #{reservation.id}
                    </Typography>
                    <Chip
                        label={reservation.status}
                        color={getStatusColor(reservation.status)}
                        size="large"
                    />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Información principal */}
                <Grid container spacing={3}>
                    {/* Detalles del Cliente */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Información del Cliente
                            </Typography>
                            <Typography>Nombre: {reservation.clientName}</Typography>
                            <Typography>Email: {reservation.clientEmail}</Typography>
                            <Typography>Teléfono: {reservation.clientPhone}</Typography>
                        </Paper>
                    </Grid>

                    {/* Detalles de la Reserva */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Detalles de la Reserva
                            </Typography>
                            <Typography>Check-in: {formatDate(reservation.checkIn)}</Typography>
                            <Typography>Check-out: {formatDate(reservation.checkOut)}</Typography>
                            <Typography>Noches: {reservation.nights}</Typography>
                        </Paper>
                    </Grid>

                    {/* Detalles del Apartamento */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Detalles del Apartamento
                            </Typography>
                            <Typography>ID: {reservation.apartmentId}</Typography>
                            <Typography>Precio por noche: ${reservation.pricePerNight}</Typography>
                        </Paper>
                    </Grid>

                    {/* Costos y Pagos */}
                    <Grid item xs={12} md={6}>
                        <PaymentSummary reservation={reservation} />
                    </Grid>

                    {/* Historial de Pagos */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Historial de Pagos
                            </Typography>
                            <PaymentHistory payments={reservation.payments || []} />
                        </Paper>
                    </Grid>

                    {/* Notas adicionales */}
                    {reservation.notes && (
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Notas
                                </Typography>
                                <Typography>{reservation.notes}</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
};

export default ReservationDetails;
