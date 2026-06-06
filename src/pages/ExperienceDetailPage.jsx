import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ExploreIcon from '@mui/icons-material/Explore';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import experienceService from '../services/experienceService';
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
};

const emptyInquiry = { name: '', lastname: '', email: '', phone: '' };

const ExperienceDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [experience, setExperience] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [inquiry, setInquiry] = useState(emptyInquiry);
    const [sending, setSending] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);
    const [inquiryError, setInquiryError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await experienceService.getById(id);
                setExperience(data);
            } catch (err) {
                setError(err?.response?.status === 404
                    ? t('experiences.notFound')
                    : t('experiences.error')
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, t]);

    const handleInquiryChange = (e) => {
        const { name, value } = e.target;
        setInquiry(prev => ({ ...prev, [name]: value }));
    };

    const isInquiryValid = () =>
        inquiry.name.trim() && inquiry.lastname.trim() && inquiry.email.trim();

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        if (!isInquiryValid()) return;
        setSending(true);
        setInquiryError(null);
        try {
            await experienceService.createInquiry({
                experience_id: experience.id,
                name: inquiry.name.trim(),
                lastname: inquiry.lastname.trim(),
                email: inquiry.email.trim(),
                phone: inquiry.phone.trim() || undefined,
            });
            setInquirySuccess(true);
            setInquiry(emptyInquiry);
        } catch {
            setInquiryError(t('experiences.inquireError'));
        } finally {
            setSending(false);
        }
    };

    const formatPrice = (price) =>
        price === null || price === undefined
            ? t('experiences.priceOnRequest')
            : `$${Number(price).toLocaleString('en-US')}`;

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
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/experiences')}>
                    {t('experiences.backToExperiences')}
                </Button>
            </Container>
        );
    }

    if (!experience) return null;

    const images = Array.isArray(experience.images) ? experience.images : [];

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
                            {/* Título */}
                            <Typography variant="h4" fontWeight="bold">
                                {experience.title}
                            </Typography>

                            {/* Capacidad y precio */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                {experience.capacity !== null && experience.capacity !== undefined && (
                                    <Chip
                                        icon={<GroupIcon />}
                                        label={t('experiences.capacityPeople', { capacity: experience.capacity })}
                                        sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                    />
                                )}
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#4fc3f7' }}>
                                    {formatPrice(experience.price)}
                                </Typography>
                            </Box>

                            {/* Descripción */}
                            {experience.description && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {t('services.description')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                            {experience.description}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            <Divider />

                            {/* Formulario de consulta */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <ExploreIcon sx={{ color: '#4fc3f7' }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        {t('experiences.inquireTitle')}
                                    </Typography>
                                </Box>

                                {inquirySuccess ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography sx={{ color: '#66bb6a', fontWeight: 600 }}>
                                            {t('experiences.inquireSuccess')}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box
                                        component="form"
                                        onSubmit={handleInquirySubmit}
                                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                            <TextField
                                                label={t('experiences.form.name')}
                                                name="name"
                                                value={inquiry.name}
                                                onChange={handleInquiryChange}
                                                fullWidth
                                                required
                                                sx={fieldSx}
                                            />
                                            <TextField
                                                label={t('experiences.form.lastname')}
                                                name="lastname"
                                                value={inquiry.lastname}
                                                onChange={handleInquiryChange}
                                                fullWidth
                                                required
                                                sx={fieldSx}
                                            />
                                        </Box>
                                        <TextField
                                            label={t('experiences.form.email')}
                                            name="email"
                                            type="email"
                                            value={inquiry.email}
                                            onChange={handleInquiryChange}
                                            fullWidth
                                            required
                                            sx={fieldSx}
                                        />
                                        <TextField
                                            label={t('experiences.form.phone')}
                                            name="phone"
                                            value={inquiry.phone}
                                            onChange={handleInquiryChange}
                                            fullWidth
                                            sx={fieldSx}
                                        />

                                        {inquiryError && (
                                            <Typography variant="body2" sx={{ color: '#ef5350' }}>
                                                {inquiryError}
                                            </Typography>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={sending || !isInquiryValid()}
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
                                            {sending ? t('experiences.form.sending') : t('experiences.form.submit')}
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
                        onClick={() => navigate('/experiences')}
                    >
                        {t('experiences.backToExperiences')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default ExperienceDetailPage;
