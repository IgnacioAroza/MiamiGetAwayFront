import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { fetchReservationById } from '../redux/reservationSlice';
import { normalizeReservationFromApi } from '../utils/normalizers';
import { fetchAdminApartmentById } from '../redux/adminApartmentSlice';
import PaymentHistory from '../components/admin/payments/PaymentHistory';
import ReservationDetails from '../components/admin/reservations/ReservationDetails';

const ReservationDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { selectedReservation: reservation, loading, error } = useSelector(state => state.reservations);
    
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    // Obtener todo el estado de adminApartments para inspección
    const adminApartmentState = useSelector(state => state.adminApartments);
    const { selectedApartment: apartment, loading: apartmentLoading, error: apartmentError } = adminApartmentState;

    useEffect(() => {
        if (id) {
            dispatch(fetchReservationById(id));
        }
    }, [dispatch, id, location]);

    // Efecto separado para cargar el apartamento cuando tengamos los datos de la reserva
    useEffect(() => {
        if (reservation) {
            // Buscar el ID del apartamento en diferentes formatos posibles
            const apartmentId = reservation.apartmentId || reservation.apartment_id;
            
            if (apartmentId) {
                dispatch(fetchAdminApartmentById(apartmentId));
            } else {
                console.error("The apartment ID could not be detected in the reservation.:", reservation);
            }
        }
    }, [dispatch, reservation]);

    useEffect(() => {        
        if (apartmentError) {
            console.error("Error loading apartment data:", apartmentError);
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

    // Normalización unificada + aliases para compatibilidad
    const normalizedApi = normalizeReservationFromApi(reservation);
    const normalizedReservation = {
        ...normalizedApi,
        checkIn: normalizedApi.checkInDate,
        checkOut: normalizedApi.checkOutDate,
        clientNotes: normalizedApi.clientNotes || reservation.notes || '',
        buildingName: reservation.buildingName || '',
        unitNumber: reservation.unitNumber || '',
        capacity: reservation.capacity || 0,
        payments: reservation.payments || [],
        notes: reservation.notes || normalizedApi.clientNotes || '',
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
        // Agregar images como array para compatibilidad con useApartmentImages
        images: apartment.images && apartment.images.length > 0 ? apartment.images : 
                apartment.image || apartment.coverImage || apartment.cover_image || apartment.thumbnail ? 
                [apartment.image || apartment.coverImage || apartment.cover_image || apartment.thumbnail] : [],
        capacity: apartment.capacity || apartment.max_guests || apartment.maxGuests || 0
    } : null;

    // Verificación adicional para el fallback
    const apartmentData = apartmentInfo || {
        id: normalizedReservation.apartmentId,
        name: 'Information not available',
        address: 'Information not available',
        description: 'Information not available',
        bathrooms: 'N/A',
        bedrooms: 'N/A',
        capacity: 'N/A'
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ReservationDetails 
                reservation={normalizedReservation}
                apartmentLoading={apartmentLoading}
                apartmentError={apartmentError}
                apartmentData={apartmentData}
                onError={(response) => {
                    setSnackbar({
                        open: true,
                        message: response.message || 'Error sending confirmation',
                        severity: response.severity || 'error'
                    });
                }}
            />
            
            <PaymentHistory reservationId={id} />

            {/* Snackbar para todos los mensajes */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ReservationDetailsPage;
