import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useReservation } from '../../../hooks/useReservation';
import ReservationSummary from '../payments/ReservationSummary';

const ReservationDetails = ({ reservation, apartmentLoading, apartmentError, apartmentData }) => {
    const { handleGeneratePdf, handleSendConfirmation } = useReservation();
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'warning',
            CONFIRMED: 'success',
            CANCELLED: 'error',
            COMPLETED: 'info',
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'error',
            completed: 'info',
        };
        return statusColors[status] || 'default';
    };

    const handleGeneratePdfClick = async () => {
        try {
            await handleGeneratePdf(reservation.id);
            setSnackbar({
                open: true,
                message: 'PDF generado con éxito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al generar el PDF: ' + error.message,
                severity: 'error'
            });
        }
    };

    const handleSendEmailClick = () => {
        setEmail(reservation?.clientEmail || '');
        setOpenEmailDialog(true);
    };

    const handleSendEmail = async () => {
        try {
            await handleGeneratePdf(reservation.id, email);
            setOpenEmailDialog(false);
            setSnackbar({
                open: true,
                message: 'Email enviado con éxito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al enviar el email: ' + error.message,
                severity: 'error'
            });
        }
    };

    const handleSendConfirmationEmail = async () => {
        try {
            await handleSendConfirmation({
                id: reservation.id,
                notificationType: 'confirmation'
            });
            setSnackbar({
                open: true,
                message: 'Confirmación enviada con éxito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al enviar la confirmación: ' + error.message,
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            {/* Encabezado */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={3}>
                <Typography variant="h4">
                    Reservation #{reservation?.id}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, md: 0 } }}>
                    <Chip
                        label={reservation?.status}
                        color={getStatusColor(reservation?.status)}
                        size="large"
                    />
                    <Button 
                        variant="contained" 
                        startIcon={<ReceiptIcon />}
                        onClick={handleGeneratePdfClick}
                    >
                        Generate PDF
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<EmailIcon />}
                        onClick={handleSendEmailClick}
                    >
                        Send Email
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
                        <Typography sx={{ mb: 1 }}>Name: {reservation?.clientName}</Typography>
                        <Typography sx={{ mb: 1 }}>Email: {reservation?.clientEmail}</Typography>
                        <Typography sx={{ mb: 1 }}>Phone: {reservation?.clientPhone}</Typography>
                        <Typography sx={{ mb: 1 }}>City: {reservation?.clientCity}</Typography>
                        <Typography sx={{ mb: 1 }}>Country: {reservation?.clientCountry}</Typography>
                    </Paper>
                </Grid>

                {/* Detalles de la Reserva */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Reservation Details
                        </Typography>
                        <Typography>Check-in: {formatDate(reservation?.checkIn)}</Typography>
                        <Typography>Check-out: {formatDate(reservation?.checkOut)}</Typography>
                        <Typography>Nights: {reservation?.nights}</Typography>
                    </Paper>
                </Grid>

                {/* Detalles del Apartamento */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Apartment Details
                        </Typography>
                        <Typography>Price per night: ${reservation?.pricePerNight}</Typography>
                        
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
                                <Typography>Name: {apartmentData?.name}</Typography>     
                                <Typography>Address: {apartmentData?.address}</Typography>
                                <Typography>Description: {apartmentData?.description}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Resumen de Costos */}
                <Grid item xs={12} md={6}>
                    <ReservationSummary reservation={reservation} />
                </Grid>

                {/* Notas adicionales */}
                {reservation?.notes && (
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Notas
                            </Typography>
                            <Typography>{reservation?.notes}</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

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
        </Paper>
    );
};

export default ReservationDetails;
