import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, MenuItem, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import transferService from '../services/transferService';
import ImageCarousel from '../components/images/ImageCarousel';

const MotionCard = motion.create(Card);

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#3a3a3a' },
        '&:hover fieldset': { borderColor: '#555' },
        '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
    },
    '& .MuiInputLabel-root': { color: '#777' },
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiSvgIcon-root': { color: '#777' },
};

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

// Converts YYYY-MM-DD (from date input) to MM-DD-YYYY (API format)
const toApiDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${m}-${d}-${y}`;
};

const TransferDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await transferService.getVehicleById(id);
                setVehicle(res.data);
            } catch (err) {
                setError(err?.response?.status === 404
                    ? t('transfers.notFound')
                    : t('transfers.error')
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, t]);

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
                vehicle_id: vehicle?.id ?? null,
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
        } catch {
            setFormError(t('transfers.inquireError'));
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#4fc3f7' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="error" gutterBottom>{error}</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/transfers')}>
                    {t('transfers.backToTransfers')}
                </Button>
            </Container>
        );
    }

    if (!vehicle) return null;

    const images = Array.isArray(vehicle.images) ? vehicle.images : [];

    return (
        <Box sx={{ py: 4, minHeight: '100vh', mt: 8, bgcolor: 'background.default', color: 'text.primary' }}>
            <Container maxWidth="md">
                <MotionCard
                    sx={{ width: '100%', mb: 4, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }}
                >
                    {images.length > 0 && (
                        <ImageCarousel
                            images={images}
                            width="95%"
                            height={isMobile ? '250px' : '480px'}
                            objectPosition="center center"
                        />
                    )}

                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {/* Nombre y categoría */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {vehicle.name}
                                </Typography>
                                <Chip
                                    label={t(`transfers.category.${vehicle.category}`)}
                                    sx={{ bgcolor: '#1e3a5f', color: '#4fc3f7', border: '1px solid #1e3a5f' }}
                                />
                            </Box>

                            {/* Capacidad */}
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<PersonIcon />}
                                    label={t('transfers.passengers', { count: vehicle.capacity })}
                                    sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                />
                                <Chip
                                    icon={<LuggageIcon />}
                                    label={t('transfers.luggage', { count: vehicle.luggage_capacity })}
                                    sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                />
                            </Box>

                            {/* Descripción */}
                            {vehicle.description && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {t('services.description')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                            {vehicle.description}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            <Divider />

                            {/* Formulario de solicitud */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <DirectionsCarIcon sx={{ color: '#4fc3f7' }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        {t('transfers.inquireTitle')}
                                    </Typography>
                                </Box>

                                {success ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography sx={{ color: '#66bb6a', fontWeight: 600 }}>
                                            {t('transfers.inquireSuccess')}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box
                                        component="form"
                                        onSubmit={handleSubmit}
                                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
                                                    MenuProps: {
                                                        PaperProps: { sx: { bgcolor: '#1a1a1a', color: '#fff' } },
                                                    },
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

                                        {/* Notas */}
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

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={sending || !isValid()}
                                            startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                                            sx={{
                                                bgcolor: '#4fc3f7',
                                                color: '#000',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                alignSelf: { sm: 'flex-start' },
                                                px: 4,
                                                '&:hover': { bgcolor: '#0288d1', color: '#fff' },
                                            }}
                                        >
                                            {sending ? t('transfers.form.sending') : t('transfers.form.submit')}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </MotionCard>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/transfers')}
                    >
                        {t('transfers.backToTransfers')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default TransferDetailPage;
