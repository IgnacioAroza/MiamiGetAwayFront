import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Button, Card, CardActions, CardContent, CardMedia, Chip,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, Paper, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Tooltip, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import ImageIcon from '@mui/icons-material/Image';
import {
    fetchAllInvestments, createInvestment, updateInvestment, deleteInvestment,
    selectAllInvestments, selectInvestmentsStatus,
} from '../../../redux/investmentSlice';
import DeleteDialog from '../dialogs/DeleteDialog';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#252525',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#6c5dd3' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputBase-input': { color: '#fff' },
};

const emptyForm = {
    name: '',
    address: '',
    unit_number: '',
    description: '',
    bathrooms: '',
    rooms: '',
    price: '',
};

const formatPrice = (price) =>
    price === null || price === undefined
        ? 'Price on request'
        : `$${Number(price).toLocaleString('en-US')}`;

const InvestmentForm = ({ form, onChange, imageFiles, onImageChange, isEdit }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
            label="Name *" name="name" value={form.name}
            onChange={onChange} fullWidth sx={fieldSx}
        />
        <TextField
            label="Address *" name="address" value={form.address}
            onChange={onChange} fullWidth sx={fieldSx}
        />
        <TextField
            label="Unit number" name="unit_number" value={form.unit_number}
            onChange={onChange} fullWidth sx={fieldSx}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                label="Rooms *" name="rooms" value={form.rooms} type="number"
                onChange={onChange} fullWidth sx={fieldSx}
                inputProps={{ min: 1 }}
            />
            <TextField
                label="Bathrooms *" name="bathrooms" value={form.bathrooms} type="number"
                onChange={onChange} fullWidth sx={fieldSx}
                inputProps={{ min: 0 }}
            />
        </Box>
        <TextField
            label="Price (leave empty = price on request)" name="price" value={form.price} type="number"
            onChange={onChange} fullWidth sx={fieldSx}
            inputProps={{ min: 0 }}
        />
        <TextField
            label="Description" name="description" value={form.description}
            onChange={onChange} fullWidth multiline rows={3}
            sx={fieldSx}
        />
        <Box>
            <Button
                component="label"
                variant="outlined"
                startIcon={<ImageIcon />}
                sx={{ color: '#aaa', borderColor: '#3a3a3a', '&:hover': { borderColor: '#6c5dd3' } }}
            >
                {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : 'Select images'}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={onImageChange}
                />
            </Button>
            {isEdit && imageFiles.length === 0 && (
                <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: 0.5 }}>
                    Leave empty to keep existing images. Uploading new images replaces all existing ones.
                </Typography>
            )}
            {imageFiles.length > 0 && (
                <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 0.5 }}>
                    {imageFiles.map(f => f.name).join(', ')}
                </Typography>
            )}
        </Box>
    </Box>
);

