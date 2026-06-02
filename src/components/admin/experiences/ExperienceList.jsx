import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Button, Card, CardActions, CardContent, CardMedia, Chip,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, Paper, Skeleton, Tab, Tabs,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Tooltip, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExploreIcon from '@mui/icons-material/Explore';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
    fetchAllExperiences, createExperience, updateExperience, deleteExperience,
    selectAllExperiences, selectExperiencesStatus,
} from '../../../redux/experienceSlice';
import { selectAllInquiries, selectInquiriesStatus } from '../../../redux/experienceInquirySlice';
import DeleteDialog from '../dialogs/DeleteDialog';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import InquiryList from './InquiryList';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#252525',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputBase-input': { color: '#fff' },
};

const emptyForm = { title: '', description: '', capacity: '', price: '' };

const formatPrice = (price) =>
    price === null || price === undefined
        ? 'Price on request'
        : `$${Number(price).toLocaleString('en-US')}`;

const ExperienceForm = ({ form, onChange, imageFiles, onImageChange, isEdit }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
            label="Title *" name="title" value={form.title}
            onChange={onChange} fullWidth sx={fieldSx}
        />
        <TextField
            label="Description" name="description" value={form.description}
            onChange={onChange} fullWidth multiline rows={3} sx={fieldSx}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                label="Capacity (leave empty = unlimited)" name="capacity" value={form.capacity} type="number"
                onChange={onChange} fullWidth sx={fieldSx}
                inputProps={{ min: 1 }}
            />
            <TextField
                label="Price (leave empty = on request)" name="price" value={form.price} type="number"
                onChange={onChange} fullWidth sx={fieldSx}
                inputProps={{ min: 0 }}
            />
        </Box>
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

const ExperienceList = () => {
    const dispatch = useDispatch();
    const { isMobile, isTablet } = useDeviceDetection();
    const experiences = useSelector(selectAllExperiences);
    const status = useSelector(selectExperiencesStatus);
    const inquiries = useSelector(selectAllInquiries);
    const pendingCount = inquiries.filter(i => i.status === 'pending').length;

    const [activeTab, setActiveTab] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFiles, setImageFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchAllExperiences());
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
        fd.append('title', form.title.trim());
        if (form.description.trim()) fd.append('description', form.description.trim());
        if (form.capacity !== '') fd.append('capacity', form.capacity);
        if (form.price !== '') fd.append('price', form.price);
        imageFiles.forEach(file => fd.append('images', file));
        return fd;
    };

    const isFormValid = () => form.title.trim().length > 0;

    const openCreate = () => {
        setForm(emptyForm);
        setImageFiles([]);
        setCreateOpen(true);
    };

    const openEdit = (exp) => {
        setSelected(exp);
        setForm({
            title: exp.title || '',
            description: exp.description || '',
            capacity: exp.capacity ?? '',
            price: exp.price ?? '',
        });
        setImageFiles([]);
        setEditOpen(true);
    };

    const openDelete = (exp) => {
        setSelected(exp);
        setDeleteOpen(true);
    };

    const handleCreate = async () => {
        if (!isFormValid()) return;
        setSaving(true);
        try {
            await dispatch(createExperience(buildFormData())).unwrap();
            setCreateOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!isFormValid() || !selected) return;
        setSaving(true);
        try {
            await dispatch(updateExperience({ id: selected.id, formData: buildFormData() })).unwrap();
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await dispatch(deleteExperience(selected.id)).unwrap();
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
                                {['Experience', 'Capacity', 'Price', 'Actions'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    {[200, 100, 120, 80].map((w, j) => (
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
                    <Tab icon={<ExploreIcon />} iconPosition="start" label="Experiences" />
                    <Tab
                        icon={<MailOutlineIcon />}
                        iconPosition="start"
                        label={pendingCount > 0 ? `Inquiries (${pendingCount} pending)` : 'Inquiries'}
                    />
                </Tabs>
            </Box>

            {activeTab === 1 && <InquiryList />}

            {activeTab === 0 && <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExploreIcon sx={{ color: '#4fc3f7' }} />
                    <Typography variant="h4">Experiences</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    sx={{ bgcolor: '#4fc3f7', color: '#000', '&:hover': { bgcolor: '#0288d1', color: '#fff' } }}
                >
                    New Experience
                </Button>
            </Box>

            {experiences.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                    <ExploreIcon sx={{ fontSize: 48, mb: 1, color: '#333' }} />
                    <Typography variant="body1">No experiences yet.</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Click "+ New Experience" to add the first one.</Typography>
                </Box>
            ) : isMobile || isTablet ? (
                <Grid container spacing={2}>
                    {experiences.map(exp => (
                        <Grid item xs={12} sm={6} key={exp.id}>
                            <Card sx={{ bgcolor: '#2a2a2a', border: '1px solid #333' }}>
                                {exp.images?.[0] && (
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={exp.images[0]}
                                        alt={exp.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#fff' }}>{exp.title}</Typography>
                                    {exp.capacity !== null && exp.capacity !== undefined && (
                                        <Chip
                                            icon={<GroupIcon />}
                                            label={`${exp.capacity} people`}
                                            size="small"
                                            sx={{ bgcolor: '#333', color: '#ddd', mt: 1, mb: 1 }}
                                        />
                                    )}
                                    <Typography variant="body1" sx={{ color: '#4fc3f7', fontWeight: 600 }}>
                                        {formatPrice(exp.price)}
                                    </Typography>
                                </CardContent>
                                <Divider sx={{ borderColor: '#333' }} />
                                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                    <IconButton size="small" onClick={() => openEdit(exp)} sx={{ color: '#4fc3f7' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => openDelete(exp)} color="error">
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
                                <TableCell>Experience</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experiences.map(exp => (
                                <TableRow
                                    key={exp.id}
                                    sx={{ '&:hover': { bgcolor: '#2a2a2a' }, '& td': { borderColor: '#2a2a2a', color: '#ddd' } }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {exp.images?.[0] ? (
                                                <Box
                                                    component="img"
                                                    src={exp.images[0]}
                                                    alt={exp.title}
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
                                                    {exp.title}
                                                </Typography>
                                                {exp.description && (
                                                    <Typography variant="caption" sx={{
                                                        color: '#777',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        maxWidth: 280,
                                                    }}>
                                                        {exp.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {exp.capacity !== null && exp.capacity !== undefined ? (
                                            <Chip
                                                icon={<GroupIcon />}
                                                label={`${exp.capacity} people`}
                                                size="small"
                                                sx={{ bgcolor: '#333', color: '#ddd' }}
                                            />
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#555' }}>Unlimited</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#4fc3f7', fontWeight: 600 }}>
                                            {formatPrice(exp.price)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(exp)} sx={{ color: '#4fc3f7' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => openDelete(exp)} color="error">
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
                    <ExploreIcon sx={{ color: '#4fc3f7' }} />
                    New Experience
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <ExperienceForm
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
                    Edit Experience
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <ExperienceForm
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
        </Box>}
        </Box>
    );
};

export default ExperienceList;
