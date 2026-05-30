import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, FormControl, IconButton, LinearProgress,
    MenuItem, Select, TextField, Tooltip, Typography,
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    Add as AddIcon,
    AttachFile as AttachFileIcon,
    CheckCircle as CheckCircleIcon,
    Home as HomeIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import supplierService from '../../../services/supplierService';
import { useToast } from '../../../hooks/useToast';
import ToastNotification from '../../common/ToastNotification';
import ReceiptLightbox from '../../common/ReceiptLightbox';

// ─── helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    try { return format(typeof dateStr === 'string' && dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr), 'MMM dd, yyyy'); }
    catch { return dateStr; }
};

const USD = (n) => `$${Number(n ?? 0).toFixed(2)}`;

const METHOD_LABELS = {
    cash: 'Cash',
    wire: 'Wire',
    card: 'Card',
    transfer: 'Transfer',
};

// ─── sub-components ───────────────────────────────────────────────────────────
const StatLabel = ({ children }) => (
    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#888', letterSpacing: 1, mb: 0.3, textTransform: 'uppercase' }}>
        {children}
    </Typography>
);

const StatValue = ({ children, color = '#fff', size = '1.4rem' }) => (
    <Typography sx={{ fontSize: size, fontWeight: 700, color, lineHeight: 1.2 }}>
        {children}
    </Typography>
);

