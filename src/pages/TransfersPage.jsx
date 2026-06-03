import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Button, Card, CardContent, CardMedia, Chip,
    CircularProgress, Container, Grid, MenuItem,
    TextField, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    fetchAllVehicles,
    selectAllVehicles,
    selectVehiclesLoading,
} from '../redux/transferVehicleSlice';
import transferService from '../services/transferService';

const MotionCard = motion.create(Card);

const SERVICE_TYPES = [
    'airport_transfer',
    'business_travel',
    'sports_events',
    'private_events',
    'yacht_transfer',
    'video_film_production',
    'hourly',
];

const emptyForm = {
    pick_up: '',
    drop_off: '',
    date: '',
    time: '',
    passengers: '',
    service_type: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
};

const toApiDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${m}-${d}-${y}`;
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#1a1a1a',
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#666' },
        '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4fc3f7' },
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiSvgIcon-root': { color: '#777' },
};

const CATEGORY_COLORS = {
    sedan: { bgcolor: '#1a2a3a', color: '#4fc3f7' },
    suv: { bgcolor: '#1a3a1a', color: '#66bb6a' },
    van: { bgcolor: '#3a2a1a', color: '#ffb74d' },
};

const TransfersPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const vehicles = useSelector(selectAllVehicles);
    const vehiclesLoading = useSelector(selectVehiclesLoading);

    const formRef = useRef(null);

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        dispatch(fetchAllVehicles());
    }, [dispatch]);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        scrollToForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const isValid = () =>
        form.pick_up.trim() &&
        form.drop_off.trim() &&
        form.date &&
        form.time &&
        form.passengers &&
        form.service_type &&
        form.client_name.trim() &&
        form.client_email.trim() &&
        form.client_phone.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid()) return;
        setSending(true);
        setFormError(null);
        try {
            await transferService.createInquiry({
                vehicle_id: selectedVehicle?.id ?? null,
                pick_up: form.pick_up.trim(),
                drop_off: form.drop_off.trim(),
                date: toApiDate(form.date),
                time: form.time,
                passengers: Number(form.passengers),
                service_type: form.service_type,
                client_name: form.client_name.trim(),
                client_email: form.client_email.trim(),
                client_phone: form.client_phone.trim(),
                notes: form.notes.trim() || undefined,
            });
            setSuccess(true);
            setForm(emptyForm);
            setSelectedVehicle(null);
        } catch {
            setFormError(t('transfers.inquireError'));
        } finally {
            setSending(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>

            {/* Hero */}
            <Box
                sx={{
                    position: 'relative',
                    background: 'linear-gradient(160deg, #040d14 0%, #0d1b2a 40%, #1b263b 70%, #0d1b2a 100%)',
                    py: { xs: 10, md: 16 },
                    textAlign: 'center',
                    px: 2,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,195,247,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    },
                }}
            >
                <Typography
                    variant="overline"
                    sx={{ color: '#4fc3f7', letterSpacing: 6, fontSize: '0.75rem', display: 'block', mb: 2 }}
                >
                    MIAMI GET AWAY
                </Typography>
                <Typography
                    variant="h2"
                    sx={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: { xs: '2.4rem', md: '4rem' },
                        lineHeight: 1.1,
                        mb: 2,
                    }}
                >
                    {t('transfers.title')}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ color: '#8eafc7', fontWeight: 400, maxWidth: 520, mx: 'auto', mb: 5, lineHeight: 1.6 }}
                >
                    {t('transfers.subtitle')}
                </Typography>
                <Button
                    onClick={scrollToForm}
                    variant="contained"
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                        bgcolor: '#4fc3f7',
                        color: '#000',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#0288d1', color: '#fff' },
                    }}
                >
                    {t('transfers.inquireTitle')}
                </Button>
            </Box>

            {/* Form section */}
            <Box
                ref={formRef}
                sx={{
                    bgcolor: '#0f0f0f',
                    borderTop: '1px solid #1e1e1e',
                    borderBottom: '1px solid #1e1e1e',
                    py: { xs: 6, md: 10 },
                    scrollMarginTop: '80px',
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography
                            variant="overline"
                            sx={{ color: '#4fc3f7', letterSpacing: 4, fontSize: '0.7rem' }}
                        >
                            {t('transfers.inquireTitle').toUpperCase()}
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mt: 0.5 }}>
                            {t('transfers.form.submit')}
                        </Typography>
                    </Box>

                    {/* Selected vehicle indicator */}
                    {selectedVehicle && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Chip
                                icon={<DirectionsCarIcon sx={{ color: '#4fc3f7 !important', fontSize: '18px !important' }} />}
                                label={selectedVehicle.name}
                                onDelete={() => setSelectedVehicle(null)}
                                deleteIcon={<CloseIcon sx={{ color: '#aaa !important' }} />}
                                sx={{
                                    bgcolor: '#0d2137',
                                    color: '#4fc3f7',
                                    border: '1px solid #1e3a5f',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    px: 1,
                                }}
                            />
                        </Box>
                    )}

                    {success ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h5" sx={{ color: '#66bb6a', fontWeight: 700, mb: 1 }}>
                                {t('transfers.inquireSuccess')}
                            </Typography>
                            <Button
                                onClick={() => setSuccess(false)}
                                sx={{ color: '#4fc3f7', textTransform: 'none', mt: 2 }}
                            >
                                {t('general.submit')} {t('transfers.inquireTitle').toLowerCase()}
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                        >
                            {/* Origen / Destino */}
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    label={t('transfers.form.pickUp')}
                                    name="pick_up"
                                    value={form.pick_up}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                />
                                <TextField
                                    label={t('transfers.form.dropOff')}
                                    name="drop_off"
                                    value={form.drop_off}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                />
                            </Box>

                            {/* Fecha / Hora */}
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    label={t('transfers.form.date')}
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    sx={fieldSx}
                                />
                                <TextField
                                    label={t('transfers.form.time')}
                                    name="time"
                                    type="time"
                                    value={form.time}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    sx={fieldSx}
                                />
                            </Box>

                            {/* Pasajeros / Tipo de servicio */}
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    label={t('transfers.form.passengers')}
                                    name="passengers"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={form.passengers}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                />
                                <TextField
                                    select
                                    label={t('transfers.form.serviceType')}
                                    name="service_type"
                                    value={form.service_type}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                    SelectProps={{
                                        MenuProps: { PaperProps: { sx: { bgcolor: '#1a1a1a', color: '#fff' } } },
                                    }}
                                >
                                    {SERVICE_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {t(`transfers.serviceTypes.${type}`)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Datos del cliente */}
                            <TextField
                                label={t('transfers.form.name')}
                                name="client_name"
                                value={form.client_name}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={fieldSx}
                            />
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    label={t('transfers.form.email')}
                                    name="client_email"
                                    type="email"
                                    value={form.client_email}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                />
                                <TextField
                                    label={t('transfers.form.phone')}
                                    name="client_phone"
                                    value={form.client_phone}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={fieldSx}
                                />
                            </Box>

                            <TextField
                                label={t('transfers.form.notes')}
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                sx={fieldSx}
                            />

                            {formError && (
                                <Typography variant="body2" sx={{ color: '#ef5350' }}>
                                    {formError}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={sending || !isValid()}
                                    startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                                    sx={{
                                        bgcolor: '#4fc3f7',
                                        color: '#000',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#0288d1', color: '#fff' },
                                        '&:disabled': { opacity: 0.5 },
                                    }}
                                >
                                    {sending ? t('transfers.form.sending') : t('transfers.form.submit')}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Fleet section */}
            {!vehiclesLoading && vehicles.length > 0 && (
                <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#0a0a0a' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography
                                variant="overline"
                                sx={{ color: '#4fc3f7', letterSpacing: 4, fontSize: '0.7rem' }}
                            >
                                {t('transfers.fleet').toUpperCase()}
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mt: 0.5 }}>
                                {t('transfers.fleet')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', mt: 1, maxWidth: 480, mx: 'auto' }}>
                                {t('transfers.subtitle')}
                            </Typography>
                        </Box>

                        <Grid container spacing={3} justifyContent="center">
                            {vehicles.map((vehicle, i) => {
                                const isSelected = selectedVehicle?.id === vehicle.id;
                                const catColors = CATEGORY_COLORS[vehicle.category] || CATEGORY_COLORS.sedan;
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                                        <MotionCard
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
                                            onClick={() => handleVehicleSelect(vehicle)}
                                            sx={{
                                                bgcolor: '#111',
                                                border: isSelected
                                                    ? '2px solid #4fc3f7'
                                                    : '1px solid #222',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    borderColor: '#4fc3f7',
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 32px rgba(79,195,247,0.12)',
                                                },
                                                ...(isSelected && {
                                                    boxShadow: '0 0 0 1px #4fc3f7, 0 8px 32px rgba(79,195,247,0.15)',
                                                }),
                                            }}
                                        >
                                            {vehicle.images?.[0] ? (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={vehicle.images[0]}
                                                    alt={vehicle.name}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        height: 200,
                                                        bgcolor: '#1a1a1a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <DirectionsCarIcon sx={{ fontSize: 56, color: '#2a2a2a' }} />
                                                </Box>
                                            )}

                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                                        {vehicle.name}
                                                    </Typography>
                                                    <Chip
                                                        label={t(`transfers.category.${vehicle.category}`)}
                                                        size="small"
                                                        sx={{ bgcolor: catColors.bgcolor, color: catColors.color, fontWeight: 600 }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip
                                                        icon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                                                        label={t('transfers.passengers', { count: vehicle.capacity })}
                                                        size="small"
                                                        sx={{ bgcolor: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                                                    />
                                                    <Chip
                                                        icon={<LuggageIcon sx={{ fontSize: '14px !important' }} />}
                                                        label={t('transfers.luggage', { count: vehicle.luggage_capacity })}
                                                        size="small"
                                                        sx={{ bgcolor: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 2,
                                                        color: isSelected ? '#4fc3f7' : '#555',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        transition: 'color 0.2s',
                                                    }}
                                                >
                                                    {isSelected
                                                        ? '✓ Seleccionado'
                                                        : t('transfers.form.submit')}
                                                </Typography>
                                            </CardContent>
                                        </MotionCard>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

export default TransfersPage;
