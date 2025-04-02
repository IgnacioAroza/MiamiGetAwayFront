import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import { fetchAdminApartmentById } from '../redux/adminApartmentSlice';
import PaymentHistory from '../components/admin/payments/PaymentHistory';
import ReservationSummary from '../components/admin/payments/ReservationSummary';

const ReservationDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { selectedReservation: reservation, loading, error } = useSelector(state => state.reservations);
    
    // Obtener todo el estado de adminApartments para inspección
    const adminApartmentState = useSelector(state => state.adminApartments);
    const { selectedApartment: apartment, loading: apartmentLoading, error: apartmentError } = adminApartmentState;

    useEffect(() => {
        console.log("ReservationDetails - Ruta:", location.pathname);
        console.log("ReservationDetails - ID de reserva:", id);
        
        if (id) {
            dispatch(fetchReservationById(id));
        }
    }, [dispatch, id, location]);

    // Efecto separado para cargar el apartamento cuando tengamos los datos de la reserva
    useEffect(() => {
        if (reservation) {
            // Buscar el ID del apartamento en diferentes formatos posibles
            const apartmentId = reservation.apartment_id
            
            console.log("ReservationDetails - Reservation Object:", reservation);
            console.log("ReservationDetails - Apartment ID detectado:", apartmentId);
            
            if (apartmentId) {
                console.log("Cargando datos del apartamento ID:", apartmentId);
                dispatch(fetchAdminApartmentById(apartmentId));
            } else {
                console.error("No se pudo detectar el ID del apartamento en la reserva:", reservation);
            }
        }
    }, [dispatch, reservation]);

    useEffect(() => {
        console.log("Estado completo de apartamentos:", adminApartmentState);
        console.log("ReservationDetails - Datos de reserva:", reservation);
        console.log("ReservationDetails - Datos de apartamento:", apartment);
        
        if (apartmentError) {
            console.error("Error al cargar los datos del apartamento:", apartmentError);
        }
    }, [reservation, apartment, adminApartmentState, apartmentError]);

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
                    Reservation not found: {id}
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
            // Agregar todos los posibles estados
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'error',
            completed: 'info',
        };
        return statusColors[status] || 'default';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Verificar y normalizar los nombres de propiedades para evitar problemas
    const normalizedReservation = {
        id: reservation.id,
        status: reservation.status,
        clientName: reservation.clientName || reservation.client_name,
        clientEmail: reservation.clientEmail || reservation.client_email,
        clientPhone: reservation.clientPhone || reservation.client_phone,
        clientCity: reservation.clientCity || reservation.client_city,
        clientCountry: reservation.clientCountry || reservation.client_country,
        checkIn: reservation.checkIn || reservation.checkInDate || reservation.check_in_date,
        checkOut: reservation.checkOut || reservation.checkOutDate || reservation.check_out_date,
        nights: reservation.nights,
        apartmentId: reservation.apartmentId || reservation.apartment_id,
        pricePerNight: reservation.pricePerNight || reservation.price_per_night,
        payments: reservation.payments || [],
        notes: reservation.notes || reservation.clientNotes || reservation.client_notes,
    };

    // Datos del apartamento desde el estado
    const apartmentInfo = apartment ? {
        id: apartment.id,
        name: apartment.name || apartment.building_name || apartment.title || '',
        address: apartment.address || apartment.location || '',
        description: apartment.description || apartment.desc || apartment.about || '',
        bathrooms: apartment.bathrooms || apartment.bathroom_count || 0,
        bedrooms: apartment.rooms || apartment.bedrooms || apartment.bedroom_count || 0,
        image: apartment.image || apartment.coverImage || apartment.cover_image || apartment.thumbnail || '',
        capacity: apartment.capacity || apartment.max_guests || apartment.maxGuests || 0
    } : null;

    // Verificación adicional para el fallback
    const apartmentData = apartmentInfo || {
        id: normalizedReservation.apartmentId,
        name: 'Información no disponible',
        address: 'Información no disponible',
        description: 'Información no disponible',
        bathrooms: 'N/A',
        bedrooms: 'N/A',
        capacity: 'N/A'
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {/* Encabezado */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Reserva #{normalizedReservation.id}
                    </Typography>
                    <Chip
                        label={normalizedReservation.status}
                        color={getStatusColor(normalizedReservation.status)}
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
                                Client Information
                            </Typography>
                            <Typography sx={{ mb: 1 }}>Name: {normalizedReservation.clientName}</Typography>
                            <Typography sx={{ mb: 1 }}>Email: {normalizedReservation.clientEmail}</Typography>
                            <Typography sx={{ mb: 1 }}>Phone: {normalizedReservation.clientPhone}</Typography>
                            <Typography sx={{ mb: 1 }}>City: {normalizedReservation.clientCity}</Typography>
                            <Typography sx={{ mb: 1 }}>Country: {normalizedReservation.clientCountry}</Typography>
                        </Paper>
                    </Grid>

                    {/* Detalles de la Reserva */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Reservation Details
                            </Typography>
                            <Typography>Check-in: {formatDate(normalizedReservation.checkIn)}</Typography>
                            <Typography>Check-out: {formatDate(normalizedReservation.checkOut)}</Typography>
                            <Typography>Nights: {normalizedReservation.nights}</Typography>
                        </Paper>
                    </Grid>

                    {/* Detalles del Apartamento */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Apartment Details
                            </Typography>
                            <Typography>Price per night: ${normalizedReservation.pricePerNight}</Typography>
                            
                            {apartmentLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : apartmentError ? (
                                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                    Error al cargar datos del apartamento: {apartmentError}
                                </Alert>
                            ) : (
                                <Box sx={{ mt: 2 }}>
                                    <Typography>Name: {apartmentData.name}</Typography>     
                                    <Typography>Address: {apartmentData.address}</Typography>
                                    <Typography>Description: {apartmentData.description}</Typography>
                                    <Typography>Bathrooms: {apartmentData.bathrooms}</Typography>
                                    <Typography>Bedrooms: {apartmentData.bedrooms}</Typography>
                                    <Typography>Capacity: {apartmentData.capacity} guests</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Resumen de Costos */}
                    <Grid item xs={12} md={6}>
                        <ReservationSummary reservation={reservation} />
                    </Grid>

                    {/* Historial de Pagos */}
                    <Grid item xs={12}>
                        <PaymentHistory reservationId={id} />
                    </Grid>

                    {/* Notas adicionales */}
                    {normalizedReservation.notes && (
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Notas
                                </Typography>
                                <Typography>{normalizedReservation.notes}</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
};

export default ReservationDetails;
