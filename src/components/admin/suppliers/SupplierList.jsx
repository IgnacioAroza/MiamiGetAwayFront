import React, { useEffect, useState } from 'react';
import {
    Box, Button, Card, CardActions, CardContent, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, Paper, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Tooltip, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import {
    fetchAllSuppliers, createSupplier, updateSupplier, deleteSupplier,
    selectAllSuppliers, selectSuppliersStatus,
} from '../../../redux/supplierSlice';
import DeleteDialog from '../dialogs/DeleteDialog';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const emptyForm = { name: '', email: '', phone: '', notes: '' };

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#252525',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#7c5cbf' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputBase-input': { color: '#fff' },
};

const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';

const SupplierForm = ({ form, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
            label="Name *" name="name" value={form.name}
            onChange={onChange} fullWidth sx={fieldSx}
            inputProps={{ maxLength: 120 }}
        />
        <TextField
            label="Email" name="email" value={form.email}
            onChange={onChange} fullWidth sx={fieldSx}
            inputProps={{ maxLength: 200 }}
        />
        <TextField
            label="Phone" name="phone" value={form.phone}
            onChange={onChange} fullWidth sx={fieldSx}
            inputProps={{ maxLength: 40 }}
        />
        <TextField
            label="Notes" name="notes" value={form.notes}
            onChange={onChange} fullWidth multiline rows={2}
            sx={fieldSx} inputProps={{ maxLength: 500 }}
        />
    </Box>
);

const SupplierList = () => {
    const dispatch = useDispatch();
    const { isMobile, isTablet } = useDeviceDetection();
    const suppliers = useSelector(selectAllSuppliers);
    const status = useSelector(selectSuppliersStatus);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'idle' || status === 'failed') {
            dispatch(fetchAllSuppliers());
        }
    }, [dispatch, status]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setCreateOpen(true);
    };

    const openEdit = (supplier) => {
        setSelected(supplier);
        setForm({
            name: supplier.name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            notes: supplier.notes || '',
        });
        setEditOpen(true);
    };

    const openDelete = (supplier) => {
        setSelected(supplier);
        setDeleteOpen(true);
    };

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            await dispatch(createSupplier(form)).unwrap();
            setCreateOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!form.name.trim() || !selected) return;
        setSaving(true);
        try {
            await dispatch(updateSupplier({ id: selected.id, data: form })).unwrap();
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await dispatch(deleteSupplier(selected.id)).unwrap();
            setDeleteOpen(false);
            setSelected(null);
        } catch {
            // error handled by slice
        }
    };

    if (status === 'loading') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={160} height={40} />
                    <Skeleton variant="rectangular" width={150} height={36} />
                </Box>
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Supplier', 'Email', 'Phone', 'Notes', 'Actions'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    {[180, 220, 120, 160].map((w, j) => (
                                        <TableCell key={j}><Skeleton variant="text" width={w} /></TableCell>
                                    ))}
                                    <TableCell>
                                        <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block' }} />
                                        <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block', ml: 1 }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HandshakeIcon sx={{ color: '#6c5dd3' }} />
                    <Typography variant="h4">Suppliers</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#7c5cbf' } }}
                >
                    New Supplier
                </Button>
            </Box>

            {suppliers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                    <HandshakeIcon sx={{ fontSize: 48, mb: 1, color: '#333' }} />
                    <Typography variant="body1">No suppliers yet.</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Click "+ New Supplier" to add the first one.</Typography>
                </Box>
            ) : isMobile || isTablet ? (
                <Grid container spacing={2}>
                    {suppliers.map(s => (
                        <Grid item xs={12} key={s.id}>
                            <Card sx={{ bgcolor: '#2a2a2a', border: '1px solid #333' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                        <Box sx={{
                                            width: 40, height: 40, borderRadius: 1, bgcolor: '#6c5dd3',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                                        }}>
                                            {initials(s.name)}
                                        </Box>
                                        <Typography variant="h6" sx={{ color: '#fff' }}>{s.name}</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1.5, borderColor: '#333' }} />
                                    {s.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                            <EmailIcon sx={{ fontSize: 16, color: '#777' }} />
                                            <Typography variant="body2" sx={{ color: '#bbb' }}>{s.email}</Typography>
                                        </Box>
                                    )}
                                    {s.phone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                            <PhoneIcon sx={{ fontSize: 16, color: '#777' }} />
                                            <Typography variant="body2" sx={{ color: '#bbb' }}>{s.phone}</Typography>
                                        </Box>
                                    )}
                                    {s.notes && (
                                        <Typography variant="body2" sx={{ color: '#777', mt: 1, fontStyle: 'italic' }}>
                                            {s.notes}
                                        </Typography>
                                    )}
                                </CardContent>
                                <Divider sx={{ borderColor: '#333' }} />
                                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                    <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#6c5dd3' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => openDelete(s)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { color: '#aaa', fontWeight: 600, borderColor: '#333' } }}>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map(s => (
                                <TableRow
                                    key={s.id}
                                    sx={{ '&:hover': { bgcolor: '#2a2a2a' }, '& td': { borderColor: '#2a2a2a', color: '#ddd' } }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: 1, bgcolor: '#6c5dd3',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.68rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                                            }}>
                                                {initials(s.name)}
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                                                {s.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{s.email || '—'}</TableCell>
                                    <TableCell>{s.phone || '—'}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography variant="body2" sx={{
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', color: '#999',
                                        }}>
                                            {s.notes || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#6c5dd3' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => openDelete(s)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create dialog */}
            <Dialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HandshakeIcon sx={{ color: '#6c5dd3' }} />
                    New Supplier
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <SupplierForm form={form} onChange={handleFormChange} />
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', px: 3, py: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={saving || !form.name.trim()}
                        variant="contained"
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#7c5cbf' } }}
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    >
                        {saving ? 'Saving…' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit dialog */}
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon sx={{ color: '#6c5dd3' }} />
                    Edit Supplier
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <SupplierForm form={form} onChange={handleFormChange} />
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', px: 3, py: 2 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        onClick={handleEdit}
                        disabled={saving || !form.name.trim()}
                        variant="contained"
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#7c5cbf' } }}
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete dialog */}
            <DeleteDialog
                open={deleteOpen}
                onClose={() => { setDeleteOpen(false); setSelected(null); }}
                onConfirm={handleDelete}
            />
        </Box>
    );
};

export default SupplierList;
