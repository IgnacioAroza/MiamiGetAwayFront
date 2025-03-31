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
    TextField,
    InputAdornment,
    Button,
    Grid,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { fetchReservations, deleteReservation, setSelectedReservation } from '../../../redux/reservationSlice';
import adminApartmentService from '../../../services/adminApartmentService';

const ReservationList = ({ filter = {} }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { reservations, loading, status, error } = useSelector((state) => state.reservations);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [buildingNames, setBuildingNames] = useState({});
    const [adminApartments, setAdminApartments] = useState([]);
    
    // Cargar reservas al montar el componente o cuando cambia el filtro
    useEffect(() => {
        dispatch(fetchReservations(filter));
    }, [dispatch, JSON.stringify(filter)]);
    
    // Cargar todos los apartamentos al montar el componente
    useEffect(() => {
        const loadApartments = async () => {
            try {
                const apartmentList = await adminApartmentService.getAllApartments();
                setAdminApartments(apartmentList);
                
                // Crear un mapeo de IDs a nombres de edificios
                const namesMap = {};
                apartmentList.forEach(apt => {
                    // Asegurar que el ID se maneja como string
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
    
    // Extraer IDs de edificios únicos de las reservas
    const buildingIds = useMemo(() => {
        if (!reservations || reservations.length === 0) return [];
        return [...new Set(reservations
            .filter(r => r.building_id)
            .map(r => r.building_id)
        )];
    }, [reservations]);
    
    // Filtrar reservas cuando cambia el término de búsqueda o las reservas
    useEffect(() => {
        if (reservations) {
            const filtered = reservations.filter(reservation => {
                // Primero aplicar filtros específicos
                const matchesFilter = Object.entries(filter).every(([key, value]) => {
                    // Si el filtro tiene un valor, verificar que coincida
                    return !value || reservation[key] === value;
                });
                
                // Luego aplicar el filtro de búsqueda
                if (!matchesFilter) return false;
                
                if (!searchTerm) return true;
                
                const searchString = searchTerm.toLowerCase();
                
                // Posibles campos para ID de edificio
                const possibleIdFields = ['building_id', 'buildingId', 'apartment_id', 'apartmentId', 'location_id', 'locationId'];
                let buildingIdValue = null;
                
                for (const field of possibleIdFields) {
                    if (reservation[field] !== undefined) {
                        buildingIdValue = reservation[field];
                        break;
                    }
                }
                
                // Buscar en la información del cliente
                const matchesClientInfo = 
                    (reservation.client_name && reservation.client_name.toLowerCase().includes(searchString)) ||
                    (reservation.client_email && reservation.client_email.toLowerCase().includes(searchString)) ||
                    (reservation.id && reservation.id.toString().includes(searchString));
                
                // Buscar en la información del edificio si tenemos un ID de edificio
                const matchesBuildingInfo = buildingIdValue && 
                    buildingNames[String(buildingIdValue)] && 
                    buildingNames[String(buildingIdValue)].toLowerCase().includes(searchString);
                
                return matchesClientInfo || matchesBuildingInfo;
            });
            setFilteredReservations(filtered);
        }
    }, [searchTerm, reservations, filter, buildingNames]);
    
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
    
    // Manejar cambio en búsqueda
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reiniciar a la primera página cuando se realiza una búsqueda
    };
    
    // Agregar nueva reserva
    const handleAddReservation = () => {
        dispatch(setSelectedReservation(null));
        navigate('/admin/reservations/new');
    };
    
    // Función para obtener el nombre del edificio a partir del ID
    const getBuildingName = (reservation) => {
        // Buscar el campo que podría contener el ID del edificio
        const possibleIdFields = ['building_id', 'buildingId', 'apartment_id', 'apartmentId', 'location_id', 'locationId'];
        let buildingIdValue = null;
        
        for (const field of possibleIdFields) {
            if (reservation[field] !== undefined) {
                buildingIdValue = reservation[field];
                break;
            }
        }
        
        // Si encontramos un ID de edificio, intentar obtener el nombre
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
                Historial de Reservas
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Buscar por nombre, email, edificio o ID..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddReservation}
                    >
                        Nueva Reserva
                    </Button>
                </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla de reservas">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Apartamento</TableCell>
                            <TableCell>Check-in</TableCell>
                            <TableCell>Check-out</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Pago</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">Cargando...</TableCell>
                            </TableRow>
                        ) : filteredReservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No se encontraron reservas</TableCell>
                            </TableRow>
                        ) : (
                            filteredReservations
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
                                        <TableCell>{formatDate(reservation.check_in_date)}</TableCell>
                                        <TableCell>{formatDate(reservation.check_out_date)}</TableCell>
                                        <TableCell>{formatCurrency(reservation.total_amount)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reservation.status}
                                                size="small"
                                                color={getStatusColor(reservation.status)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reservation.payment_status}
                                                size="small"
                                                color={getPaymentStatusColor(reservation.payment_status)}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Ver detalles">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleViewClick(reservation)}
                                                    color="info"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEditClick(reservation)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
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
                    count={filteredReservations.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </TableContainer>
        </Box>
    );
};

export default ReservationList;