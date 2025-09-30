import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Grid2, 
  Paper, 
  Typography, 
  Card,
  CardContent,
  Button,
  CircularProgress,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Rating,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import { 
  fetchGoogleReviews, 
  loadMoreGoogleReviews,
  selectGoogleReviews,
  selectGoogleReviewsStatus,
  selectGoogleReviewsError,
  selectGoogleReviewsPagination,
  selectLoadMoreStatus
} from '../../../redux/googleReviewSlice';
import googleReviewService from '../../../services/googleReviewService';

const AUTOPLAY_DELAY = 5000;

// Componente Avatar mejorado que maneja errores de imagen
const ReviewerAvatar = ({ src, alt, name, size = 50 }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Intentar diferentes métodos para cargar la imagen
  const tryAlternativeImageSources = useCallback((originalSrc) => {
    if (!originalSrc) return null;
    
    // Lista de métodos alternativos para cargar imágenes de Google
    const alternatives = [
      originalSrc, // Original
      originalSrc.replace('=s120-c-rp-mo-br100', '=s64-c'), // Tamaño más pequeño
      originalSrc.replace('=s120-c-rp-mo-br100', '=s40-c'), // Aún más pequeño
      // Opción de proxy (descomenta si implementas el backend proxy)
      // `/api/proxy-image?url=${encodeURIComponent(originalSrc)}`,
    ];
    
    return alternatives;
  }, []);

  const handleImageError = () => {
    const alternatives = tryAlternativeImageSources(src);
    const currentIndex = alternatives?.indexOf(currentSrc) || 0;
    
    if (alternatives && currentIndex < alternatives.length - 1) {
      // Intentar con la siguiente alternativa
      setCurrentSrc(alternatives[currentIndex + 1]);
      setImageLoading(true);
    } else {
      // No hay más alternativas, mostrar fallback
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Reset cuando cambia el src prop
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setImageError(false);
      setImageLoading(true);
    }
  }, [src, currentSrc]);

  // Generar un color de fondo basado en el nombre
  const getAvatarColor = (name) => {
    if (!name) return '#9e9e9e';
    
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (imageError || !src) {
    return (
      <Avatar 
        sx={{ 
          width: size, 
          height: size,
          bgcolor: getAvatarColor(name),
          color: 'white',
          fontWeight: 'bold',
          fontSize: size / 2.5
        }}
      >
        {name?.charAt(0)?.toUpperCase() || <PersonIcon />}
      </Avatar>
    );
  }

  return (
    <Box position="relative">
      <Avatar 
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sx={{ 
          width: size, 
          height: size,
          bgcolor: imageLoading ? '#f5f5f5' : 'transparent'
        }}
        // Agregar propiedades para mejorar la carga de imágenes externas
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      >
        {imageLoading ? (
          <CircularProgress size={size / 2} />
        ) : (
          name?.charAt(0)?.toUpperCase() || <PersonIcon />
        )}
      </Avatar>
    </Box>
  );
};

