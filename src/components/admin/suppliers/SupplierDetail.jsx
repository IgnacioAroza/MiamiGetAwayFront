import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert, Box, Button, Chip, CircularProgress, Divider,
    IconButton, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ImageIcon from '@mui/icons-material/Image';
import { fetchAllSuppliers, selectAllSuppliers, selectSuppliersStatus } from '../../../redux/supplierSlice';
import supplierService from '../../../services/supplierService';
import ReceiptLightbox from '../../common/ReceiptLightbox';
import { formatDateForDisplay } from '../../../utils/dateUtils';

const METHOD_LABELS = {
    cash: 'Cash', card: 'Card', transfer: 'Transfer',
    paypal: 'PayPal', zelle: 'Zelle', stripe: 'Stripe', other: 'Other',
};

const USD = (n) => `$${Number(n ?? 0).toFixed(2)}`;

const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const SummaryCard = ({ label, value, color = '#fff' }) => (
    <Box sx={{
        flex: 1, bgcolor: '#2a2a2a', border: '1px solid #333',
        borderRadius: 1, p: 2, minWidth: 140,
    }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#666', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color }}>
            {value}
        </Typography>
    </Box>
);

const SupplierDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const suppliers = useSelector(selectAllSuppliers);
    const suppliersStatus = useSelector(selectSuppliersStatus);
    const supplier = suppliers.find(s => String(s.id) === String(id)) || null;

    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', reservationId: '' });
    const [activeFilters, setActiveFilters] = useState({});
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    // Cargar suppliers en Redux si no están
    useEffect(() => {
        if (suppliersStatus === 'idle') dispatch(fetchAllSuppliers());
    }, [dispatch, suppliersStatus]);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await supplierService.getAllSupplierPayments({
                supplierId: id,
                ...activeFilters,
                page: page + 1,
                limit: rowsPerPage,
            });
            setPayments(result.data);
            setPagination(result.pagination);
            setSummary(result.summary);
        } catch (e) {
            setError(typeof e === 'string' ? e : 'Error loading payments');
        } finally {
            setLoading(false);
        }
    }, [id, activeFilters, page, rowsPerPage]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleApplyFilters = () => {
        const active = {};
        if (filters.startDate) active.startDate = filters.startDate;
        if (filters.endDate) active.endDate = filters.endDate;
        if (filters.reservationId) active.reservationId = filters.reservationId;
        setActiveFilters(active);
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({ startDate: '', endDate: '', reservationId: '' });
        setActiveFilters({});
        setPage(0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try { return formatDateForDisplay(dateStr, false); } catch { return dateStr; }
    };

    const balanceColor = (val) => {
        if (val > 0) return '#f44336';
        if (val < 0) return '#ff9800';
        return '#4caf50';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/suppliers')} sx={{ color: '#aaa' }}>
                    <ArrowBackIcon />
                </IconButton>

                {supplier ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 44, height: 44, borderRadius: 1, bgcolor: '#6c5dd3',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.95rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                            {initials(supplier.name)}
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                                {supplier.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                {supplier.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 14, color: '#777' }} />
                                        <Typography variant="body2" sx={{ color: '#888' }}>{supplier.email}</Typography>
                                    </Box>
                                )}
                                {supplier.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PhoneIcon sx={{ fontSize: 14, color: '#777' }} />
                                        <Typography variant="body2" sx={{ color: '#888' }}>{supplier.phone}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="h5" sx={{ color: '#fff' }}>Supplier #{id}</Typography>
                )}
            </Box>

            {/* Summary */}
            {summary && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <SummaryCard label="Total Paid" value={USD(summary.totalPaid)} color="#4caf50" />
                    <SummaryCard label="Total Owed" value={USD(summary.totalOwed)} color="#ff9800" />
                    <SummaryCard
                        label="Balance"
                        value={USD(Math.abs(summary.balance))}
                        color={balanceColor(summary.balance)}
                    />
                    {summary.balance !== 0 && (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.78rem' }}>
                                {summary.balance > 0 ? '⚠ Pending debt' : '⚠ Overpaid'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#2d2d2d', border: '1px solid #333' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <TextField
                        label="From"
                        type="date"
                        size="small"
                        value={filters.startDate}
                        onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160, '& .MuiOutlinedInput-input': { color: '#fff', colorScheme: 'dark' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' } }}
                    />
                    <TextField
                        label="To"
                        type="date"
                        size="small"
                        value={filters.endDate}
                        onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160, '& .MuiOutlinedInput-input': { color: '#fff', colorScheme: 'dark' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' } }}
                    />
                    <TextField
                        label="Reservation ID"
                        size="small"
                        type="number"
                        value={filters.reservationId}
                        onChange={e => setFilters(f => ({ ...f, reservationId: e.target.value }))}
                        sx={{ minWidth: 140, '& .MuiOutlinedInput-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' } }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        size="small"
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' }, textTransform: 'none', height: 40 }}
                    >
                        Apply
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        size="small"
                        sx={{ borderColor: '#444', color: '#aaa', textTransform: 'none', height: 40 }}
                    >
                        Clear
                    </Button>
                </Box>
            </Paper>

            {/* Tabla */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                        <TableRow sx={{ '& th': { color: '#aaa', fontWeight: 600, borderColor: '#333' } }}>
                            <TableCell>Reservation</TableCell>
                            <TableCell>Apartment</TableCell>
                            <TableCell>Period</TableCell>
                            <TableCell align="center">Nights</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Reference</TableCell>
                            <TableCell align="center">Receipts</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} sx={{ color: '#6c5dd3' }} />
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#555' }}>
                                    No payments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map(p => (
                                <TableRow
                                    key={p.id}
                                    sx={{ '& td': { borderColor: '#2a2a2a', color: '#ddd' }, '&:hover': { bgcolor: '#2a2a2a' } }}
                                >
                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            href={`/admin/reservations/${p.reservationId}`}
                                            sx={{ textTransform: 'none', minWidth: 'auto', px: 1, borderColor: '#444', color: '#9b8fef' }}
                                        >
                                            #{p.reservationId}
                                        </Button>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 180 }}>
                                        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.apartmentName || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                        {formatDate(p.checkInDate)} → {formatDate(p.checkOutDate)}
                                    </TableCell>
                                    <TableCell align="center">{p.nights || '—'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                        {USD(p.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={METHOD_LABELS[p.method] || p.method}
                                            size="small"
                                            sx={{ bgcolor: '#252535', color: '#ccc', fontSize: '0.72rem' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                        {p.date || '—'}
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 160 }}>
                                        <Typography variant="body2" sx={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.referenceNotes || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {p.receiptImages && p.receiptImages.length > 0 ? (
                                            <Tooltip title={`${p.receiptImages.length} receipt${p.receiptImages.length > 1 ? 's' : ''}`}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setLightbox({ open: true, images: p.receiptImages, index: 0 })}
                                                    sx={{ color: '#90caf9', p: 0.5 }}
                                                >
                                                    <ImageIcon sx={{ fontSize: '1.2rem' }} />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Typography sx={{ color: '#444', fontSize: '0.75rem' }}>—</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination?.total ?? payments.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="Rows per page:"
                />
            </TableContainer>

            <ReceiptLightbox
                open={lightbox.open}
                onClose={() => setLightbox(prev => ({ ...prev, open: false }))}
                images={lightbox.images}
                initialIndex={lightbox.index}
            />
        </Box>
    );
};

export default SupplierDetail;
