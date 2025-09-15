import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Box,
    Typography,
    CircularProgress,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Card,
    CardContent,
    CardActions,
    Grid,
    Divider,
    Chip,
    useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import { 
    fetchAllPayments, 
    deletePayment,
    setSelectedPayment,
    clearSelectedPayment 
} from '../../../redux/reservationPaymentSlice';
import PaymentForm from './PaymentsForm';
import PaymentDetails from './PaymentDetails';
import PaymentFilters from './PaymentFilters';
import userService from '../../../services/userService';
import reservationService from '../../../services/reservationService';

// Componente para mostrar y gestionar la lista de pagos
const PaymentsList = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceDetection();
    const { payments, status, error, loading } = useSelector(state => state.reservationPayments);
    
    // Estados locales
    const [openForm, setOpenForm] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
    const [reservationsData, setReservationsData] = useState({});
    const [clientsData, setClientsData] = useState({});

    // Cargar pagos al montar el componente o cuando cambian los filtros
    useEffect(() => {
        dispatch(fetchAllPayments(activeFilters));
    }, [dispatch, activeFilters]);

    // Cargar datos de reservas y clientes cuando cambian los pagos
    useEffect(() => {
        const fetchData = async () => {
            const reservationIds = payments
                .map(payment => payment.reservation_id || payment.reservationId)
                .filter(id => id && !reservationsData[id]);

            if (reservationIds.length === 0) return;

            try {
                const reservationPromises = reservationIds.map(async id => {
                    try {
                        const reservationData = await reservationService.getById(id);
                        return { id, data: reservationData };
                    } catch (error) {
                        console.error(`Error fetching reservation ${id}:`, error);
                        return { id, data: null };
                    }
                });

                const reservationResults = await Promise.all(reservationPromises);
                const newReservationsData = { ...reservationsData };
                
                const clientIds = new Set();
                reservationResults.forEach(({ id, data }) => {
                    if (data) {
                        newReservationsData[id] = data;
                        const clientId = data.client_id || data.clientId;
                        if (clientId) {
                            clientIds.add(clientId);
                        }
                    }
                });

                setReservationsData(newReservationsData);

                const clientPromises = Array.from(clientIds).map(async id => {
                    try {
                        const userData = await userService.getUserById(id);
                        if (!userData || !userData.id) {
                            return { id, data: null };
                        }
                        return { id, data: userData };
                    } catch (error) {
                        console.error(`Error fetching user ${id}:`, error);
                        return { id, data: null };
                    }
                });

                const clientResults = await Promise.all(clientPromises);
                const newClientsData = { ...clientsData };
                
                clientResults.forEach(({ id, data }) => {
                    if (data) {
                        const formattedClientData = {
                            id: data.id,
                            name: data.name || data.firstName || data.first_name || '',
                            lastname: data.lastname || data.lastName || data.last_name || '',
                            email: data.email || '',
                            phone: data.phone || ''
                        };
                        newClientsData[id] = formattedClientData;
                    }
                });

                setClientsData(newClientsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [payments, reservationsData, clientsData]);

    // Función para obtener el nombre del cliente
    const getClientName = (payment) => {
        const reservationId = payment.reservation_id || payment.reservationId;
        if (!reservationId) return '-';
        
        const reservation = reservationsData[reservationId];
        if (!reservation) return 'Loading...';

        const clientId = reservation.client_id || reservation.clientId;
        if (!clientId) return '-';

        const client = clientsData[clientId];
        if (!client) return 'Loading...';

        return `${client.name || ''} ${client.lastname || ''}`.trim() || '-';
    };

    // Manejadores de eventos
    const handleCreateNew = () => {
        dispatch(clearSelectedPayment());
        setOpenForm(true);
    };

    const handleEdit = (payment) => {
        dispatch(setSelectedPayment(payment));
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        dispatch(clearSelectedPayment());
        setOpenForm(false);
    };

    const handleDeleteClick = (payment) => {
        setPaymentToDelete(payment);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await dispatch(deletePayment(paymentToDelete.id)).unwrap();
            setSnackbar({
                open: true,
                message: 'Payment deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Error deleting payment',
                severity: 'error'
            });
        } finally {
            setOpenDeleteDialog(false);
            setPaymentToDelete(null);
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return 'N/A';
        }
    };

    // Formatear monto
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Normalizar el método de pago
    const normalizePaymentMethod = (method) => {
        if (!method) return 'Other';
        
        const methodMap = {
            'cash': 'Cash',
            'CASH': 'Cash',
            'transfer': 'Bank Transfer',
            'TRANSFER': 'Bank Transfer',
            'card': 'Card',
            'CARD': 'Card',
            'CREDIT_CARD': 'Card',
            'paypal': 'PayPal',
            'PAYPAL': 'PayPal',
            'zelle': 'Zelle',
            'ZELLE': 'Zelle',
            'stripe': 'Stripe',
            'STRIPE': 'Stripe',
            'other': 'Other',
            'OTHER': 'Other'
        };

        return methodMap[method] || method;
    };

    // Función para aplicar filtros
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setActiveFilters({});
    };

    // Función para renderizar tarjetas en vista móvil
    const renderMobileCards = () => {
        if (payments.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">No payments registered</Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {payments.map((payment) => (
                    <Grid item xs={12} key={payment.id}>
                        <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PaymentIcon sx={{ mr: 1 }} />
                                        {formatAmount(payment.amount)}
                                    </Typography>
                                    <Chip
                                        label={normalizePaymentMethod(payment.paymentMethod)}
                                        size="small"
                                        color="primary"
                                    />
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {formatDate(payment.paymentDate)}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                Client: {getClientName(payment)}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {payment.notes && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                                <NoteIcon sx={{ mr: 1, color: 'primary.main', mt: 0.3 }} />
                                                <Typography variant="body2">
                                                    {payment.notes}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEdit(payment)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(payment)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Skeleton variant="text" width={220} height={36} />
                    <Skeleton variant="rectangular" width={160} height={36} />
                </Box>

                {isMobile || isTablet ? (
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, idx) => (
                            <Grid item xs={12} key={idx}>
                                <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Skeleton variant="text" width={120} height={28} />
                                            <Skeleton variant="rounded" width={90} height={24} />
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Skeleton variant="text" width="50%" />
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="text" width="40%" />
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Date','Amount','Method','Client','Notes','Actions'].map((h) => (
                                        <TableCell key={h}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(5)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={110} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={180} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={220} /></TableCell>
                                        <TableCell align="center">
                                            <Skeleton variant="circular" width={28} height={28} />
                                            <Skeleton variant="circular" width={28} height={28} sx={{ ml: 1 }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h2">
                    Payments Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                >
                    New Payment
                </Button>
            </Box>

            {/* Componente de filtros */}
            <PaymentFilters 
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />

            {isMobile || isTablet ? (
                // Mostrar tarjetas en vista móvil o tablet
                renderMobileCards()
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="payments table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment Method</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No payments registered
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                        <TableCell>{formatAmount(payment.amount)}</TableCell>
                                        <TableCell>
                                            {normalizePaymentMethod(payment.paymentMethod)}
                                        </TableCell>
                                        <TableCell>Client: {getClientName(payment)}</TableCell>
                                        <TableCell>{payment.notes || '-'}</TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                color="primary"
                                                onClick={() => handleEdit(payment)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                color="error"
                                                onClick={() => handleDeleteClick(payment)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal de Formulario */}
            <PaymentForm 
                open={openForm}
                onClose={handleCloseForm}
            />

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this payment? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={!!selectedPaymentForDetails}
                onClose={() => setSelectedPaymentForDetails(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    {selectedPaymentForDetails && (
                        <PaymentDetails payment={selectedPaymentForDetails} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedPaymentForDetails(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentsList;
