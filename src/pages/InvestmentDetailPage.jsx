import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Grid2, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import investmentService from '../services/investmentService';
import ImageCarousel from '../components/images/ImageCarousel';

const MotionCard = motion.create(Card);

const InvestmentDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [investment, setInvestment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await investmentService.getById(id);
                setInvestment(data);
            } catch (err) {
                setError(err?.response?.status === 404
                    ? t('investments.notFound')
                    : t('investments.error')
                );
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, t]);

    const handleInquire = () => {
        const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
        const unitPart = investment.unit_number ? ` — ${t('investments.unit')} ${investment.unit_number}` : '';
        const message = t('investments.whatsappMessage', {
            name: investment.name,
            unit: unitPart,
            address: investment.address,
        });
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatPrice = (price) =>
        price === null || price === undefined
            ? t('investments.priceOnRequest')
            : `$${Number(price).toLocaleString('en-US')}`;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#6c5dd3' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="error" gutterBottom>{error}</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/investments')}>
                    {t('investments.backToInvestments')}
                </Button>
            </Container>
        );
    }

    if (!investment) return null;

    const images = Array.isArray(investment.images) ? investment.images : [];

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
                            {/* Nombre y unidad */}
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    {investment.name}
                                </Typography>
                                {investment.unit_number && (
                                    <Typography variant="subtitle1" sx={{ color: '#7c5cbf', fontWeight: 500 }}>
                                        {t('investments.unit')} {investment.unit_number}
                                    </Typography>
                                )}
                            </Box>

                            {/* Dirección y características */}
                            <Grid2 container spacing={2} alignItems="center">
                                <Grid2 size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOnIcon />
                                        <Typography variant="body1">{investment.address}</Typography>
                                    </Box>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BedOutlinedIcon />
                                        <Typography variant="body1">
                                            {investment.rooms} {t('investments.rooms')}
                                        </Typography>
                                    </Box>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BathtubOutlinedIcon />
                                        <Typography variant="body1">
                                            {investment.bathrooms} {t('investments.bathrooms')}
                                        </Typography>
                                    </Box>
                                </Grid2>
                            </Grid2>

                            <Divider />

                            {/* Descripción */}
                            {investment.description && (
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {t('services.description')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        {investment.description}
                                    </Typography>
                                </Box>
                            )}

                            {/* Precio y CTA */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#6c5dd3' }}>
                                    {formatPrice(investment.price)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<WhatsAppIcon />}
                                    onClick={handleInquire}
                                    sx={{
                                        bgcolor: '#25D366',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#1da851' },
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                    }}
                                >
                                    {t('investments.inquire')}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </MotionCard>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/investments')}
                    >
                        {t('investments.backToInvestments')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default InvestmentDetailPage;
