import React, { useEffect } from 'react';
import {
    Box, Button, Card, CardContent, CardMedia, Chip,
    CircularProgress, Container, Grid, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import {
    fetchAllVehicles,
    selectAllVehicles,
    selectVehiclesLoading,
    selectVehiclesError,
} from '../redux/transferVehicleSlice';

const MotionCard = motion.create(Card);

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const TransfersPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const vehicles = useSelector(selectAllVehicles);
    const loading = useSelector(selectVehiclesLoading);
    const error = useSelector(selectVehiclesError);

    useEffect(() => {
        dispatch(fetchAllVehicles());
    }, [dispatch]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0e0e0e', pb: 8 }}>
            {/* Hero */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                    px: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <DirectionsCarIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#fff', fontSize: { xs: '2rem', md: '3rem' } }}
                    >
                        {t('transfers.title')}
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                    {t('transfers.subtitle')}
                </Typography>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress sx={{ color: '#4fc3f7' }} />
                    </Box>
                )}

                {!loading && error && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography sx={{ color: '#ef5350' }}>{error || t('transfers.error')}</Typography>
                    </Box>
                )}

                {!loading && !error && vehicles.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <DirectionsCarIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
                        <Typography sx={{ color: '#666' }}>{t('transfers.noVehicles')}</Typography>
                    </Box>
                )}

                {!loading && !error && vehicles.length > 0 && (
                    <Grid container spacing={3}>
                        {vehicles.map((vehicle, i) => (
                            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                                <MotionCard
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    onClick={() => navigate(`/transfers/${vehicle.id}`)}
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
                                            borderColor: '#4fc3f7',
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    {vehicle.images?.[0] ? (
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={vehicle.images[0]}
                                            alt={vehicle.name}
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
                                            <DirectionsCarIcon sx={{ fontSize: 48, color: '#333' }} />
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>
                                                {vehicle.name}
                                            </Typography>
                                            <Chip
                                                label={t(`transfers.category.${vehicle.category}`)}
                                                size="small"
                                                sx={{ bgcolor: '#1e3a5f', color: '#4fc3f7', border: '1px solid #1e3a5f', ml: 1, flexShrink: 0 }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={<PersonIcon sx={{ fontSize: '16px !important' }} />}
                                                label={t('transfers.passengers', { count: vehicle.capacity })}
                                                size="small"
                                                sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                            />
                                            <Chip
                                                icon={<LuggageIcon sx={{ fontSize: '16px !important' }} />}
                                                label={t('transfers.luggage', { count: vehicle.luggage_capacity })}
                                                size="small"
                                                sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                            />
                                        </Box>

                                        {vehicle.description && (
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
                                                {vehicle.description}
                                            </Typography>
                                        )}

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: 'auto',
                                                borderColor: '#4fc3f7',
                                                color: '#4fc3f7',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { borderColor: '#0288d1', color: '#0288d1' },
                                            }}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/transfers/${vehicle.id}`); }}
                                        >
                                            {t('transfers.viewDetails')}
                                        </Button>
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

export default TransfersPage;
