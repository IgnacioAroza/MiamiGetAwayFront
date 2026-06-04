import React, { useEffect, useState } from 'react';
import {
    Box, Button, Card, CardActions, CardContent, CardMedia, Chip,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, MenuItem, Paper, Skeleton, Tab, TablePagination, Tabs,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Tooltip, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import ImageIcon from '@mui/icons-material/Image';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
    fetchAllVehicles, createVehicle, updateVehicle, deleteVehicle,
    selectAllVehicles, selectVehiclesLoading, selectVehiclesPagination,
} from '../../../redux/transferVehicleSlice';
import {
    selectAllTransferInquiries,
} from '../../../redux/transferInquirySlice';
import DeleteDialog from '../dialogs/DeleteDialog';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import TransferInquiryList from './InquiryList';

const CATEGORIES = ['sedan', 'suv', 'van'];
const CATEGORY_LABELS = { sedan: 'Sedan', suv: 'SUV', van: 'Van / Sprinter' };

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#252525',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiSvgIcon-root': { color: '#777' },
};

const emptyForm = { name: '', category: '', capacity: '', luggage_capacity: '', description: '' };

const VehicleForm = ({ form, onChange, imageFiles, onImageChange, isEdit }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
            label="Name *" name="name" value={form.name}
            onChange={onChange} fullWidth sx={fieldSx}
        />
        <TextField
            select
            label="Category *" name="category" value={form.category}
            onChange={onChange} fullWidth sx={fieldSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a1a1a', color: '#fff' } } } }}
        >
            {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</MenuItem>
            ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                label="Passengers *" name="capacity" value={form.capacity} type="number"
                onChange={onChange} fullWidth sx={fieldSx} inputProps={{ min: 1 }}
            />
            <TextField
                label="Luggage capacity *" name="luggage_capacity" value={form.luggage_capacity} type="number"
                onChange={onChange} fullWidth sx={fieldSx} inputProps={{ min: 0 }}
            />
        </Box>
        <TextField
            label="Description" name="description" value={form.description}
            onChange={onChange} fullWidth multiline rows={3} sx={fieldSx}
        />
        <Box>
            <Button
                component="label"
                variant="outlined"
                startIcon={<ImageIcon />}
                sx={{ color: '#aaa', borderColor: '#3a3a3a', '&:hover': { borderColor: '#4fc3f7' } }}
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

const TransferList = () => {
    const dispatch = useDispatch();
    const { isMobile, isTablet } = useDeviceDetection();
    const vehicles = useSelector(selectAllVehicles);
    const loading = useSelector(selectVehiclesLoading);
    const pagination = useSelector(selectVehiclesPagination);
    const inquiries = useSelector(selectAllTransferInquiries);
    const pendingCount = inquiries.filter(i => i.status === 'pending').length;

    const [activeTab, setActiveTab] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFiles, setImageFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchAllVehicles({ page: page + 1, limit: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 20);
        setImageFiles(files);
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('category', form.category);
        fd.append('capacity', form.capacity);
        fd.append('luggage_capacity', form.luggage_capacity);
        if (form.description.trim()) fd.append('description', form.description.trim());
        imageFiles.forEach(file => fd.append('images', file));
        return fd;
    };

    const isFormValid = () =>
        form.name.trim() && form.category && form.capacity !== '' && form.luggage_capacity !== '';

    const openCreate = () => {
        setForm(emptyForm);
        setImageFiles([]);
        setCreateOpen(true);
    };

    const openEdit = (vehicle) => {
        setSelected(vehicle);
        setForm({
            name: vehicle.name || '',
            category: vehicle.category || '',
            capacity: vehicle.capacity ?? '',
            luggage_capacity: vehicle.luggage_capacity ?? '',
            description: vehicle.description || '',
        });
        setImageFiles([]);
        setEditOpen(true);
    };

    const openDelete = (vehicle) => {
        setSelected(vehicle);
        setDeleteOpen(true);
    };

    const handleCreate = async () => {
        if (!isFormValid()) return;
        setSaving(true);
        try {
            await dispatch(createVehicle(buildFormData())).unwrap();
            setCreateOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!isFormValid() || !selected) return;
        setSaving(true);
        try {
            await dispatch(updateVehicle({ id: selected.id, data: buildFormData() })).unwrap();
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await dispatch(deleteVehicle(selected.id)).unwrap();
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

    if (loading && vehicles.length === 0) {
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
                                {['Vehicle', 'Category', 'Passengers', 'Luggage', 'Actions'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    {[220, 100, 80, 80, 80].map((w, j) => (
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
        <Box>
            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #2a2a2a', px: 3, pt: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        '& .MuiTab-root': { color: '#888', textTransform: 'none', fontWeight: 600 },
                        '& .Mui-selected': { color: '#4fc3f7' },
                        '& .MuiTabs-indicator': { bgcolor: '#4fc3f7' },
                    }}
                >
                    <Tab icon={<DirectionsCarIcon />} iconPosition="start" label="Fleet" />
                    <Tab
                        icon={<MailOutlineIcon />}
                        iconPosition="start"
                        label={pendingCount > 0 ? `Inquiries (${pendingCount} pending)` : 'Inquiries'}
                    />
                </Tabs>
            </Box>

            {activeTab === 1 && <TransferInquiryList />}

            {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DirectionsCarIcon sx={{ color: '#4fc3f7' }} />
                            <Typography variant="h4">Fleet</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openCreate}
                            sx={{ bgcolor: '#4fc3f7', color: '#000', '&:hover': { bgcolor: '#0288d1', color: '#fff' } }}
                        >
                            New Vehicle
                        </Button>
                    </Box>

                    {vehicles.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                            <DirectionsCarIcon sx={{ fontSize: 48, mb: 1, color: '#333' }} />
                            <Typography variant="body1">No vehicles yet.</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>Click "+ New Vehicle" to add the first one.</Typography>
                        </Box>
                    ) : isMobile || isTablet ? (
                        <Grid container spacing={2}>
                            {vehicles.map(vehicle => (
                                <Grid item xs={12} sm={6} key={vehicle.id}>
                                    <Card sx={{ bgcolor: '#2a2a2a', border: '1px solid #333' }}>
                                        {vehicle.images?.[0] && (
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image={vehicle.images[0]}
                                                alt={vehicle.name}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        )}
                                        <CardContent>
                                            <Typography variant="h6" sx={{ color: '#fff' }}>{vehicle.name}</Typography>
                                            <Chip
                                                label={CATEGORY_LABELS[vehicle.category] || vehicle.category}
                                                size="small"
                                                sx={{ bgcolor: '#1e3a5f', color: '#4fc3f7', mt: 1, mb: 1 }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip icon={<PersonIcon />} label={vehicle.capacity} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                                <Chip icon={<LuggageIcon />} label={vehicle.luggage_capacity} size="small" sx={{ bgcolor: '#333', color: '#ddd' }} />
                                            </Box>
                                        </CardContent>
                                        <Divider sx={{ borderColor: '#333' }} />
                                        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                            <IconButton size="small" onClick={() => openEdit(vehicle)} sx={{ color: '#4fc3f7' }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => openDelete(vehicle)} color="error">
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
                                        <TableCell>Vehicle</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Passengers</TableCell>
                                        <TableCell>Luggage</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vehicles.map(vehicle => (
                                        <TableRow
                                            key={vehicle.id}
                                            sx={{ '&:hover': { bgcolor: '#2a2a2a' }, '& td': { borderColor: '#2a2a2a', color: '#ddd' } }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    {vehicle.images?.[0] ? (
                                                        <Box
                                                            component="img"
                                                            src={vehicle.images[0]}
                                                            alt={vehicle.name}
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
                                                            {vehicle.name}
                                                        </Typography>
                                                        {vehicle.description && (
                                                            <Typography variant="caption" sx={{
                                                                color: '#777',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 1,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                maxWidth: 280,
                                                            }}>
                                                                {vehicle.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={CATEGORY_LABELS[vehicle.category] || vehicle.category}
                                                    size="small"
                                                    sx={{ bgcolor: '#1e3a5f', color: '#4fc3f7' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 14, color: '#777' }} />
                                                    <Typography variant="body2">{vehicle.capacity}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LuggageIcon sx={{ fontSize: 14, color: '#777' }} />
                                                    <Typography variant="body2">{vehicle.luggage_capacity}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => openEdit(vehicle)} sx={{ color: '#4fc3f7' }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => openDelete(vehicle)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={pagination?.total ?? vehicles.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[10, 25, 50]}
                                labelRowsPerPage="Rows per page:"
                            />
                        </TableContainer>
                    )}

                    {(isMobile || isTablet) && vehicles.length > 0 && (
                        <TablePagination
                            component="div"
                            count={pagination?.total ?? vehicles.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 25, 50]}
                            labelRowsPerPage="Per page:"
                        />
                    )}

                    {/* Create dialog */}
                    <Dialog open={createOpen} onClose={() => setCreateOpen(false)} {...dialogProps}>
                        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DirectionsCarIcon sx={{ color: '#4fc3f7' }} />
                            New Vehicle
                        </DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <VehicleForm
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
                                sx={{ bgcolor: '#4fc3f7', color: '#000', '&:hover': { bgcolor: '#0288d1', color: '#fff' } }}
                                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                            >
                                {saving ? 'Saving…' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit dialog */}
                    <Dialog open={editOpen} onClose={() => setEditOpen(false)} {...dialogProps}>
                        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EditIcon sx={{ color: '#4fc3f7' }} />
                            Edit Vehicle
                        </DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <VehicleForm
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
                                sx={{ bgcolor: '#4fc3f7', color: '#000', '&:hover': { bgcolor: '#0288d1', color: '#fff' } }}
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
            )}
        </Box>
    );
};

export default TransferList;
