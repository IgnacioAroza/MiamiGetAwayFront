import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, FormControl, Grid,
    IconButton, InputAdornment, MenuItem, Select, TextField,
    Tooltip, Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    AttachFile as AttachFileIcon,
    CameraAlt as CameraIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import supplierService from '../../../services/supplierService';
import { createSupplier, fetchAllSuppliers, selectAllSuppliers } from '../../../redux/supplierSlice';
import { useToast } from '../../../hooks/useToast';
import ToastNotification from '../../common/ToastNotification';
import ReceiptLightbox from '../../common/ReceiptLightbox';

// ─── constants ────────────────────────────────────────────────────────────────
const PAYMENT_TERMS_OPTIONS = [
    'Within 24h after check-out',
    'Within 48h after check-out',
    'Within 72h after check-out',
    'Within 1 week after check-out',
    'Upon check-in',
];
const PAYMENT_METHODS = ['wire', 'cash', 'card', 'transfer'];

// ─── shared sx helpers ────────────────────────────────────────────────────────
const sectionLabel = {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
    color: '#777', textTransform: 'uppercase', mb: 1,
};
const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#252525',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#7c5cbf' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiOutlinedInput-input': { color: '#fff' },
    '& .MuiInputAdornment-root': { color: '#666' },
    '& .MuiSelect-select': { color: '#fff' },
};
const selectSx = {
    bgcolor: '#252525', color: '#fff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a3a3a' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c5cbf' },
    '& .MuiSvgIcon-root': { color: '#666' },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`;
const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
const formatPaymentDate = (dateStr) => {
    if (!dateStr) return '';
    try { return format(new Date(dateStr + 'T12:00:00'), 'MMM dd, yyyy'); }
    catch { return dateStr; }
};

// ─── SupplierInfoCard ─────────────────────────────────────────────────────────
const SupplierInfoCard = ({ supplier }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        p: 1.5, mb: 2, bgcolor: '#252525',
        borderRadius: 1, border: '1px solid #333',
    }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: 1, bgcolor: '#6c5dd3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, color: '#fff',
        }}>
            {initials(supplier.name)}
        </Box>
        <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>
                {supplier.name}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#777', lineHeight: 1.3 }}>
                {[supplier.email, supplier.phone].filter(Boolean).join(' · ')}
            </Typography>
        </Box>
    </Box>
);

// ─── main component ───────────────────────────────────────────────────────────
const SupplierPayoutSection = ({ reservationId, nights = 0 }) => {
    const dispatch = useDispatch();
    const suppliers = useSelector(selectAllSuppliers);
    const { toast, success, error, hideToast } = useToast();

    // data
    const [assignment, setAssignment] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // assign form
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [payoutPerNight, setPayoutPerNight] = useState('');
    const [cleaningFee, setCleaningFee] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('Within 48h after check-out');
    const [assigning, setAssigning] = useState(false);

    // edit terms
    const [editingTerms, setEditingTerms] = useState(false);
    const [editPayout, setEditPayout] = useState('');
    const [editCleaningFee, setEditCleaningFee] = useState('');
    const [editTerms, setEditTerms] = useState('');
    const [savingTerms, setSavingTerms] = useState(false);

    // new supplier dialog
    const [newSupplierOpen, setNewSupplierOpen] = useState(false);
    const [newSupplierForm, setNewSupplierForm] = useState({ name: '', company: '', email: '', phone: '' });
    const [creatingSupplier, setCreatingSupplier] = useState(false);

    // payment form
    const [paymentForm, setPaymentForm] = useState({
        amount: '', method: 'wire',
        date: format(new Date(), 'yyyy-MM-dd'), reference_notes: '',
    });
    const [receiptFiles, setReceiptFiles] = useState([]);
    const [registeringPayment, setRegisteringPayment] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [deletingPaymentId, setDeletingPaymentId] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // lightbox
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
    const openLightbox = (images, index = 0) => setLightbox({ open: true, images, index });
    const closeLightbox = () => setLightbox(prev => ({ ...prev, open: false }));

    // ── load ───────────────────────────────────────────────────────────────────
    useEffect(() => { dispatch(fetchAllSuppliers()); }, [dispatch]);

    useEffect(() => {
        if (!reservationId) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const [a, p] = await Promise.all([
                    supplierService.getReservationSupplier(reservationId),
                    supplierService.getSupplierPayments(reservationId),
                ]);
                if (!cancelled) { setAssignment(a); setPayments(p); }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [reservationId]);

    // ── derived ────────────────────────────────────────────────────────────────
    const activeSupplier = assignment
        ? assignment.supplier
        : suppliers.find(s => s.id === Number(selectedSupplierId)) || null;

    // ── handlers: assign ───────────────────────────────────────────────────────
    const handleAssign = async () => {
        if (!selectedSupplierId || !payoutPerNight) return;
        setAssigning(true);
        try {
            const data = await supplierService.assignSupplier(reservationId, {
                supplier_id: Number(selectedSupplierId),
                payout_per_night: Number(payoutPerNight),
                cleaning_fee: cleaningFee ? Number(cleaningFee) : 0,
                payment_terms: paymentTerms || undefined,
            });
            setAssignment(data);
            success('Supplier assigned');
        } catch (e) {
            error(typeof e === 'string' ? e : 'Error assigning supplier');
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassign = async () => {
        try {
            await supplierService.unassignSupplier(reservationId);
            setAssignment(null);
            setPayments([]);
            setSelectedSupplierId('');
            setPayoutPerNight('');
            setCleaningFee('');
            success('Supplier unassigned');
        } catch (e) {
            error(typeof e === 'string' ? e : 'Error unassigning supplier');
        }
    };

    // ── handlers: edit terms ───────────────────────────────────────────────────
    const handleStartEditTerms = () => {
        setEditPayout(String(assignment.payout_per_night));
        setEditCleaningFee(String(assignment.cleaning_fee ?? 0));
        setEditTerms(assignment.payment_terms || '');
        setEditingTerms(true);
    };

    const handleSaveTerms = async () => {
        setSavingTerms(true);
        try {
            const data = await supplierService.updateSupplierTerms(reservationId, {
                payout_per_night: Number(editPayout),
                cleaning_fee: editCleaningFee ? Number(editCleaningFee) : 0,
                payment_terms: editTerms,
            });
            setAssignment(data);
            setEditingTerms(false);
            success('Terms updated');
        } catch (e) {
            error(typeof e === 'string' ? e : 'Error updating terms');
        } finally {
            setSavingTerms(false);
        }
    };

    // ── handlers: new supplier ─────────────────────────────────────────────────
    const handleCreateSupplier = async () => {
        if (!newSupplierForm.name.trim()) return;
        setCreatingSupplier(true);
        try {
            const result = await dispatch(createSupplier(newSupplierForm)).unwrap();
            setSelectedSupplierId(String(result.id));
            setNewSupplierOpen(false);
            setNewSupplierForm({ name: '', company: '', email: '', phone: '' });
            success('Supplier created');
        } catch {
            error('Error creating supplier');
        } finally {
            setCreatingSupplier(false);
        }
    };

    // ── handlers: files ────────────────────────────────────────────────────────
    const addFiles = (files) => {
        const valid = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
        setReceiptFiles(prev => [...prev, ...valid].slice(0, 10));
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        addFiles(e.dataTransfer.files);
    }, []);

    // ── handlers: payment ──────────────────────────────────────────────────────
    const handleRegisterPayment = async () => {
        if (!paymentForm.amount || !paymentForm.date) return;
        setRegisteringPayment(true);
        try {
            const newPayment = await supplierService.createSupplierPayment(
                reservationId, paymentForm, receiptFiles,
            );
            setPayments(prev => [...prev, newPayment]);
            const updated = await supplierService.getReservationSupplier(reservationId);
            setAssignment(updated);
            setPaymentForm({ amount: '', method: 'wire', date: format(new Date(), 'yyyy-MM-dd'), reference_notes: '' });
            setReceiptFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            success('Payment registered');
        } catch (e) {
            error(typeof e === 'string' ? e : 'Error registering payment');
        } finally {
            setRegisteringPayment(false);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        setDeletingPaymentId(paymentId);
        try {
            await supplierService.deleteSupplierPayment(paymentId);
            setPayments(prev => prev.filter(p => p.id !== paymentId));
            const updated = await supplierService.getReservationSupplier(reservationId);
            setAssignment(updated);
        } catch (e) {
            error(typeof e === 'string' ? e : 'Error deleting payment');
        } finally {
            setDeletingPaymentId(null);
        }
    };

    // ── render ─────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#7c5cbf' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ color: '#fff' }}>

            {/* ── SUPPLIER ──────────────────────────────────────────────────── */}
            <Typography sx={sectionLabel}>Supplier</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: activeSupplier ? 1.5 : 2 }}>
                <FormControl fullWidth size="small">
                    <Select
                        value={assignment ? String(assignment.supplier.id) : selectedSupplierId}
                        onChange={(e) => { if (!assignment) setSelectedSupplierId(e.target.value); }}
                        displayEmpty
                        disabled={!!assignment}
                        sx={selectSx}
                    >
                        <MenuItem value="" disabled>
                            <em style={{ color: '#555' }}>Select Supplier</em>
                        </MenuItem>
                        {suppliers.map(s => (
                            <MenuItem key={s.id} value={String(s.id)}>
                                {s.name}{s.company ? ` — ${s.company}` : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {!assignment && (
                    <Button
                        variant="outlined" size="small" startIcon={<AddIcon />}
                        onClick={() => setNewSupplierOpen(true)}
                        sx={{ whiteSpace: 'nowrap', minWidth: 84, borderColor: '#444', color: '#ccc', textTransform: 'none', '&:hover': { borderColor: '#9b8fef', color: '#9b8fef' } }}
                    >
                        NEW
                    </Button>
                )}

                {assignment && (
                    <Button
                        size="small"
                        onClick={handleUnassign}
                        sx={{ whiteSpace: 'nowrap', minWidth: 84, color: '#888', borderColor: '#444', textTransform: 'none', '&:hover': { color: '#f44336', borderColor: '#f44336' } }}
                        variant="outlined"
                    >
                        Unassign
                    </Button>
                )}
            </Box>

            {activeSupplier && <SupplierInfoCard supplier={activeSupplier} />}

            {/* ── PAYOUT TERMS ──────────────────────────────────────────────── */}
            {activeSupplier && (
                <>
                    <Typography sx={sectionLabel}>Payout Terms</Typography>

                    {/* View mode */}
                    {assignment && !editingTerms && (
                        <>
                            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                                <Grid item xs={4}>
                                    <Box sx={{ bgcolor: '#252525', border: '1px solid #2e2e2e', borderRadius: 1, p: 1.5 }}>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#555', mb: 0.3 }}>Payout / Night</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            ${Number(assignment.payout_per_night).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ bgcolor: '#252525', border: '1px solid #2e2e2e', borderRadius: 1, p: 1.5 }}>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#555', mb: 0.3 }}>Cleaning Fee</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            ${Number(assignment.cleaning_fee ?? 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ bgcolor: '#252525', border: '1px solid #2e2e2e', borderRadius: 1, p: 1.5 }}>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#555', mb: 0.3 }}>Payment Terms</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', lineHeight: 1.3 }}>
                                            {assignment.payment_terms || '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Stats */}
                            <Grid container spacing={1} sx={{ mb: 1.5 }}>
                                <Grid item xs={3}>
                                    <Box sx={{ bgcolor: '#1e1e1e', border: '1px solid #272727', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#555', mb: 0.2 }}>TOTAL</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            {formatCurrency(assignment.calculated?.total)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ bgcolor: '#1e1e1e', border: '1px solid #272727', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#555', mb: 0.2 }}>PAID</Typography>
                                        <Typography sx={{ fontWeight: 700, color: '#4caf50' }}>
                                            {formatCurrency(assignment.calculated?.paid)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ bgcolor: '#1e1e1e', border: '1px solid #272727', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#555', mb: 0.2 }}>BALANCE</Typography>
                                        <Typography sx={{ fontWeight: 700, color: Number(assignment.calculated?.balance) > 0 ? '#f87171' : '#4caf50' }}>
                                            {formatCurrency(assignment.calculated?.balance)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ bgcolor: '#1e1e1e', border: '1px solid #272727', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#555', mb: 0.2 }}>PROFIT</Typography>
                                        <Typography sx={{ fontWeight: 700, color: Number(assignment.calculated?.profit) >= 0 ? '#4caf50' : '#f87171' }}>
                                            {formatCurrency(assignment.calculated?.profit)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Button
                                size="small" startIcon={<EditIcon sx={{ fontSize: '0.85rem' }} />}
                                onClick={handleStartEditTerms}
                                sx={{ color: '#666', mb: 2, textTransform: 'none', fontSize: '0.78rem', p: 0, '&:hover': { color: '#9b8fef', bgcolor: 'transparent' } }}
                            >
                                Edit terms
                            </Button>
                        </>
                    )}

                    {/* Edit terms mode */}
                    {assignment && editingTerms && (
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                                <TextField
                                    label="Payout per Night" size="small" fullWidth type="number"
                                    value={editPayout} onChange={e => setEditPayout(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    sx={fieldSx}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Cleaning Fee" size="small" fullWidth type="number"
                                    value={editCleaningFee} onChange={e => setEditCleaningFee(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    sx={fieldSx}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth size="small">
                                    <Select value={editTerms} onChange={e => setEditTerms(e.target.value)} sx={selectSx}>
                                        {PAYMENT_TERMS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small" variant="contained" onClick={handleSaveTerms} disabled={savingTerms}
                                    sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' }, textTransform: 'none' }}
                                >
                                    {savingTerms ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Save'}
                                </Button>
                                <Button size="small" onClick={() => setEditingTerms(false)} sx={{ color: '#666', textTransform: 'none' }}>
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    )}

                    {/* Assign form (no assignment yet) */}
                    {!assignment && (
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                                <TextField
                                    label="Payout per Night" size="small" fullWidth type="number"
                                    value={payoutPerNight} onChange={e => setPayoutPerNight(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    sx={fieldSx}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Cleaning Fee" size="small" fullWidth type="number"
                                    value={cleaningFee} onChange={e => setCleaningFee(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    sx={fieldSx}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth size="small">
                                    <Select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} sx={selectSx}>
                                        {PAYMENT_TERMS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth variant="contained" onClick={handleAssign}
                                    disabled={assigning || !payoutPerNight}
                                    sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' }, '&:disabled': { bgcolor: '#2a2a2a', color: '#555' }, textTransform: 'none' }}
                                >
                                    {assigning ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Assign Supplier'}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </>
            )}

            {/* ── PAYMENT HISTORY ───────────────────────────────────────────── */}
            {assignment && (
                <>
                    <Divider sx={{ borderColor: '#272727', mb: 2 }} />
                    <Typography sx={sectionLabel}>Payment History</Typography>

                    {payments.length === 0 ? (
                        <Typography sx={{ color: '#444', fontSize: '0.82rem', mb: 2, textAlign: 'center', py: 1 }}>
                            No payments recorded
                        </Typography>
                    ) : (
                        <Box sx={{ mb: 2 }}>
                            {payments.map(p => (
                                <Box key={p.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1, borderBottom: '1px solid #222' }}>
                                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1rem', mt: 0.35, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                            {p.method.charAt(0).toUpperCase() + p.method.slice(1)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#555' }}>
                                            {formatPaymentDate(p.date)}{p.referenceNotes ? ` · ${p.referenceNotes}` : ''}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 600, color: '#4caf50', fontSize: '0.9rem', flexShrink: 0 }}>
                                        {formatCurrency(p.amount)}
                                    </Typography>
                                    {p.receiptImages && p.receiptImages.length > 0 && (
                                        <Tooltip title={`${p.receiptImages.length} receipt${p.receiptImages.length > 1 ? 's' : ''}`}>
                                            <IconButton
                                                size="small"
                                                onClick={() => openLightbox(p.receiptImages, 0)}
                                                sx={{ color: '#90caf9', p: 0.3, flexShrink: 0 }}
                                            >
                                                <ImageIcon sx={{ fontSize: '1.3rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <IconButton
                                        size="small" onClick={() => handleDeletePayment(p.id)}
                                        disabled={deletingPaymentId === p.id}
                                        sx={{ color: '#444', '&:hover': { color: '#f44' }, p: 0.3, flexShrink: 0 }}
                                    >
                                        {deletingPaymentId === p.id
                                            ? <CircularProgress size={12} />
                                            : <CloseIcon sx={{ fontSize: '0.9rem' }} />}
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* ── REGISTER NEW PAYMENT ──────────────────────────────── */}
                    <Divider sx={{ borderColor: '#272727', mb: 2 }} />
                    <Typography sx={sectionLabel}>Register New Payment</Typography>

                    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                        <Grid item xs={4}>
                            <TextField
                                label="Amount" size="small" fullWidth type="number"
                                value={paymentForm.amount}
                                onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={paymentForm.method}
                                    onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                                    sx={selectSx}
                                >
                                    {PAYMENT_METHODS.map(m => (
                                        <MenuItem key={m} value={m}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="date" size="small" fullWidth
                                value={paymentForm.date}
                                onChange={e => setPaymentForm(p => ({ ...p, date: e.target.value }))}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Reference / Notes" size="small" fullWidth multiline rows={3}
                                value={paymentForm.reference_notes}
                                onChange={e => setPaymentForm(p => ({ ...p, reference_notes: e.target.value }))}
                                sx={fieldSx}
                            />
                        </Grid>
                    </Grid>

                    {/* Receipts */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.82rem', color: '#aaa' }}>Receipts</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <input
                                    ref={fileInputRef} type="file"
                                    accept="image/*,application/pdf" multiple
                                    style={{ display: 'none' }}
                                    onChange={e => addFiles(e.target.files)}
                                />
                                <input
                                    ref={cameraInputRef} type="file"
                                    accept="image/*" capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={e => addFiles(e.target.files)}
                                />
                                <Button
                                    size="small" variant="outlined" startIcon={<AttachFileIcon sx={{ fontSize: '0.85rem' }} />}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ borderColor: '#3a3a3a', color: '#aaa', textTransform: 'none', fontSize: '0.75rem', px: 1.2, '&:hover': { borderColor: '#9b8fef', color: '#9b8fef' } }}
                                >
                                    Attach
                                </Button>
                                <Button
                                    size="small" variant="outlined" startIcon={<CameraIcon sx={{ fontSize: '0.85rem' }} />}
                                    onClick={() => cameraInputRef.current?.click()}
                                    sx={{ borderColor: '#3a3a3a', color: '#aaa', textTransform: 'none', fontSize: '0.75rem', px: 1.2, '&:hover': { borderColor: '#9b8fef', color: '#9b8fef' } }}
                                >
                                    Camera
                                </Button>
                            </Box>
                        </Box>

                        <Box
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onClick={() => receiptFiles.length === 0 && fileInputRef.current?.click()}
                            sx={{
                                border: `1px dashed ${isDragOver ? '#9b8fef' : '#333'}`,
                                borderRadius: 1, p: 2, textAlign: 'center',
                                bgcolor: isDragOver ? '#1e1a35' : '#1a1a1a',
                                transition: 'all 0.15s', minHeight: 80,
                                cursor: receiptFiles.length === 0 ? 'pointer' : 'default',
                            }}
                        >
                            {receiptFiles.length === 0 ? (
                                <>
                                    <ImageIcon sx={{ color: '#333', fontSize: '1.8rem', mb: 0.5 }} />
                                    <Typography sx={{ fontSize: '0.8rem', color: '#444' }}>
                                        Drop receipt images here or{' '}
                                        <Box component="span" sx={{ color: '#7c5cbf', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                            browse
                                        </Box>
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.68rem', color: '#333', mt: 0.3 }}>
                                        PNG · JPG · PDF up to 10MB
                                    </Typography>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                    {receiptFiles.map((f, i) => (
                                        <Chip
                                            key={i} label={f.name} size="small"
                                            onDelete={() => setReceiptFiles(prev => prev.filter((_, j) => j !== i))}
                                            sx={{ bgcolor: '#252535', color: '#ccc', fontSize: '0.7rem', '& .MuiChip-deleteIcon': { color: '#777' } }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Button
                        fullWidth variant="contained"
                        onClick={handleRegisterPayment}
                        disabled={registeringPayment || !paymentForm.amount || !paymentForm.date}
                        startIcon={registeringPayment
                            ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                            : <AddIcon />}
                        sx={{
                            bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' },
                            '&:disabled': { bgcolor: '#222', color: '#444' },
                            textTransform: 'none', py: 1.2, fontWeight: 600,
                        }}
                    >
                        {registeringPayment ? 'Registering...' : '+ Register Payout'}
                    </Button>
                </>
            )}

            {/* ── NEW SUPPLIER DIALOG ───────────────────────────────────────── */}
            <Dialog
                open={newSupplierOpen} onClose={() => setNewSupplierOpen(false)}
                maxWidth="xs" fullWidth
                PaperProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #2a2a2a', pb: 1.5 }}>New Supplier</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ pt: 0.5 }}>
                        {[['name', 'Name *'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone']].map(([field, label]) => (
                            <Grid item xs={12} key={field}>
                                <TextField
                                    label={label} size="small" fullWidth
                                    value={newSupplierForm[field]}
                                    onChange={e => setNewSupplierForm(p => ({ ...p, [field]: e.target.value }))}
                                    sx={fieldSx}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #2a2a2a', px: 2 }}>
                    <Button onClick={() => setNewSupplierOpen(false)} sx={{ color: '#666', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateSupplier}
                        disabled={!newSupplierForm.name.trim() || creatingSupplier}
                        variant="contained"
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' }, textTransform: 'none' }}
                    >
                        {creatingSupplier ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ReceiptLightbox
                open={lightbox.open}
                onClose={closeLightbox}
                images={lightbox.images}
                initialIndex={lightbox.index}
            />
            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default SupplierPayoutSection;