const InvestmentList = () => {
    const dispatch = useDispatch();
    const { isMobile, isTablet } = useDeviceDetection();
    const investments = useSelector(selectAllInvestments);
    const status = useSelector(selectInvestmentsStatus);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFiles, setImageFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchAllInvestments());
    }, [dispatch, status]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 30);
        setImageFiles(files);
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('address', form.address.trim());
        if (form.unit_number.trim()) fd.append('unit_number', form.unit_number.trim());
        if (form.description.trim()) fd.append('description', form.description.trim());
        fd.append('rooms', form.rooms);
        fd.append('bathrooms', form.bathrooms);
        if (form.price !== '') fd.append('price', form.price);
        imageFiles.forEach(file => fd.append('images', file));
        return fd;
    };

    const isFormValid = () =>
        form.name.trim() && form.address.trim() &&
        form.rooms !== '' && Number(form.rooms) > 0 &&
        form.bathrooms !== '' && Number(form.bathrooms) >= 0;

    const openCreate = () => {
        setForm(emptyForm);
        setImageFiles([]);
        setCreateOpen(true);
    };

    const openEdit = (inv) => {
        setSelected(inv);
        setForm({
            name: inv.name || '',
            address: inv.address || '',
            unit_number: inv.unit_number || '',
            description: inv.description || '',
            bathrooms: inv.bathrooms ?? '',
            rooms: inv.rooms ?? '',
            price: inv.price ?? '',
        });
        setImageFiles([]);
        setEditOpen(true);
    };

    const openDelete = (inv) => {
        setSelected(inv);
        setDeleteOpen(true);
    };

    const handleCreate = async () => {
        if (!isFormValid()) return;
        setSaving(true);
        try {
            await dispatch(createInvestment(buildFormData())).unwrap();
            setCreateOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!isFormValid() || !selected) return;
        setSaving(true);
        try {
            await dispatch(updateInvestment({ id: selected.id, formData: buildFormData() })).unwrap();
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await dispatch(deleteInvestment(selected.id)).unwrap();
            setDeleteOpen(false);
            setSelected(null);
        } catch {
            // handled by slice
        }
    };

    const dialogProps = {
        maxWidth: 'sm',
        fullWidth: true,
        PaperProps: { sx: { bgcolor: '#1a1a1a', color: '#fff' } },
    };

    if (status === 'loading') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={180} height={40} />
                    <Skeleton variant="rectangular" width={160} height={36} />
                </Box>
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Property', 'Address', 'Rooms / Baths', 'Price', 'Actions'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    {[160, 220, 100, 120, 80].map((w, j) => (
                                        <TableCell key={j}><Skeleton variant="text" width={w} /></TableCell>
                                    ))}
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
                    <TrendingUpIcon sx={{ color: '#6c5dd3' }} />
                    <Typography variant="h4">Investments</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#7c5cbf' } }}
                >
                    New Investment
                </Button>
            </Box>

            {investments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                    <TrendingUpIcon sx={{ fontSize: 48, mb: 1, color: '#333' }} />
                    <Typography variant="body1">No investments yet.</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Click "+ New Investment" to add the first one.</Typography>
                </Box>
            ) : isMobile || isTablet ? (
                <Grid container spacing={2}>
                    {investments.map(inv => (
                        <Grid item xs={12} sm={6} key={inv.id}>
                            <Card sx={{ bgcolor: '#2a2a2a', border: '1px solid #333' }}>
                                {inv.images?.[0] && (
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={inv.images[0]}
                                        alt={inv.name}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#fff' }}>
                                        {inv.name}{inv.unit_number ? ` — Unit ${inv.unit_number}` : ''}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>{inv.address}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                        <Chip icon={<BedOutlinedIcon />} label={`${inv.rooms} rooms`} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                        <Chip icon={<BathtubOutlinedIcon />} label={`${inv.bathrooms} baths`} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#6c5dd3', fontWeight: 600 }}>
                                        {formatPrice(inv.price)}
                                    </Typography>
                                </CardContent>
                                <Divider sx={{ borderColor: '#333' }} />
                                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                    <IconButton size="small" onClick={() => openEdit(inv)} sx={{ color: '#6c5dd3' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => openDelete(inv)} color="error">
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
                                <TableCell>Property</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Rooms / Baths</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {investments.map(inv => (
                                <TableRow
                                    key={inv.id}
                                    sx={{ '&:hover': { bgcolor: '#2a2a2a' }, '& td': { borderColor: '#2a2a2a', color: '#ddd' } }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {inv.images?.[0] ? (
                                                <Box
                                                    component="img"
                                                    src={inv.images[0]}
                                                    alt={inv.name}
                                                    sx={{ width: 48, height: 36, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: 48, height: 36, borderRadius: 1, bgcolor: '#333',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <ImageIcon sx={{ fontSize: 16, color: '#555' }} />
                                                </Box>
                                            )}
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                                                    {inv.name}
                                                </Typography>
                                                {inv.unit_number && (
                                                    <Typography variant="caption" sx={{ color: '#777' }}>
                                                        Unit {inv.unit_number}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 220 }}>
                                        <Typography variant="body2" sx={{
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {inv.address}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Chip icon={<BedOutlinedIcon />} label={inv.rooms} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                            <Chip icon={<BathtubOutlinedIcon />} label={inv.bathrooms} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#6c5dd3', fontWeight: 600 }}>
                                            {formatPrice(inv.price)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(inv)} sx={{ color: '#6c5dd3' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => openDelete(inv)} color="error">
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
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} {...dialogProps}>
                <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: '#6c5dd3' }} />
                    New Investment
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <InvestmentForm
                        form={form} onChange={handleFormChange}
                        imageFiles={imageFiles} onImageChange={handleImageChange}
                        isEdit={false}
                    />
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', px: 3, py: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={saving || !isFormValid()}
                        variant="contained"
                        sx={{ bgcolor: '#6c5dd3', '&:hover': { bgcolor: '#7c5cbf' } }}
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    >
                        {saving ? 'Saving…' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} {...dialogProps}>
                <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon sx={{ color: '#6c5dd3' }} />
                    Edit Investment
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <InvestmentForm
                        form={form} onChange={handleFormChange}
                        imageFiles={imageFiles} onImageChange={handleImageChange}
                        isEdit
                    />
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', px: 3, py: 2 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        onClick={handleEdit}
                        disabled={saving || !isFormValid()}
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

export default InvestmentList;
