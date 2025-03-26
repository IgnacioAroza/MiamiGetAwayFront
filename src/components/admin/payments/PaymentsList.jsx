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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { 
    fetchAllPayments, 
    deletePayment,
    setSelectedPayment,
    clearSelectedPayment 
} from '../../../redux/reservationPaymentSlice';
import PaymentForm from './PaymentsForm';
import PaymentDetails from './PaymentDetails';

// Componente para mostrar y gestionar la lista de pagos
const PaymentsList = () => {
    const dispatch = useDispatch();
    const { payments, status, error, loading } = useSelector(state => state.reservationPayments);
    
    // Estados locales
    const [openForm, setOpenForm] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);

    // Cargar pagos al montar el componente
    useEffect(() => {
        dispatch(fetchAllPayments());
    }, [dispatch]);

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
                message: 'Pago eliminado exitosamente',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Error al eliminar el pago',
                severity: 'error'
            });
        } finally {
            setOpenDeleteDialog(false);
            setPaymentToDelete(null);
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Formatear monto
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
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
                                        {payment.paymentMethod === 'cash' ? 'Cash' :
                                         payment.paymentMethod === 'transfer' ? 'Transfer' : 
                                         payment.paymentMethod === 'card' ? 'Card' : 'Other'}
                                    </TableCell>
                                    <TableCell>{payment.paymentReference || '-'}</TableCell>
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
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    ¿Está seguro que desea eliminar este pago? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                    >
                        Eliminar
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