// ─── main component ───────────────────────────────────────────────────────────
const SupplierPayoutView = ({ reservationId, reservation }) => {
    const { toast, showToast } = useToast();
    const fileInputRef = useRef(null);

    const [data, setData] = useState(null);          // { assignment, payments }
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ amount: '', method: 'wire', date: '', referenceNotes: '' });
    const [receiptFiles, setReceiptFiles] = useState([]);
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
    const openLightbox = (images, index = 0) => setLightbox({ open: true, images, index });
    const closeLightbox = () => setLightbox(prev => ({ ...prev, open: false }));

    const load = useCallback(async () => {
        if (!reservationId) return;
        setLoading(true);
        try {
            const [assignment, payments] = await Promise.all([
                supplierService.getReservationSupplier(reservationId),
                supplierService.getSupplierPayments(reservationId),
            ]);
            if (assignment) setData({ assignment, payments: payments || [] });
            else setData(null);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [reservationId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return null;
    if (!data) return null;

    const { assignment, payments } = data;
    const supplier = assignment.supplier || {};
    const nights = Number(reservation?.nights ?? 0);
    const totalAmount = Number(reservation?.totalAmount ?? 0);
    const payoutPerNight = Number(assignment.payout_per_night ?? 0);
    const cleaningFee = Number(assignment.cleaning_fee ?? 0);
    const cal = assignment.calculated || {};
    const owed = Number(cal.total ?? payoutPerNight * nights);
    const paid = Number(cal.paid ?? payments.reduce((s, p) => s + Number(p.amount ?? 0), 0));
    const balance = Number(cal.balance ?? owed - paid);
    const pct = owed > 0 ? Math.min(100, Math.round((paid / owed) * 100)) : 0;
    const netMargin = Number(cal.profit ?? totalAmount - owed);
    const marginPct = totalAmount > 0 ? Math.round((netMargin / totalAmount) * 100) : 0;

    // badge color — usa los mismos tonos que el resto del admin
    const paidBadgeColor = pct === 100 ? 'rgba(76,175,80,0.15)' : pct > 0 ? 'rgba(255,152,0,0.15)' : 'rgba(244,67,54,0.15)';
    const paidTextColor  = pct === 100 ? '#4caf50' : pct > 0 ? '#ff9800' : '#f44336';

    // ── register payment handlers ─────────────────────────────────────────────
    const handleOpenDialog = () => {
        setForm({ amount: '', method: 'wire', date: new Date().toISOString().slice(0, 10), referenceNotes: '' });
        setReceiptFiles([]);
        setDialogOpen(true);
    };

    const handleRegister = async () => {
        if (!form.amount || isNaN(Number(form.amount))) return;
        setSaving(true);
        try {
            await supplierService.createSupplierPayment(
                reservationId,
                { amount: form.amount, method: form.method, date: form.date, reference_notes: form.referenceNotes },
                receiptFiles,
            );
            showToast('Payment registered', 'success');
            setDialogOpen(false);
            await load();
        } catch {
            showToast('Error registering payment', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <ToastNotification toast={toast} />
            <ReceiptLightbox
                open={lightbox.open}
                onClose={closeLightbox}
                images={lightbox.images}
                initialIndex={lightbox.index}
            />

            <Box sx={{ mt: 3, bgcolor: '#2a2a2a', borderRadius: 2, overflow: 'hidden', border: '1px solid #444' }}>

                {/* ── Header ──────────────────────────────────────────────── */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 1.5,
                    px: 3, py: 2, bgcolor: '#333', borderBottom: '1px solid #444',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccountBalanceIcon sx={{ color: '#9b8fef', fontSize: 22 }} />
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                            Provider Payout
                        </Typography>
                        <Chip label="INTERNAL" size="small" sx={{
                            bgcolor: '#2a2a4a', color: '#9b8fef',
                            fontSize: '0.6rem', fontWeight: 700, height: 20,
                        }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            bgcolor: paidBadgeColor, px: 1.5, py: 0.4, borderRadius: 1,
                            fontSize: '0.7rem', fontWeight: 700, color: paidTextColor,
                            display: 'flex', alignItems: 'center', gap: 0.5,
                        }}>
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: paidTextColor, display: 'inline-block' }} />
                            {pct === 100 ? 'PAID' : `${pct}% PAID`}
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDialog}
                            sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' }, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700 }}
                        >
                            Register Payment
                        </Button>
                    </Box>
                </Box>

                {/* ── Body: 3 columns ─────────────────────────────────────── */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0, p: 0 }}>

                    {/* Left — supplier info */}
                    <Box sx={{ flex: '0 0 220px', minWidth: 0, p: 3, borderRight: '1px solid #444' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#6c5dd3', width: 44, height: 44, fontSize: '0.95rem', fontWeight: 700 }}>
                                {initials(supplier.name)}
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
                                    {supplier.name}
                                </Typography>
                                {supplier.company && (
                                    <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>
                                        {supplier.company}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {supplier.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>✉</Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#bbb', wordBreak: 'break-all' }}>{supplier.email}</Typography>
                            </Box>
                        )}
                        {supplier.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>✆</Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#bbb' }}>{supplier.phone}</Typography>
                            </Box>
                        )}

                        {assignment.payment_terms && (
                            <Box sx={{
                                mt: 'auto', bgcolor: '#252525',
                                border: '1px solid #333', borderRadius: 1, p: 1.2,
                            }}>
                                <Box sx={{ display: 'flex', gap: 0.8 }}>
                                    <AttachFileIcon sx={{ color: '#aaa', fontSize: 14, mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: '0.72rem', color: '#ccc', lineHeight: 1.5 }}>
                                        {assignment.payment_terms}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Middle — stats */}
                    <Box sx={{ flex: '1 1 260px', minWidth: 0, p: 3, borderRight: '1px solid #444' }}>
                        <Box sx={{ display: 'flex', gap: 20, mb: 2 }}>
                            <Box>
                                <StatLabel>Rate per night</StatLabel>
                                <StatValue color="#ff9800">{USD(payoutPerNight)}</StatValue>
                                <Typography sx={{ fontSize: '0.75rem', color: '#888', mt: 0.3 }}>
                                    × {nights} nights = {USD(payoutPerNight * nights)}
                                </Typography>
                            </Box>
                            {cleaningFee > 0 && (
                                <Box>
                                    <StatLabel>Cleaning fee</StatLabel>
                                    <StatValue color="#ff9800">{USD(cleaningFee)}</StatValue>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <StatLabel>Total owed to provider</StatLabel>
                            <StatValue color="#ff9800">{USD(owed)}</StatValue>
                            {cleaningFee > 0 && (
                                <Typography sx={{ fontSize: '0.72rem', color: '#666', mt: 0.3 }}>
                                    {USD(payoutPerNight * nights)} + {USD(cleaningFee)} cleaning
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <StatLabel>Pending payout</StatLabel>
                            <StatValue color={balance > 0 ? '#f44336' : '#4caf50'}>{USD(balance)}</StatValue>
                        </Box>

                        <Box sx={{ mb: 2.5 }}>
                            <LinearProgress
                                variant="determinate"
                                value={pct}
                                sx={{
                                    height: 8, borderRadius: 4, bgcolor: '#3a3a3a',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#4caf50', borderRadius: 4 },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.6 }}>
                                <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>{USD(paid)} paid</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>{pct}% complete</Typography>
                            </Box>
                        </Box>

                        {/* Net margin */}
                        <Box sx={{
                            bgcolor: '#252525',
                            border: `1px solid ${netMargin >= 0 ? 'rgba(76,175,80,0.4)' : 'rgba(244,67,54,0.4)'}`,
                            borderRadius: 1, px: 2, py: 1.5,
                        }}>
                            <StatLabel>Net margin</StatLabel>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                                <StatValue color={netMargin >= 0 ? '#4caf50' : '#f44336'}>{USD(netMargin)}</StatValue>
                                <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>
                                    {marginPct}% of {USD(totalAmount)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right — payment history */}
                    <Box sx={{ flex: '1 1 220px', minWidth: 0, p: 3 }}>
                        <StatLabel>Payment history</StatLabel>

                        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {payments.map((p) => (
                                <Box key={p.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                                            {METHOD_LABELS[p.method] || p.method}
                                        </Typography>
                                        <Typography sx={{ color: '#777', fontSize: '0.72rem' }}>
                                            {fmtDate(p.date)}{p.referenceNotes ? ` · ${p.referenceNotes}` : ''}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: '#4caf50', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                                        {USD(p.amount)}
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
                                </Box>
                            ))}

                            {/* Outstanding row */}
                            {balance > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <HomeIcon sx={{ color: '#ff9800', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                                            Outstanding
                                        </Typography>
                                        <Typography sx={{ color: '#777', fontSize: '0.72rem' }}>
                                            Due after check-out{reservation?.checkOut ? ` · ${fmtDate(reservation.checkOut)}` : ''}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: '#ff9800', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                                        {USD(balance)}
                                    </Typography>
                                </Box>
                            )}

                            {payments.length === 0 && balance === 0 && (
                                <Typography sx={{ color: '#666', fontSize: '0.78rem' }}>No payments yet</Typography>
                            )}
                        </Box>

                        <Box
                            component="button"
                            onClick={handleOpenDialog}
                            sx={{
                                mt: 2, background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 0.5, p: 0,
                                color: '#9b8fef', fontSize: '0.78rem', fontWeight: 600,
                                '&:hover': { color: '#b8aeff' },
                            }}
                        >
                            <AddIcon sx={{ fontSize: 14 }} />
                            Register a new payment
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── Register Payment Dialog ──────────────────────────────────── */}
            <Dialog
                open={dialogOpen}
                onClose={() => !saving && setDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
            >
                <DialogTitle sx={{ color: '#fff' }}>Register Supplier Payment</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField
                        label="Amount"
                        type="number"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        InputProps={{ startAdornment: <Typography sx={{ color: '#aaa', mr: 0.5 }}>$</Typography> }}
                        inputProps={{ min: 0, step: '0.01' }}
                        sx={{ '& .MuiOutlinedInput-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#7c5cbf' } }}
                    />
                    <FormControl>
                        <Select
                            value={form.method}
                            onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                            sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a3a3a' }, '& .MuiSvgIcon-root': { color: '#666' } }}
                            MenuProps={{ PaperProps: { sx: { bgcolor: '#252525', color: '#fff', '& .MuiMenuItem-root:hover': { bgcolor: '#333' } } } }}
                        >
                            {Object.entries(METHOD_LABELS).map(([val, label]) => (
                                <MenuItem key={val} value={val}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-input': { color: '#fff', colorScheme: 'dark' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#7c5cbf' } }}
                    />
                    <TextField
                        label="Reference / Notes"
                        multiline
                        rows={2}
                        value={form.referenceNotes}
                        onChange={e => setForm(f => ({ ...f, referenceNotes: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#777' }, '& fieldset': { borderColor: '#3a3a3a' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#7c5cbf' } }}
                    />
                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AttachFileIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ color: '#aaa', borderColor: '#555', textTransform: 'none', fontSize: '0.78rem' }}
                        >
                            {receiptFiles.length > 0 ? `${receiptFiles.length} file(s) selected` : 'Attach receipts'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={e => setReceiptFiles(Array.from(e.target.files))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleRegister}
                        disabled={saving || !form.amount}
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#5a4dc0' } }}
                    >
                        {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Register'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SupplierPayoutView;
