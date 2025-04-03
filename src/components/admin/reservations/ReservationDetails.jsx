import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    Event as EventIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useReservation } from '../../../hooks/useReservation';

const ReservationDetails = ({ reservation }) => {
    const { handleGeneratePdf, handleSendConfirmation } = useReservation();
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Función para formatear fechas
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para formatear montos
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'warning',
            confirmed: 'success',
            checked_in: 'info',
            checked_out: 'default',
            cancelled: 'error'
        };
        return statusColors[status] || 'default';
    };

    // Funciones para manejar la generación y envío de PDF
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
            await handleSendConfirmation(reservation.id);
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
        <Box>
            {/* Encabezado */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom>
                            Reserva #{reservation?.id}
                        </Typography>
                        <Chip
                            label={reservation?.status?.toUpperCase()}
                            color={getStatusColor(reservation?.status)}
                            sx={{ mr: 1 }}
                        />
                        <Chip
                            label={reservation?.paymentStatus?.toUpperCase()}
                            color={reservation?.paymentStatus === 'complete' ? 'success' : 'warning'}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            startIcon={<ReceiptIcon />}
                            sx={{ mr: 1 }}
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
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Información del Cliente */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Información del Cliente
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ ml: 4 }}>
                            <Typography gutterBottom>
                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {reservation?.clientName}
                            </Typography>
                            <Typography gutterBottom>
                                <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {reservation?.clientEmail}
                            </Typography>
                            <Typography gutterBottom>
                                <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {reservation?.clientPhone}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Información del Apartamento */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Detalles del Apartamento
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ ml: 4 }}>
                            <Typography gutterBottom>
                                Edificio: {reservation?.buildingName}
                            </Typography>
                            <Typography gutterBottom>
                                Unidad: {reservation?.unitNumber}
                            </Typography>
                            <Typography gutterBottom>
                                Capacidad: {reservation?.capacity} personas
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Fechas y Duración */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Fechas de la Reserva
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography gutterBottom>
                                    Check-in: {formatDate(reservation?.checkInDate)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography gutterBottom>
                                    Check-out: {formatDate(reservation?.checkOutDate)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography>
                                    Duración: {reservation?.nights} noches
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Historial de Pagos */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Historial de Pagos
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Método</TableCell>
                                        <TableCell>Referencia</TableCell>
                                        <TableCell align="right">Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reservation?.payments?.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {formatDate(payment.paymentDate)}
                                            </TableCell>
                                            <TableCell>{payment.paymentMethod}</TableCell>
                                            <TableCell>{payment.paymentReference}</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!reservation?.payments || reservation.payments.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No hay pagos registrados
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
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
        </Box>
    );
};

export default ReservationDetails;
