import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Skeleton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    Stack
} from '@mui/material';
import {
    Email as EmailIcon,
    Receipt as ReceiptIcon,
    Update as UpdateIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { useReservation } from '../../../hooks/useReservation';
import ReservationSummary from '../payments/ReservationSummary';
import { formatDateForDisplay } from '../../../utils/dateUtils';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ReservationDetails = ({ reservation, apartmentLoading, apartmentError, apartmentData, onError }) => {
    const { handleGeneratePdf, handleSendConfirmation } = useReservation();
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceDetection();
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(null);
    const [successTimer, setSuccessTimer] = useState(null);
    const [emailsSent, setEmailsSent] = useState(() => {
        // Load initial state from localStorage
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '{}');
        return {
            confirmation: sentEmails[`${reservation?.id}-confirmation`] || 0,
            status_update: sentEmails[`${reservation?.id}-status_update`] || 0,
            payment: sentEmails[`${reservation?.id}-payment`] || 0
        };
    });
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: '',
        details: ''
    });

    useEffect(() => {
        return () => {
            if (redirectTimer) {
                clearTimeout(redirectTimer);
            }
            if (successTimer) {
                clearTimeout(successTimer);
            }
        };
    }, [redirectTimer, successTimer]);

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'warning',
            CONFIRMED: 'success',
            CANCELLED: 'error',
            COMPLETED: 'info',
            CHECKED_IN: 'warning',
            CHECKED_OUT: 'info',
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'error',
            completed: 'info',
            checked_in: 'warning',
            checked_out: 'info',
        };
        return statusColors[status] || 'default';
    };

    const handleError = (error) => {
        let errorMessage = '';
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        } else {
            errorMessage = 'An unexpected error has occurred';
        }

        // Close menu if open
        if (anchorEl) {
            handleMenuClose();
        }

        // Propagate error to parent component
        if (onError) {
            onError({ message: errorMessage });
        }
    };

    const handleSuccess = (message) => {
        // Mostrar mensaje de éxito en el componente padre
        if (onError) {
            onError({ 
                message,
                severity: 'success'
            });
        }
    };

    const handleGeneratePdfClick = async () => {
        try {
            setLoading(true);
            await handleGeneratePdf(reservation.id);
            handleSuccess('PDF generated successfully');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        try {
            setLoading(true);
            await handleGeneratePdf(reservation.id, email);
            setOpenEmailDialog(false);
            handleSuccess('Email sent successfully');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Function to check if email is still in cooldown
    const isEmailInCooldown = (type) => {
        const lastSentTime = emailsSent[type];
        if (!lastSentTime) return false;
        
        const now = Date.now();
        const cooldownPeriod = 1 * 60 * 1000; // 1 minuto en milisegundos
        return (now - lastSentTime) < cooldownPeriod;
    };

    // Function to get remaining cooldown time in minutes
    const getRemainingCooldown = (type) => {
        const lastSentTime = emailsSent[type];
        if (!lastSentTime) return 0;
        
        const now = Date.now();
        const cooldownPeriod = 1 * 60 * 1000; // 1 minuto en milisegundos
        const remaining = cooldownPeriod - (now - lastSentTime);
        return Math.max(0, Math.ceil(remaining / 60000)); // Convertir a minutos y redondear hacia arriba
    };

    const handleSendNotification = async (type) => {
        // Verificar el cooldown antes de proceder
        if (isEmailInCooldown(type)) {
            const remainingMinutes = getRemainingCooldown(type);
            handleError(`Please wait ${remainingMinutes} minutes before sending another ${type} notification`);
            return;
        }

        // Deshabilitar inmediatamente para prevenir doble envío
        const now = Date.now();
        setEmailsSent(prev => ({
            ...prev,
            [type]: now
        }));
        
        // Guardar en localStorage inmediatamente
        localStorage.setItem('sentEmails', JSON.stringify({
            ...JSON.parse(localStorage.getItem('sentEmails') || '{}'),
            [`${reservation.id}-${type}`]: now
        }));

        setLoading(true);
        try {
            await handleSendConfirmation({
                id: reservation.id,
                notificationType: type
            });

            // Show success message
            const messageMap = {
                confirmation: 'Confirmation email sent successfully',
                status_update: 'Status update email sent successfully',
                payment: 'Payment notification sent successfully'
            };

            handleSuccess(messageMap[type] || `${type} email sent successfully`);

            // Cerrar el menú después de un envío exitoso
            handleMenuClose();
        } catch (error) {
            // Si hay un error, revertir el estado
            setEmailsSent(prev => ({
                ...prev,
                [type]: 0
            }));
            
            // Revertir localStorage
            const storedEmails = JSON.parse(localStorage.getItem('sentEmails') || '{}');
            delete storedEmails[`${reservation.id}-${type}`];
            localStorage.setItem('sentEmails', JSON.stringify(storedEmails));

            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para mantener sincronizado el estado con localStorage
    useEffect(() => {
        const checkEmailStatus = () => {
            const storedEmails = JSON.parse(localStorage.getItem('sentEmails') || '{}');
            const newEmailsSent = {
                confirmation: storedEmails[`${reservation?.id}-confirmation`] || 0,
                status_update: storedEmails[`${reservation?.id}-status_update`] || 0,
                payment: storedEmails[`${reservation?.id}-payment`] || 0
            };
            setEmailsSent(newEmailsSent);
        };

        // Verificar el estado al montar el componente
        checkEmailStatus();

        // Configurar un intervalo para verificar periódicamente
        const interval = setInterval(checkEmailStatus, 30000); // Verificar cada 30 segundos

        return () => clearInterval(interval);
    }, [reservation?.id]);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        // Usar nuestra función de utilidad para mostrar la fecha
        return formatDateForDisplay(date, true);
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            {/* Encabezado */}
            <Box 
                display="flex" 
                flexDirection={isMobile ? "column" : "row"}
                justifyContent="space-between" 
                alignItems={isMobile ? "flex-start" : "center"} 
                mb={3}
            >
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: isMobile ? 2 : 0 }}>
                    Reservation #{reservation?.id}
                </Typography>
                <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={1} 
                    width={isMobile ? "100%" : "auto"}
                >
                    <Chip
                        label={reservation?.status}
                        color={getStatusColor(reservation?.status)}
                        size="large"
                        sx={{ alignSelf: isMobile ? "flex-start" : "center" }}
                    />
                    <Button 
                        variant="contained" 
                        startIcon={<ReceiptIcon />}
                        onClick={handleGeneratePdfClick}
                        disabled={loading}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Generate PDF'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EmailIcon />}
                        onClick={handleMenuClick}
                        disabled={loading}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        Send Emails
                    </Button>
                </Stack>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: isMobile ? 'center' : 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: isMobile ? 'center' : 'right',
                }}
                PaperProps={{
                    style: {
                        width: isMobile ? '90%' : 'auto',
                        maxWidth: '300px'
                    }
                }}
            >
                <MenuItem 
                    onClick={() => handleSendNotification('confirmation')}
                    disabled={loading || isEmailInCooldown('confirmation')}
                    sx={{ py: isMobile ? 1.5 : 1 }}
                >
                    <ListItemIcon>
                        <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        {isEmailInCooldown('confirmation') 
                            ? `Confirmation email available in ${getRemainingCooldown('confirmation')} minutes`
                            : 'Send Confirmation'}
                    </ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleSendNotification('status_update')}
                    disabled={loading || isEmailInCooldown('status_update')}
                    sx={{ py: isMobile ? 1.5 : 1 }}
                >
                    <ListItemIcon>
                        <UpdateIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        {isEmailInCooldown('status_update')
                            ? `Status update available in ${getRemainingCooldown('status_update')} minutes`
                            : 'Send Status Update'}
                    </ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleSendNotification('payment')}
                    disabled={loading || isEmailInCooldown('payment')}
                    sx={{ py: isMobile ? 1.5 : 1 }}
                >
                    <ListItemIcon>
                        <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        {isEmailInCooldown('payment')
                            ? `Payment notification available in ${getRemainingCooldown('payment')} minutes`
                            : 'Send Payment Notification'}
                    </ListItemText>
                </MenuItem>
            </Menu>

            <Divider sx={{ mb: 3 }} />

            {/* Información principal */}
            <Grid container spacing={isMobile ? 2 : 3}>
                {/* Detalles del Cliente */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Client Information
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Name:</strong> {reservation?.clientName}, {reservation?.clientLastname}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Email:</strong> {reservation?.clientEmail}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Phone:</strong> {reservation?.clientPhone}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>City:</strong> {reservation?.clientCity}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Country:</strong> {reservation?.clientCountry}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Detalles de la Reserva */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Reservation Details
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Check-in:</strong> {formatDate(reservation?.checkIn)}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Check-out:</strong> {formatDate(reservation?.checkOut)}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Nights:</strong> {reservation?.nights}
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit', wordBreak: 'break-word' }}>
                            <strong>Notes:</strong> {reservation?.notes || 'N/A'}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Detalles del Apartamento */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Apartment Details
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                            <strong>Price per night:</strong> ${reservation?.pricePerNight}
                        </Typography>
                        
                        {apartmentLoading ? (
                            <Box sx={{ mt: 1 }}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="90%" />
                            </Box>
                        ) : apartmentError ? (
                            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                Error loading apartment data: {apartmentError}
                            </Alert>
                        ) : (
                            <Box sx={{ mt: 1 }}>
                                <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                    <strong>Name:</strong> {apartmentData?.name}
                                </Typography>     
                                <Typography sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                    <strong>Address:</strong> {apartmentData?.address}
                                </Typography>
                                <Typography sx={{ mb: 0, fontSize: isMobile ? '0.9rem' : 'inherit', wordBreak: 'break-word' }}>
                                    <strong>Description:</strong> {apartmentData?.description}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Resumen de Costos */}
                <Grid item xs={12} md={6}>
                    <ReservationSummary reservation={reservation} />
                </Grid>
            </Grid>

            {/* Diálogo para enviar email */}
            <Dialog 
                open={openEmailDialog} 
                onClose={() => setOpenEmailDialog(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        width: isMobile ? '95%' : '80%',
                        m: isMobile ? 1 : 'auto'
                    }
                }}
            >
                <DialogTitle>Send Reservation by Email</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={() => setOpenEmailDialog(false)}
                        size={isMobile ? "medium" : "large"}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSendEmail} 
                        variant="contained" 
                        size={isMobile ? "medium" : "large"}
                    >
                        Send PDF
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Dialog */}
            <Dialog
                open={errorDialog.open}
                onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: isMobile ? '95%' : '80%',
                        m: isMobile ? 1 : 'auto'
                    }
                }}
            >
                <DialogTitle id="error-dialog-title" sx={{ color: 'error.main' }}>
                    {errorDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        {errorDialog.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))}
                        variant="contained" 
                        color="primary"
                        autoFocus
                        fullWidth={isMobile}
                        size={isMobile ? "medium" : "large"}
                    >
                        Accept
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mensajes de éxito locales */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: isMobile ? 'bottom' : 'top', horizontal: 'center' }}
                sx={{
                    width: isMobile ? '100%' : 'auto',
                    '& .MuiPaper-root': {
                        width: isMobile ? '90%' : 'auto'
                    }
                }}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ReservationDetails;
