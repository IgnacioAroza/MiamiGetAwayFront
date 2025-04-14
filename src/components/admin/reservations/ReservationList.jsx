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
    TableSortLabel
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { fetchReservations, deleteReservation, setSelectedReservation } from '../../../redux/reservationSlice';
import adminApartmentService from '../../../services/adminApartmentService';
import ReservationFilters from './ReservationFilters';

const ReservationList = ({ filter = {} }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { reservations, loading, status, error } = useSelector((state) => state.reservations);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [buildingNames, setBuildingNames] = useState({});
    const [adminApartments, setAdminApartments] = useState([]);
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');
    const [activeFilters, setActiveFilters] = useState({});
    
    // Cargar reservas al montar el componente o cuando cambian los filtros
    useEffect(() => {
        const combinedFilters = { 
            ...filter, 
            ...activeFilters,
            orderBy,
            order
        };
        dispatch(fetchReservations(combinedFilters));
    }, [dispatch, filter, activeFilters, orderBy, order]);
    
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
    
    // Función para cambiar la ordenación
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
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
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
            'ON_RENT': 'success',
            'BOOKED': 'primary',
            'PENDING': 'warning',
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
        if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
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
        <Box sx={{ p: 3 }}>
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
                    >
                        New Reservation
                    </Button>
                </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla de reservas">
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
                            <TableRow>
                                <TableCell colSpan={10} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : !reservations || reservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">No reservations found</TableCell>
                            </TableRow>
                        ) : (
                            reservations
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
                                                    Unidad: {reservation.unit_number}
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
                    count={reservations ? reservations.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows per page:"
                />
            </TableContainer>
        </Box>
    );
};

export default ReservationList;