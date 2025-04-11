import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar
} from '@mui/material';
import { fetchReservationById, generateReservationPdf, sendReservationConfirmation } from '../redux/reservationSlice';
import { fetchAdminApartmentById } from '../redux/adminApartmentSlice';
import PaymentHistory from '../components/admin/payments/PaymentHistory';
import ReservationDetails from '../components/admin/reservations/ReservationDetails';

const ReservationDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { selectedReservation: reservation, loading, error } = useSelector(state => state.reservations);
    
    // Estado para el diálogo de email y notificaciones
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
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
                console.error("No se pudo detectar el ID del apartamento en la reserva:", reservation);
            }
        }
    }, [dispatch, reservation]);

    useEffect(() => {        
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
        // Información del cliente
        clientName: reservation.clientName || reservation.client_name || '',
        clientLastname: reservation.clientLastname || reservation.client_lastname || '',
        clientEmail: reservation.clientEmail || reservation.client_email || '',
        clientPhone: reservation.clientPhone || reservation.client_phone || '',
        clientAddress: reservation.clientAddress || reservation.client_address || '',
        clientCity: reservation.clientCity || reservation.client_city || '',
        clientCountry: reservation.clientCountry || reservation.client_country || '',
        clientNotes: reservation.clientNotes || reservation.client_notes || reservation.notes || '',
        
        // Fechas y duración
        checkInDate: reservation.checkInDate || reservation.check_in_date || '',
        checkOutDate: reservation.checkOutDate || reservation.check_out_date || '',
        checkIn: reservation.checkIn || reservation.checkInDate || reservation.check_in_date || '',
        checkOut: reservation.checkOut || reservation.checkOutDate || reservation.check_out_date || '',
        nights: reservation.nights || 0,
        
        // Información del apartamento
        apartmentId: reservation.apartmentId || reservation.apartment_id || 0,
        buildingName: reservation.buildingName || '',
        unitNumber: reservation.unitNumber || '',
        capacity: reservation.capacity || 0,
        
        // Costos y pagos
        pricePerNight: reservation.pricePerNight || reservation.price_per_night || 0,
        cleaningFee: reservation.cleaningFee || reservation.cleaning_fee || 0,
        parkingFee: reservation.parkingFee || reservation.parking_fee || 0,
        otherExpenses: reservation.otherExpenses || reservation.other_expenses || 0,
        taxes: reservation.taxes || 0,
        totalAmount: reservation.totalAmount || reservation.total_amount || 0,
        amountPaid: reservation.amountPaid || reservation.amount_paid || 0,
        amountDue: reservation.amountDue || reservation.amount_due || 0,
        
        // Estados
        status: reservation.status || '',
        paymentStatus: reservation.paymentStatus || reservation.payment_status || '',
        
        // Otros datos
        createdAt: reservation.createdAt || reservation.created_at || '',
        payments: reservation.payments || [],
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

    const handleSendEmail = async () => {
        try {
            // Validar email
            if (!email || !email.includes('@')) {
                throw new Error('Por favor ingrese un email válido');
            }
            
            // Enviar el PDF por email
            await dispatch(generateReservationPdf({ id, email })).unwrap();
            
            setOpenEmailDialog(false);
            setSnackbar({
                open: true,
                message: 'Email enviado con éxito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al enviar el email: ' + (error.message || 'Error desconocido'),
                severity: 'error'
            });
        }
    };

    const handleSendConfirmationEmail = async () => {
        try {
            await dispatch(sendReservationConfirmation({ 
                id: normalizedReservation.id, 
                notificationType: 'confirmation' 
            })).unwrap();
            
            setOpenEmailDialog(false);
            setSnackbar({
                open: true,
                message: 'Confirmación enviada con éxito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al enviar la confirmación: ' + (error.message || 'Error desconocido'),
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ReservationDetails 
                reservation={normalizedReservation}
                apartmentLoading={apartmentLoading}
                apartmentError={apartmentError}
                apartmentData={apartmentData}
            />
            
            <PaymentHistory reservationId={id} />

            {/* Diálogo para enviar email */}
            <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
                <DialogTitle>Enviar Reserva por Email</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Correo Electrónico"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEmailDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSendEmail} variant="contained">Enviar PDF</Button>
                    <Button onClick={handleSendConfirmationEmail} color="secondary" variant="contained">
                        Enviar Confirmación
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ReservationDetailsPage;
