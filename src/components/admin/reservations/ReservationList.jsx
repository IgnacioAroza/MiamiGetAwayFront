import React, { useState, useEffect } from 'react';
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
    useTheme
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
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [buildingNames, setBuildingNames] = useState({});
    const [adminApartments, setAdminApartments] = useState([]);
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');
    const [activeFilters, setActiveFilters] = useState({});
    
    // Función para ordenar las reservas localmente
    const sortReservations = (reservations, orderBy, order) => {
        return [...reservations].sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            // Si es una fecha, convertir a timestamp
            if (orderBy === 'created_at' || orderBy === 'check_in_date' || orderBy === 'check_out_date') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            // Si es un número, convertir a número
            if (orderBy === 'total_amount' || orderBy === 'id') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };
    
    // Cargar reservas al montar el componente o cuando cambian los filtros
    useEffect(() => {
        const combinedFilters = { 
            ...filter, 
            ...activeFilters
        };
        dispatch(fetchReservations(combinedFilters));
    }, [dispatch, filter, activeFilters]);
    
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
    
    // Obtener las reservas ordenadas
    const sortedReservations = sortReservations(reservations, orderBy, order);
    
    // Función para cambiar la ordenación
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0); // Resetear la página cuando cambia la ordenación
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
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            dispatch(deleteReservation(id));
        }
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
                            <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
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
                                                        {reservation.client_name || 'N/A'} {reservation.client_lastname || ''}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {reservation.client_email}
                                                    </Typography>
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

                                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
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
                                            onClick={() => handleDeleteClick(reservation.id)}
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
            <Typography variant="h5" gutterBottom component="div" sx={{ mb: 3 }}>
                Reservation History
            </Typography>
            
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
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
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
                                        <TableRow key={reservation.id} hover>
                                            <TableCell>{reservation.id}</TableCell>
                                            <TableCell>
                                                {reservation.client_name || 'N/A'} {reservation.client_lastname || ''}
                                                <Typography variant="body2" color="textSecondary">
                                                    {reservation.client_email}
                                                </Typography>
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
                                            <TableCell align="right">
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
                                                        onClick={() => handleDeleteClick(reservation.id)}
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
        </Box>
    );
};

export default ReservationList;
