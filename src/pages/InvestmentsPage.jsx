import React, { useEffect } from 'react';
import {
    Box, Button, Card, CardContent, CardMedia, Chip,
    CircularProgress, Container, Grid, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    fetchAllInvestments,
    selectAllInvestments,
    selectInvestmentsStatus,
    selectInvestmentsError,
} from '../redux/investmentSlice';

const MotionCard = motion.create(Card);

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const InvestmentsPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const investments = useSelector(selectAllInvestments);
    const status = useSelector(selectInvestmentsStatus);
    const error = useSelector(selectInvestmentsError);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchAllInvestments());
    }, [dispatch, status]);

    const handleInquire = (inv) => {
        const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
        const unitPart = inv.unit_number ? ` — ${t('investments.unit')} ${inv.unit_number}` : '';
        const message = t('investments.whatsappMessage', {
            name: inv.name,
            unit: unitPart,
            address: inv.address,
        });
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatPrice = (price) =>
        price === null || price === undefined
            ? t('investments.priceOnRequest')
            : `$${Number(price).toLocaleString('en-US')}`;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0e0e0e', pb: 8 }}>
            {/* Hero */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                    px: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#6c5dd3' }} />
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#fff', fontSize: { xs: '2rem', md: '3rem' } }}
                    >
                        {t('investments.title')}
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                    {t('investments.subtitle')}
                </Typography>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                {status === 'loading' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress sx={{ color: '#6c5dd3' }} />
                    </Box>
                )}

                {status === 'failed' && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography sx={{ color: '#ef5350' }}>{error || t('investments.error')}</Typography>
                    </Box>
                )}

                {status === 'succeeded' && investments.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <TrendingUpIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
                        <Typography sx={{ color: '#666' }}>{t('investments.noInvestments')}</Typography>
                    </Box>
                )}

                {status === 'succeeded' && investments.length > 0 && (
                    <Grid container spacing={3}>
                        {investments.map((inv, i) => (
                            <Grid item xs={12} sm={6} md={4} key={inv.id}>
                                <MotionCard
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    onClick={() => navigate(`/investments/${inv.id}`)}
                                    sx={{
                                        bgcolor: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s, transform 0.2s',
                                        '&:hover': {
                                            borderColor: '#6c5dd3',
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    {inv.images?.[0] ? (
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={inv.images[0]}
                                            alt={inv.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                height: 220,
                                                bgcolor: '#252525',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <TrendingUpIcon sx={{ fontSize: 48, color: '#333' }} />
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>
                                                {inv.name}
                                            </Typography>
                                            {inv.unit_number && (
                                                <Typography variant="body2" sx={{ color: '#7c5cbf', fontWeight: 500 }}>
                                                    {t('investments.unit')} {inv.unit_number}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                            <LocationOnIcon sx={{ fontSize: 16, color: '#666', mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#888', lineHeight: 1.4 }}>
                                                {inv.address}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={<BedOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${inv.rooms} ${t('investments.rooms')}`}
                                                size="small"
                                                sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                            />
                                            <Chip
                                                icon={<BathtubOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${inv.bathrooms} ${t('investments.bathrooms')}`}
                                                size="small"
                                                sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                            />
                                        </Box>

                                        {inv.description && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#777',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {inv.description}
                                            </Typography>
                                        )}

                                        <Typography variant="h6" sx={{ color: '#6c5dd3', fontWeight: 700, mt: 'auto', pt: 1 }}>
                                            {formatPrice(inv.price)}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                fullWidth
                                                startIcon={<WhatsAppIcon />}
                                                onClick={(e) => { e.stopPropagation(); handleInquire(inv); }}
                                                sx={{
                                                    bgcolor: '#25D366',
                                                    color: '#fff',
                                                    '&:hover': { bgcolor: '#1da851' },
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {t('investments.inquire')}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default InvestmentsPage;
