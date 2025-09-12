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
    Stack,
    Card,
    CardContent,
    CardMedia
} from '@mui/material';
import {
    Email as EmailIcon,
    Receipt as ReceiptIcon,
    Update as UpdateIcon,
    Payment as PaymentIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useReservation } from '../../../hooks/useReservation';
import { useNavigate } from 'react-router-dom';
import ReservationSummary from '../payments/ReservationSummary';
import { formatDateForDisplay } from '../../../utils/dateUtils';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import { useApartmentImages } from '../../../hooks/useApartmentImages';

const ReservationDetails = ({ reservation, apartmentLoading, apartmentError, apartmentData, onError }) => {
    const { handleGeneratePdf, handleSendConfirmation } = useReservation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceDetection();
    
    // Usar el hook useApartmentImages igual que en ApartmentSection
    const { getApartmentDetails, getApartmentImage } = useApartmentImages(apartmentData);
    const apartmentDetails = getApartmentDetails();
    
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

    const handleBackClick = () => {
        navigate(-1); // Navegar hacia atrás en el historial
    };

    return (
        <Box sx={{ bgcolor: '#1a1a1a', minHeight: '100vh', p: 2 }}>
            {/* Encabezado */}
            <Box 
                display="flex" 
                flexDirection={isMobile ? "column" : "row"}
                justifyContent="space-between" 
                alignItems={isMobile ? "flex-start" : "center"} 
                mb={3}
            >
                <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={isMobile ? 2 : 0}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackClick}
                        sx={{ 
                            mr: 2,
                            minWidth: isMobile ? "auto" : "120px",
                            px: isMobile ? 1.5 : 2,
                            color: '#fff',
                            borderColor: '#555',
                            '&:hover': {
                                borderColor: '#777',
                                bgcolor: 'rgba(255,255,255,0.05)'
                            }
                        }}
                        size={isMobile ? "small" : "medium"}
                    >
                        {isMobile ? "" : "Back"}
                    </Button>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: '#fff' }}>
                        Reservation #{reservation?.id}
                    </Typography>
                </Box>
                <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={1} 
                    width={isMobile ? "100%" : "auto"}
                >
                    <Chip
                        label={reservation?.status?.toUpperCase()}
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
                        sx={{
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Generate PDF'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EmailIcon />}
                        onClick={handleMenuClick}
                        disabled={loading}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            bgcolor: '#ff9800',
                            '&:hover': { bgcolor: '#f57c00' }
                        }}
                    >
                        Send Email
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

            <Divider sx={{ mb: 3, borderColor: '#333' }} />

            {/* Layout principal: 50/50 - Información agrupada a la izquierda, Payment Summary a la derecha */}
            <Grid container spacing={3}>
                {/* Columna izquierda: Todas las secciones agrupadas - 50% */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#2a2a2a', borderRadius: 2 }}>
                        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                            {/* Client Information y Reservation Details lado a lado */}
                            <Grid container spacing={3}>
                                {/* Client Information - 50% */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
                                        Client Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Name:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {reservation?.clientName}, {reservation?.clientLastname}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Email:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {reservation?.clientEmail}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Country:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {reservation?.clientCountry}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Phone:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {reservation?.clientPhone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Reservation Details - 50% */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
                                        Reservation Details
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Check-in:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {formatDate(reservation?.checkIn)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Check-out:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {formatDate(reservation?.checkOut)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Nights:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                {reservation?.nights}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                Notes:
                                            </Typography>
                                            <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit', wordBreak: 'break-word' }}>
                                                {reservation?.notes || '$50 keys'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3, borderColor: '#444' }} />

                            {/* Apartment Details - Ancho completo */}
                            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
                                Apartment Details
                            </Typography>
                            
                            {apartmentLoading ? (
                                <Box sx={{ mt: 1 }}>
                                    <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#3a3a3a', mb: 2, borderRadius: 1 }} />
                                    <Skeleton variant="text" width="60%" sx={{ bgcolor: '#3a3a3a' }} />
                                    <Skeleton variant="text" width="80%" sx={{ bgcolor: '#3a3a3a' }} />
                                    <Skeleton variant="text" width="90%" sx={{ bgcolor: '#3a3a3a' }} />
                                </Box>
                            ) : apartmentError ? (
                                <Alert severity="error" sx={{ mt: 2, mb: 2, bgcolor: '#4a2c2c', color: '#ffcdd2' }}>
                                    Error loading apartment data: {apartmentError}
                                </Alert>
                            ) : (
                                <Grid container spacing={2}>
                                    {/* Imagen del apartamento usando el mismo patrón que ApartmentSection */}
                                    <Grid item xs={12} sm={5}>
                                        {apartmentDetails && apartmentDetails.image ? (
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    bgcolor: '#3a3a3a'
                                                }}
                                                image={apartmentDetails.image}
                                                alt={apartmentDetails.alt}
                                                onError={(e) => {
                                                    console.error('Error loading apartment image:', apartmentDetails.image);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    borderRadius: 1,
                                                    bgcolor: '#3a3a3a',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed #555'
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ color: '#888', textAlign: 'center', mb: 1 }}>
                                                    🏠
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#888', textAlign: 'center' }}>
                                                    No image available
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                    {/* Detalles del apartamento */}
                                    <Grid item xs={12} sm={7}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                    Name:
                                                </Typography>
                                                <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                    {apartmentDetails?.name || apartmentData?.name || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                    Address:
                                                </Typography>
                                                <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                    {apartmentData?.address || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                    Price per night:
                                                </Typography>
                                                <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                    ${apartmentDetails?.price || reservation?.pricePerNight || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                    Description:
                                                </Typography>
                                                <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit', wordBreak: 'break-word' }}>
                                                    {apartmentData?.description || 'N/A'}
                                                </Typography>
                                            </Box>
                                            {apartmentData?.distribution && (
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                        Distribution:
                                                    </Typography>
                                                    <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                        {apartmentData.distribution}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {apartmentDetails?.capacity && (
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                                                        Capacity:
                                                    </Typography>
                                                    <Typography sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                                                        {apartmentDetails.capacity} people
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Columna derecha: Payment Summary - 50% */}
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
        </Box>
    );
};

export default ReservationDetails;
