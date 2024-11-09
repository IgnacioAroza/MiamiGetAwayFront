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
  TextField,
  Rating,
  CircularProgress,
  Container,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { fetchReviews, createReview } from '../redux/reviewSlice';

const AUTOPLAY_DELAY = 5000;

const ReviewsManager = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.items);
  const status = useSelector(state => state.reviews.status);
  const error = useSelector(state => state.reviews.error);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentPage, setCurrentPage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [newReview, setNewReview] = useState({
    name: '',
    comment: ''
  });

  const reviewsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const getVisibleReviews = useCallback(() => {
    const start = currentPage * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [currentPage, reviewsPerPage, reviews]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchReviews());
    }
  }, [status, dispatch]);

  useEffect(() => {
    let timer;
    if (autoplay && reviews.length > reviewsPerPage) {
      timer = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, AUTOPLAY_DELAY);
    }
    return () => clearInterval(timer);
  }, [autoplay, totalPages, reviews.length, reviewsPerPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setAutoplay(false);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setAutoplay(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (_, newValue) => {
    setNewReview(prev => ({ ...prev, rating: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createReview(newReview)).unwrap();
      setNewReview({ name: '', lastName: '', rating: 0, comment: '' });
    } catch (err) {
      console.error('Failed to create review:', err);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Typography color="error" align="center">
        {t('errors.fetchingReviews')}: {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              color: 'primary.light',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: '700',
              fontFamily: 'Nanum Myeongjo',
              fontStyle: 'italic'
            }}
          >
            {t('reviews.yourStay')}
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Typography 
            variant="h3" 
            component="h3" 
            sx={{ 
              color: 'primary.light',
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'light',
              fontFamily: 'Nanum Myeongjo',
              fontStyle: 'italic',
              mt: 2
            }}
          >
            {t('reviews.yourStory')}
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ position: 'relative', mb: 8, overflow: 'visible' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Grid2 
              container 
              spacing={3} 
              sx={{ 
                display: 'flex', 
                flexWrap: 'nowrap', 
                overflowX: 'visible',
                width: '100%'
              }}
            >
              {getVisibleReviews().map((review) => (
                <Grid2 
                  item 
                  xs={12} 
                  sm={isMobile ? 12 : 6} 
                  md={isMobile ? 12 : 4} 
                  key={review.id}
                  sx={{ 
                    flexShrink: 0, 
                    width: isMobile ? '100%' : { sm: '50%', md: '33.333%' } 
                  }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      minHeight: '200px'
                    }}
                  >
                    <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'text.secondary',
                          mb: 3,
                          fontStyle: 'italic'
                        }}
                      >
                        {review.comment}
                      </Typography>
                      <Typography 
                        variant="text" 
                        sx={{ 
                          color: 'primary.light',
                          fontWeight: '800',
                          fontSize: '1.3rem',
                          fontFamily: 'Nanum Myeongjo',
                          fontStyle: 'italic',
                          position: 'absolute',
                          left: '70%',
                          bottom: '5%'
                        }}
                      >
                        {capitalizeFirstLetter(review.name)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </motion.div>
        </AnimatePresence>

        <IconButton
          onClick={handlePrevPage}
          sx={{
            position: 'absolute',
            left: { xs: 0, md: -60 },
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'primary.light',
          }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={handleNextPage}
          sx={{
            position: 'absolute',
            right: { xs: 0, md: -100 },
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'primary.light',
          }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {[...Array(totalPages)].map((_, index) => (
            <Box
              key={index}
              component="button"
              onClick={() => {
                setCurrentPage(index);
                setAutoplay(false);
              }}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: index === currentPage ? 'primary.light' : 'primary.dark',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.main'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Paper 
        sx={{ 
          maxWidth: 'md', 
          mx: 'auto', 
          mt: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h3" gutterBottom color="primary.light">
            {t('reviews.addReview')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('reviews.firstName')}
                  name="name"
                  value={newReview.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid2>
              <Grid2 item xs={12} sx={{ width: '30vw' }}>
                <TextField
                  fullWidth
                  label={t('reviews.comment')}
                  name="comment"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={1}
                />
              </Grid2>
              <Grid2 item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{
                    mt: 2,
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main'
                    }
                  }}
                >
                  {t('reviews.submitReview')}
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default ReviewsManager;