const GoogleReviewsManager = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Selectores para Google Reviews
  const reviews = useSelector(selectGoogleReviews);
  const status = useSelector(selectGoogleReviewsStatus);
  const error = useSelector(selectGoogleReviewsError);
  const pagination = useSelector(selectGoogleReviewsPagination);
  const loadMoreStatus = useSelector(selectLoadMoreStatus);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentPage, setCurrentPage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const reviewsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const getVisibleReviews = useCallback(() => {
    const start = currentPage * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [currentPage, reviewsPerPage, reviews]);

  // Cargar reviews iniciales
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchGoogleReviews({ limit: 50, offset: 0 }));
    }
  }, [status, dispatch]);

  // Autoplay para el carousel
  useEffect(() => {
    if (autoplay && reviews.length > reviewsPerPage) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, AUTOPLAY_DELAY);
      return () => clearInterval(interval);
    }
  }, [autoplay, totalPages, reviews.length, reviewsPerPage]);

  const handlePrevPage = () => {
    setAutoplay(false);
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setAutoplay(false);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Truncar texto largo
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Manejar redirección a Google Maps
  const handleAddReview = () => {
    googleReviewService.redirectToGoogleReview();
  };

  // Cargar más reviews
  const handleLoadMore = () => {
    if (pagination.hasMore && loadMoreStatus !== 'loading') {
      dispatch(loadMoreGoogleReviews({
        limit: 50,
        offset: pagination.offset
      }));
    }
  };

  // Estados de carga
  if (status === 'loading' && reviews.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (status === 'failed') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography color="error" align="center" variant="h6">
          {t('errors.fetchingReviews')}: {error}
        </Typography>
      </Container>
    );
  }

  if (reviews.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {t('reviews.title')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t('reviews.noReviewsYet')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleAddReview}
            startIcon={<OpenInNewIcon />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            {t('reviews.writeReviewOnGoogle')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header con título y botón para agregar review */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('reviews.title')}
        </Typography>
        {/* <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {t('reviews.fromGoogleBusiness')}
        </Typography> */}
        
        {/* Estadísticas
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
          <Chip 
            icon={<StarIcon />} 
            label={`${pagination.total} ${t('reviews.totalReviews')}`}
            color="primary"
            variant="outlined"
          />
        </Box> */}

        <Button
          variant="contained"
          size="large"
          onClick={handleAddReview}
          startIcon={<OpenInNewIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          {t('reviews.writeReviewOnGoogle')}
        </Button>
      </Box>

      {/* Carousel de Reviews */}
      <Box position="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Grid2 container spacing={3}>
              {getVisibleReviews().map((review) => (
                <Grid2 
                  xs={12} 
                  sm={12} 
                  md={4} 
                  key={review.id}
                  size={{ 
                    xs: 12, 
                    sm: 12, 
                    md: reviewsPerPage === 1 ? 12 : 4 
                  }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      background: 'linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%)',
                      color: 'white',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, 
                          ${theme.palette.warning.main} 0%, 
                          ${theme.palette.warning.light} 100%)`,
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        borderColor: 'primary.light',
                        '&::before': {
                          transform: 'scaleX(1)'
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      {/* Header con avatar y rating */}
                      <Box display="flex" alignItems="flex-start" mb={2}>
                        <ReviewerAvatar 
                          src={review.reviewer_photo_url}
                          alt={review.reviewer_name}
                          name={review.reviewer_name}
                          size={45}
                        />
                        <Box flexGrow={1} ml={1.5}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="600"
                            sx={{ 
                              mb: 0.25,
                              color: 'white',
                              fontSize: '1rem'
                            }}
                          >
                            {review.reviewer_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Rating 
                              value={review.rating} 
                              readOnly 
                              size="small"
                              precision={0.5}
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#ffa726',
                                },
                                '& .MuiRating-iconEmpty': {
                                  color: '#424242',
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color="rgba(255, 255, 255, 0.7)"
                              sx={{ fontWeight: 500 }}
                            >
                              {review.rating}/5
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="rgba(255, 255, 255, 0.6)"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {formatDate(review.google_create_time)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Comentario */}
                      <Box mb={2}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.5,
                            fontStyle: 'italic',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.85rem'
                          }}
                        >
                          &ldquo;{truncateText(review.comment, 120)}&rdquo;
                        </Typography>
                      </Box>

                      {/* Indicador de Google */}
                      <Box 
                        display="flex" 
                        justifyContent="flex-end" 
                        alignItems="center" 
                        mt={1.5}
                        pt={1.5}
                        borderTop="1px solid"
                        borderColor="rgba(255, 255, 255, 0.1)"
                      >
                        <Tooltip title="Reseña de Google Business" arrow>
                          <Chip
                            label="Google"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              bgcolor: '#4285f4',
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-label': {
                                px: 0.75
                              }
                            }}
                          />
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </motion.div>
        </AnimatePresence>

        {/* Controles de navegación */}
        {totalPages > 1 && (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            mt={4}
            gap={3}
          >
            <IconButton 
              onClick={handlePrevPage}
              disabled={totalPages <= 1}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                width: 48,
                height: 48,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.1)'
                },
                '&:disabled': { 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 28 }} />
            </IconButton>

            <Box 
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                px: 3,
                py: 1,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {currentPage + 1} / {totalPages}
              </Typography>
            </Box>

            <IconButton 
              onClick={handleNextPage}
              disabled={totalPages <= 1}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                width: 48,
                height: 48,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.1)'
                },
                '&:disabled': { 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Botón para cargar más reviews */}
      {pagination.hasMore && (
        <Box textAlign="center" mt={4}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadMoreStatus === 'loading'}
            startIcon={loadMoreStatus === 'loading' ? <CircularProgress size={20} /> : null}
          >
            {loadMoreStatus === 'loading' 
              ? t('reviews.loading') 
              : t('reviews.loadMore')
            }
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default GoogleReviewsManager;