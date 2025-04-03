import React, { useEffect, useState } from 'react';
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
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar
} from '@mui/material';
import {
    Receipt as ReceiptIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { fetchReservationById, generateReservationPdf, sendReservationConfirmation } from '../redux/reservationSlice';
import { fetchAdminApartmentById } from '../redux/adminApartmentSlice';
import PaymentHistory from '../components/admin/payments/PaymentHistory';
import ReservationSummary from '../components/admin/payments/ReservationSummary';

const ReservationDetails = () => {
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
            const apartmentId = reservation.apartment_id
            
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

    // Funciones para manejar la generación y envío de PDF
    const handleGeneratePdfClick = async () => {
        try {
            // Primero ejecutamos un diagnóstico para verificar los datos
            const reservationService = await import('../services/reservationService').then(module => module.default);
            
            const diagnosis = await reservationService.diagnosePdfGeneration(id);
            
            if (!diagnosis.success) {
                // Mostrar advertencia pero continuar con la generación del PDF
                setSnackbar({
                    open: true,
                    message: `Advertencia: ${diagnosis.message}. Se intentará generar el PDF de todos modos.`,
                    severity: 'warning'
                });
            }
            
            // Llamar al thunk que inicia la descarga directa del PDF
            await dispatch(generateReservationPdf({ id })).unwrap();
            
            setSnackbar({
                open: true,
                message: 'Descarga de PDF iniciada',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al generar el PDF: ' + (error.message || 'Error desconocido'),
                severity: 'error'
            });
        }
    };

    const handleSendEmailClick = () => {
        setEmail(normalizedReservation.clientEmail || '');
        setOpenEmailDialog(true);
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
            await dispatch(sendReservationConfirmation(id)).unwrap();
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
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {/* Encabezado */}
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={3}>
                    <Typography variant="h4">
                        Reserva #{normalizedReservation.id}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, md: 0 } }}>
                        <Chip
                            label={normalizedReservation.status}
                            color={getStatusColor(normalizedReservation.status)}
                            size="large"
                        />
                        <Button 
                            variant="contained" 
                            startIcon={<ReceiptIcon />}
                            onClick={handleGeneratePdfClick}
                        >
                            Generar PDF
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<EmailIcon />}
                            onClick={handleSendEmailClick}
                        >
                            Enviar Email
                        </Button>
                    </Box>
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

export default ReservationDetails;
