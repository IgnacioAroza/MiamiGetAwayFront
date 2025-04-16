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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Email as EmailIcon,
    Receipt as ReceiptIcon,
    Update as UpdateIcon,
    Payment as PaymentIcon
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
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(null);
    const [successTimer, setSuccessTimer] = useState(null);

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

    const handleSuccess = (message) => {
        setSnackbar({
            open: true,
            message: message,
            severity: 'success'
        });
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev }));
        }, 100);
    };

    const handleError = (error) => {
        setSnackbar({
            open: true,
            message: error.message || 'Error in the operation',
            severity: 'error'
        });
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev }));
        }, 100);
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

    const handleSendNotification = async (type) => {
        try {
            setLoading(true);
            await handleSendConfirmation({
                id: reservation.id,
                notificationType: type
            });
            handleSuccess(`Notification ${type} sent successfully`);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
            handleMenuClose();
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({ ...prev, open: false }));
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
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Generate PDF'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EmailIcon />}
                        onClick={handleMenuClick}
                        disabled={loading}
                    >
                        Send Emails
                    </Button>
                </Box>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={() => handleSendNotification('confirmation')}>
                    <ListItemIcon>
                        <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send Confirmation</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSendNotification('status_update')}>
                    <ListItemIcon>
                        <UpdateIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send Status Update</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSendNotification('payment')}>
                    <ListItemIcon>
                        <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send Payment Notification</ListItemText>
                </MenuItem>
            </Menu>

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
                        <Typography>Notes: {reservation?.notes}</Typography>
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
                                Error loading apartment data: {apartmentError}
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
            </Grid>

            {/* Diálogo para enviar email */}
            <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
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
                <DialogActions>
                    <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
                    <Button onClick={handleSendEmail} variant="contained">Send PDF</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{
                    '& .MuiSnackbar-root': {
                        top: '24px !important'
                    }
                }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ 
                        width: '100%',
                        boxShadow: 3,
                        '& .MuiAlert-message': {
                            fontSize: '1rem'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ReservationDetails;
