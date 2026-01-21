import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    IconButton,
    Button,
    Grid,
    Divider,
    Tooltip,
    CircularProgress,
    Skeleton,
    TableSortLabel,
    Card,
    CardContent,
    CardActions,
    Stack,
    useTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Apartment as ApartmentIcon,
    AttachMoney as MoneyIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { fetchReservations, deleteReservation, setSelectedReservation } from '../../../redux/reservationSlice';
import adminApartmentService from '../../../services/adminApartmentService';
import userService from '../../../services/userService';
import ReservationFilters from './ReservationFilters';
import { formatDateForDisplay, parseStringToDate } from '../../../utils/dateUtils';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ReservationList = ({ filter = {} }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const { reservations, loading, status, error } = useSelector((state) => state.reservations);
    const { isMobile, isTablet } = useDeviceDetection();
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        // Recuperar rowsPerPage desde localStorage
        const saved = localStorage.getItem('reservationList_rowsPerPage');
        return saved ? parseInt(saved, 10) : 10;
    });
    const [buildingNames, setBuildingNames] = useState({});
    const [adminApartments, setAdminApartments] = useState([]);
    const [orderBy, setOrderBy] = useState(() => {
        // Recuperar orderBy desde localStorage (fall back a ordenar por check-in ascendente)
        return localStorage.getItem('reservationList_orderBy') || 'check_in_date';
    });
    const [order, setOrder] = useState(() => {
        // Recuperar order desde localStorage (fall back ascendente)
        return localStorage.getItem('reservationList_order') || 'asc';
    });
    const [activeFilters, setActiveFilters] = useState({ upcoming: 'true' });
    const [clientMap, setClientMap] = useState({});
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        reservationId: null,
        reservationName: '',
        hasWarning: false,
        warningMessage: ''
    });
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    // Función para ordenar las reservas localmente
    const sortReservations = (reservations, orderBy, order) => {
        return [...reservations].sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            // Manejar campos con nombres alternativos
            if (orderBy === 'check_in_date') {
                aValue = a.check_in_date || a.checkInDate;
                bValue = b.check_in_date || b.checkInDate;
            } else if (orderBy === 'check_out_date') {
                aValue = a.check_out_date || a.checkOutDate;
                bValue = b.check_out_date || b.checkOutDate;
            } else if (orderBy === 'total_amount') {
                aValue = a.total_amount || a.totalAmount;
                bValue = b.total_amount || b.totalAmount;
            } else if (orderBy === 'created_at') {
                aValue = a.created_at || a.createdAt;
                bValue = b.created_at || b.createdAt;
            } else if (orderBy === 'payment_status') {
                aValue = a.payment_status || a.paymentStatus;
                bValue = b.payment_status || b.paymentStatus;
            }

            // Si es una fecha, convertir a timestamp
            if (orderBy === 'created_at' || orderBy === 'check_in_date' || orderBy === 'check_out_date') {
                // Manejar valores nulos/undefined
                if (!aValue && !bValue) return 0;
                if (!aValue) return order === 'asc' ? -1 : 1;
                if (!bValue) return order === 'asc' ? 1 : -1;
                
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
                
                // Verificar si las fechas son válidas
                if (isNaN(aValue) && isNaN(bValue)) return 0;
                if (isNaN(aValue)) return order === 'asc' ? -1 : 1;
                if (isNaN(bValue)) return order === 'asc' ? 1 : -1;
            }

            // Si es un número, convertir a número
            if (orderBy === 'total_amount' || orderBy === 'id') {
                // Manejar valores nulos/undefined
                if (aValue === null || aValue === undefined) aValue = 0;
                if (bValue === null || bValue === undefined) bValue = 0;
                
                aValue = Number(aValue);
                bValue = Number(bValue);
                
                // Verificar si son números válidos
                if (isNaN(aValue)) aValue = 0;
                if (isNaN(bValue)) bValue = 0;
            }

            // Para campos de texto (como status), convertir a string y comparar
            if (orderBy === 'status' || orderBy === 'payment_status' || 
                (typeof aValue === 'string' || typeof bValue === 'string')) {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }

            // Realizar la comparación
            if (order === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    };
    
    const combinedFilters = useMemo(() => ({ ...filter, ...activeFilters }), [filter, activeFilters]);

    // Cargar reservas al montar el componente o cuando cambian los filtros
    useEffect(() => {
        dispatch(fetchReservations(combinedFilters));
    }, [dispatch, combinedFilters]);

    // Efecto adicional para forzar el re-render cuando cambia el ordenamiento
    useEffect(() => {
        // Este efecto se ejecuta cuando cambian orderBy u order
        // Fuerza una actualización del componente para aplicar el ordenamiento
        if (reservations && reservations.length > 0) {
            // Solo necesitamos que se ejecute para trigger el re-render
        }
    }, [orderBy, order, reservations]);

    // Si el filtro upcoming está activo, forzar el orden por check-in ascendente y persistirlo
    useEffect(() => {
        const upcomingActive = combinedFilters.upcoming === 'true';
        const needsReset = upcomingActive && (orderBy !== 'check_in_date' || order !== 'asc');
        if (needsReset) {
            setOrderBy('check_in_date');
            setOrder('asc');
            localStorage.setItem('reservationList_orderBy', 'check_in_date');
            localStorage.setItem('reservationList_order', 'asc');
            setPage(0);
        }
    }, [combinedFilters.upcoming, orderBy, order]);
    
    // Cargar todos los apartamentos al montar el componente
    useEffect(() => {
        const loadApartments = async () => {
            try {
                const apartmentList = await adminApartmentService.getAllApartments();
                setAdminApartments(apartmentList);
                
                const namesMap = {};
                apartmentList.forEach(apt => {
                    const idKey = String(apt.id);
                    const buildingName = apt.building_name || apt.name || 'Sin nombre';
                    const unitNumber = apt.unit_number ? ` - Unidad ${apt.unit_number}` : '';
                    namesMap[idKey] = buildingName + unitNumber;
                });
                setBuildingNames(namesMap);
            } catch (error) {
                console.error('Error al cargar apartamentos:', error);
            }
        };
        
        loadApartments();
    }, []);

    // Cargar datos de clientes faltantes si la reserva no trae nombre/email
    useEffect(() => {
        const fetchMissingClients = async () => {
            try {
                if (!reservations || reservations.length === 0) return;
                const missingIds = new Set();
                reservations.forEach((r) => {
                    const hasClientInfo = (r.client_name || r.clientName) && (r.client_email || r.clientEmail);
                    const cid = r.client_id || r.clientId;
                    if (!hasClientInfo && cid && !clientMap[cid]) {
                        missingIds.add(cid);
                    }
                });
                if (missingIds.size === 0) return;

                const results = await Promise.allSettled(
                    Array.from(missingIds).map((id) => userService.getUserById(id))
                );
                const newMap = { ...clientMap };
                results.forEach((res, idx) => {
                    if (res.status === 'fulfilled' && res.value && res.value.id) {
                        const u = res.value;
                        newMap[u.id] = u; // u.name, u.lastname, u.email, u.phone normalizados
                    }
                });
                setClientMap(newMap);
            } catch (e) {
                // Silenciar errores para no bloquear la vista
            }
        };
        fetchMissingClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservations]);
    
    // Aplicar filtro local de próximas reservas (check-in >= hoy o desde fecha base) y luego ordenar
    const baseReservations = useMemo(() => {
        if (!reservations) return [];

        if (combinedFilters.upcoming === 'true') {
            const from = combinedFilters.fromDate ? new Date(combinedFilters.fromDate) : new Date();
            const withinDays = combinedFilters.withinDays ? Number(combinedFilters.withinDays) : null;

            return [...reservations]
                .filter((r) => {
                    const checkIn = r.check_in_date || r.checkInDate;
                    if (!checkIn) return false;
                    const d = new Date(checkIn);
                    if (isNaN(d)) return false;
                    if (d < from) return false;
                    if (withinDays) {
                        const limit = new Date(from);
                        limit.setDate(limit.getDate() + withinDays);
                        return d <= limit;
                    }
                    return true;
                })
                .sort((a, b) => new Date(a.check_in_date || a.checkInDate) - new Date(b.check_in_date || b.checkInDate));
        }

        return reservations;
    }, [reservations, combinedFilters]);

    // Obtener las reservas ordenadas
    const sortedReservations = sortReservations(baseReservations, orderBy, order);
    
    // Función para cambiar la ordenación
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        
        setOrder(newOrder);
        setOrderBy(property);
        setPage(0); // Resetear la página cuando cambia la ordenación
        
        // Guardar preferencias en localStorage
        localStorage.setItem('reservationList_orderBy', property);
        localStorage.setItem('reservationList_order', newOrder);
    };
    
    // Función para aplicar filtros
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setPage(0);
    };
    
    // Función para limpiar filtros
    const handleClearFilters = () => {
        setActiveFilters({});
        setPage(0);
    };
    
    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Usar nuestra función de utilidad para mostrar fechas
        return formatDateForDisplay(dateString, false); // false para no incluir la hora
    };
    
    // Formatear moneda
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0';
        return `$${parseFloat(amount).toFixed(2)}`;
    };
    
    // Obtener color para el estado de la reserva
    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'error',
            completed: 'info',
            checked_in: 'warning',
            checked_out: 'info',
            'ON_RENT': 'warning',
            'BOOKED': 'success',
            'PENDING': 'warning',
            'CHECKED_IN': 'warning',
            'CHECKED_OUT': 'info',
        };
        return statusColors[status] || 'default';
    };
    
    // Obtener color para el estado de pago
    const getPaymentStatusColor = (status) => {
        const paymentColors = {
            pending: 'warning',
            partial: 'info',
            complete: 'success',
        };
        return paymentColors[status] || 'default';
    };
    
    // Manejar cambio de página
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    // Manejar cambio de filas por página
    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        
        // Guardar preferencia en localStorage
        localStorage.setItem('reservationList_rowsPerPage', newRowsPerPage.toString());
    };
    
    // Manejar clic en editar
    const handleEditClick = (reservation) => {
        dispatch(setSelectedReservation(reservation));
        navigate(`/admin/reservations/edit/${reservation.id}`);
    };
    
    // Manejar clic en ver detalles
    const handleViewClick = (reservation) => {
        dispatch(setSelectedReservation(reservation));
        navigate(`/admin/reservations/view/${reservation.id}`);
    };
    
    // Manejar clic en eliminar
    const handleDeleteClick = (reservation) => {
        const clientName = getClientDisplay(reservation);
        const hasPayments = (reservation.amountPaid || reservation.amount_paid) > 0;
        
        let warningMessage = '';
        if (hasPayments) {
            warningMessage = '\n\nWarning: This reservation has registered payments. Deletion may not be possible.';
        }
        
        setDeleteDialog({
            open: true,
            reservationId: reservation.id,
            reservationName: `Reservation #${reservation.id} - ${clientName}`,
            hasWarning: hasPayments,
            warningMessage: warningMessage
        });
    };
    
    // Confirmar eliminación
    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteReservation(deleteDialog.reservationId)).unwrap();
            setToast({
                open: true,
                message: 'Reservation deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Delete reservation error:', error);
            
            // Manejar error específico de datos relacionados
            if (error.isRelatedDataError) {
                setToast({
                    open: true,
                    message: `${error.message}\n\n${error.details || ''}\n\nSuggestion: ${error.suggestedAction || 'Consider canceling the reservation instead of deleting it.'}`,
                    severity: 'warning'
                });
            } else {
                // Para otros tipos de error
                let errorMessage = 'Error deleting reservation. Please try again.';
                
                if (typeof error === 'string') {
                    errorMessage = error;
                } else if (error.message) {
                    errorMessage = error.message;
                } else if (error.error) {
                    errorMessage = error.error;
                }
                
                setToast({
                    open: true,
                    message: errorMessage,
                    severity: 'error'
                });
            }
        } finally {
            setDeleteDialog({ 
                open: false, 
                reservationId: null, 
                reservationName: '',
                hasWarning: false,
                warningMessage: ''
            });
        }
    };
    
    // Cancelar eliminación
    const handleCancelDelete = () => {
        setDeleteDialog({ 
            open: false, 
            reservationId: null, 
            reservationName: '',
            hasWarning: false,
            warningMessage: ''
        });
    };
    
    // Cerrar toast
    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setToast({ ...toast, open: false });
    };
    
    // Agregar nueva reserva
    const handleAddReservation = () => {
        dispatch(setSelectedReservation(null));
        navigate('/admin/reservations/new');
    };
    
    // Función para obtener el nombre del edificio
    const getBuildingName = (reservation) => {
        const possibleIdFields = ['building_id', 'buildingId', 'apartment_id', 'apartmentId', 'location_id', 'locationId'];
        let buildingIdValue = null;
        
        for (const field of possibleIdFields) {
            if (reservation[field] !== undefined) {
                buildingIdValue = reservation[field];
                break;
            }
        }
        
        if (buildingIdValue) {
            return buildingNames[String(buildingIdValue)] || 'N/A';
        }
        
        return 'N/A';
    };
    
    const getClientDisplay = (reservation) => {
        const name = reservation.client_name || reservation.clientName;
        const lastname = reservation.client_lastname || reservation.clientLastname;
        const email = reservation.client_email || reservation.clientEmail;
        if (name || lastname) return `${name || ''} ${lastname || ''}`.trim();
        const cid = reservation.client_id || reservation.clientId;
        const user = cid ? clientMap[cid] : null;
        if (user) return `${user.name || ''} ${user.lastname || ''}`.trim() || user.email || 'N/A';
        return 'N/A';
    };

    // Renderizar las tarjetas para la vista móvil
    const renderMobileCards = () => {
        if (loading) {
            return (
                <Grid container spacing={2}>
                    {[...Array(3)].map((_, idx) => (
                        <Grid item xs={12} key={idx}>
                            <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Skeleton variant="text" width={160} height={28} />
                                        <Stack direction="row" spacing={1}>
                                            <Skeleton variant="rounded" width={60} height={24} />
                                            <Skeleton variant="rounded" width={70} height={24} />
                                        </Stack>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Skeleton variant="text" width="50%" />
                                    <Skeleton variant="text" width="70%" />
                                    <Skeleton variant="text" width="60%" />
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                    <Skeleton variant="circular" width={32} height={32} />
                                    <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                    <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            );
        }

        if (!sortedReservations || sortedReservations.length === 0) {
            return (
                <Typography align="center" sx={{ mt: 2 }}>
                    No reservations found
                </Typography>
            );
        }

        return (
            <Grid container spacing={2}>
                {sortedReservations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((reservation) => (
                        <Grid item xs={12} key={reservation.id}>
                            <Card 
                                elevation={2} 
                                sx={{ 
                                    bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        elevation: 4,
                                        transform: 'translateY(-2px)',
                                        bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#eeeeee'
                                    }
                                }}
                                onClick={() => handleViewClick(reservation)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6">
                                            Reservation #{reservation.id}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label={reservation.status}
                                                size="small"
                                                color={getStatusColor(reservation.status)}
                                            />
                                            <Chip
                                                label={reservation.payment_status || reservation.paymentStatus}
                                                size="small"
                                                color={getPaymentStatusColor(reservation.payment_status || reservation.paymentStatus)}
                                            />
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        {getClientDisplay(reservation)}
                                                    </Typography>
                                                    {/* Email si está disponible */}
                                                    {(reservation.client_email || reservation.clientEmail || clientMap[(reservation.client_id||reservation.clientId)]?.email) && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {reservation.client_email || reservation.clientEmail || clientMap[(reservation.client_id||reservation.clientId)]?.email}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <ApartmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        {getBuildingName(reservation)}
                                                    </Typography>
                                                    {reservation.unit_number && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Unit: {reservation.unit_number}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Check-in
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(reservation.check_in_date || reservation.checkInDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Check-out
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(reservation.check_out_date || reservation.checkOutDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="subtitle1" color="primary.main">
                                                        {formatCurrency(reservation.total_amount || reservation.totalAmount)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>

                                <Divider />

                                <CardActions 
                                    sx={{ justifyContent: 'space-between', p: 2 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Created: {formatDate(reservation.created_at || reservation.createdAt)}
                                    </Typography>
                                    <Box>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleViewClick(reservation)}
                                            color="info"
                                            sx={{ mr: 1 }}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEditClick(reservation)}
                                            color="primary"
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDeleteClick(reservation)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={sortedReservations.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage={isMobile ? "Per page:" : "Rows per page:"}
                    />
                </Grid>
            </Grid>
        );
    };
    
    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ p: isMobile ? 1 : 3 }}>
            {/* Componente de filtros */}
            <ReservationFilters 
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddReservation}
                        startIcon={<AddIcon />}
                        size={isMobile ? "small" : "medium"}
                    >
                        New Reservation
                    </Button>
                </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            {isMobile || isTablet ? (
                // Vista móvil y tablet
                renderMobileCards()
            ) : (
                // Vista de escritorio
                <TableContainer component={Paper} elevation={3}>
                    <Table sx={{ minWidth: 650 }} aria-label="reservations table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'id'}
                                        direction={orderBy === 'id' ? order : 'asc'}
                                        onClick={() => handleRequestSort('id')}
                                    >
                                        ID
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Apartment</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'check_in_date'}
                                        direction={orderBy === 'check_in_date' ? order : 'asc'}
                                        onClick={() => handleRequestSort('check_in_date')}
                                    >
                                        Check-in
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'check_out_date'}
                                        direction={orderBy === 'check_out_date' ? order : 'asc'}
                                        onClick={() => handleRequestSort('check_out_date')}
                                    >
                                        Check-out
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'total_amount'}
                                        direction={orderBy === 'total_amount' ? order : 'asc'}
                                        onClick={() => handleRequestSort('total_amount')}
                                    >
                                        Total
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'status'}
                                        direction={orderBy === 'status' ? order : 'asc'}
                                        onClick={() => handleRequestSort('status')}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'payment_status'}
                                        direction={orderBy === 'payment_status' ? order : 'asc'}
                                        onClick={() => handleRequestSort('payment_status')}
                                    >
                                        Payment
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleRequestSort('created_at')}
                                    >
                                        Creation Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(6)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        {[...Array(10)].map((__, cidx) => (
                                            <TableCell key={cidx}>
                                                {cidx === 9 ? (
                                                    <>
                                                        <Skeleton variant="circular" width={28} height={28} />
                                                        <Skeleton variant="circular" width={28} height={28} sx={{ ml: 1 }} />
                                                        <Skeleton variant="circular" width={28} height={28} sx={{ ml: 1 }} />
                                                    </>
                                                ) : (
                                                    <Skeleton variant="text" width={cidx % 3 === 0 ? 80 : 140} />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : !sortedReservations || sortedReservations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">No reservations found</TableCell>
                                </TableRow>
                            ) : (
                                sortedReservations
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((reservation) => (
                                        <TableRow 
                                            key={reservation.id} 
                                            hover
                                            onClick={() => handleViewClick(reservation)}
                                            sx={{ 
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <TableCell>{reservation.id}</TableCell>
                                            <TableCell>
                                                {getClientDisplay(reservation)}
                                                {(reservation.client_email || reservation.clientEmail || clientMap[(reservation.client_id||reservation.clientId)]?.email) && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        {reservation.client_email || reservation.clientEmail || clientMap[(reservation.client_id||reservation.clientId)]?.email}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getBuildingName(reservation)}
                                                {reservation.unit_number && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        Unit: {reservation.unit_number}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(reservation.check_in_date || reservation.checkInDate)}</TableCell>
                                            <TableCell>{formatDate(reservation.check_out_date || reservation.checkOutDate)}</TableCell>
                                            <TableCell>{formatCurrency(reservation.total_amount || reservation.totalAmount)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={reservation.status}
                                                    size="small"
                                                    color={getStatusColor(reservation.status)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={reservation.payment_status || reservation.paymentStatus}
                                                    size="small"
                                                    color={getPaymentStatusColor(reservation.payment_status || reservation.paymentStatus)}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(reservation.created_at || reservation.createdAt)}</TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <Tooltip title="View details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleViewClick(reservation)}
                                                        color="info"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEditClick(reservation)}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDeleteClick(reservation)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={sortedReservations ? sortedReservations.length : 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Rows per page:"
                    />
                </TableContainer>
            )}

            {/* Dialog de confirmación para eliminar */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle 
                    id="delete-dialog-title"
                    sx={{ 
                        color: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <DeleteIcon />
                    Delete Reservation
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete <strong>{deleteDialog.reservationName}</strong>?
                        <br /><br />
                        This action cannot be undone and will permanently remove all reservation data.
                        {deleteDialog.hasWarning && (
                            <>
                                <br />
                                <Box 
                                    component="span" 
                                    sx={{ 
                                        color: 'black', 
                                        fontWeight: 'medium',
                                        display: 'block',
                                        mt: 2,
                                        p: 1,
                                        bgcolor: 'warning.light',
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'warning.main'
                                    }}
                                >
                                    ⚠️ This reservation has registered payments and may not be deletable.
                                </Box>
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={handleCancelDelete}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete Reservation
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast de notificaciones */}
            <Snackbar
                open={toast.open}
                autoHideDuration={toast.severity === 'warning' ? 8000 : 4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ maxWidth: '600px' }}
            >
                <Alert 
                    onClose={handleCloseToast} 
                    severity={toast.severity}
                    variant="filled"
                    sx={{ 
                        width: '100%',
                        '& .MuiAlert-message': {
                            whiteSpace: 'pre-line',
                            fontSize: '0.9rem',
                            lineHeight: 1.4
                        }
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReservationList;
