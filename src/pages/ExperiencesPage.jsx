import React, { useEffect } from 'react';
import {
    Box, Button, Card, CardContent, CardMedia, Chip,
    CircularProgress, Container, Grid, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExploreIcon from '@mui/icons-material/Explore';
import GroupIcon from '@mui/icons-material/Group';
import {
    fetchAllExperiences,
    selectAllExperiences,
    selectExperiencesStatus,
    selectExperiencesError,
} from '../redux/experienceSlice';

const MotionCard = motion.create(Card);

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const ExperiencesPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const experiences = useSelector(selectAllExperiences);
    const status = useSelector(selectExperiencesStatus);
    const error = useSelector(selectExperiencesError);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchAllExperiences());
    }, [dispatch, status]);

    const formatPrice = (price) =>
        price === null || price === undefined
            ? t('experiences.priceOnRequest')
            : `$${Number(price).toLocaleString('en-US')}`;

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
                    <ExploreIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#fff', fontSize: { xs: '2rem', md: '3rem' } }}
                    >
                        {t('experiences.title')}
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                    {t('experiences.subtitle')}
                </Typography>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                {status === 'loading' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress sx={{ color: '#4fc3f7' }} />
                    </Box>
                )}

                {status === 'failed' && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography sx={{ color: '#ef5350' }}>{error || t('experiences.error')}</Typography>
                    </Box>
                )}

                {status === 'succeeded' && experiences.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <ExploreIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
                        <Typography sx={{ color: '#666' }}>{t('experiences.noExperiences')}</Typography>
                    </Box>
                )}

                {status === 'succeeded' && experiences.length > 0 && (
                    <Grid container spacing={3}>
                        {experiences.map((exp, i) => (
                            <Grid item xs={12} sm={6} md={4} key={exp.id}>
                                <MotionCard
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    onClick={() => navigate(`/experiences/${exp.id}`)}
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
                                    {exp.images?.[0] ? (
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={exp.images[0]}
                                            alt={exp.title}
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
                                            <ExploreIcon sx={{ fontSize: 48, color: '#333' }} />
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>
                                            {exp.title}
                                        </Typography>

                                        {exp.capacity !== null && exp.capacity !== undefined && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    icon={<GroupIcon sx={{ fontSize: '16px !important' }} />}
                                                    label={t('experiences.capacityPeople', { capacity: exp.capacity })}
                                                    size="small"
                                                    sx={{ bgcolor: '#252525', color: '#ccc', border: '1px solid #333' }}
                                                />
                                            </Box>
                                        )}

                                        {exp.description && (
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
                                                {exp.description}
                                            </Typography>
                                        )}

                                        <Typography variant="h6" sx={{ color: '#4fc3f7', fontWeight: 700, mt: 'auto', pt: 1 }}>
                                            {formatPrice(exp.price)}
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{
                                                borderColor: '#4fc3f7',
                                                color: '#4fc3f7',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { borderColor: '#0288d1', color: '#0288d1' },
                                            }}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/experiences/${exp.id}`); }}
                                        >
                                            {t('experiences.viewDetails')}
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

export default ExperiencesPage;
