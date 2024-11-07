import React, { useState, useEffect } from 'react';
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
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { fetchReviews, createReview } from '../redux/reviewSlice';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionCard = motion.create(Card);
const MotionPaper = motion.create(Paper);

const AnimatedText = ({ children, variant, component, sx, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <MotionTypography
      ref={ref}
      variant={variant}
      component={component}
      sx={sx}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
        hidden: { opacity: 0, y: 20 }
      }}
    >
      {children}
    </MotionTypography>
  );
};

const ReviewsManager = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.items) || [];
  const status = useSelector(state => state.reviews.status);
  const error = useSelector(state => state.reviews.error);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [newReview, setNewReview] = useState({
    name: '',
    lastName: '',
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchReviews());
    }
  }, [status, dispatch]);

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
      dispatch(fetchReviews());
    } catch (err) {
      console.error('Failed to create review:', err);
    }
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
    <MotionBox
      sx={{ flexGrow: 1, p: 3, mt: 10 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedText
        variant={isMobile ? "h5" : "h4"}
        component="h2"
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, sm: 4, md: 5 },
        }}
      >
        {t('reviews.title')}
      </AnimatedText>
      <MotionBox
        sx={{ mb: 4 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid2 container spacing={2}>
          {Array.isArray(reviews) && reviews.map((review, index) => (
            <Grid2 item xs={12} sm={6} md={4} key={review?.id || index}>
              <MotionCard
                sx={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {(review?.name?.[0]  || '?').toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">
                      {`${review?.name || t('reviews.anonymous')} ${review?.lastname || ''}`}
                    </Typography>
                  </Box>
                  <Rating value={Number(review.rating) || 0} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {review.comment || t('reviews.noComment')}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid2>
          ))}
        </Grid2>
      </MotionBox>
      <MotionPaper
        sx={{ p: 2, mt: 4 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <AnimatedText variant="h6" component="h3" gutterBottom delay={0.5}>
          {t('reviews.addReview')}
        </AnimatedText>
        <form onSubmit={handleSubmit}>
          <Grid2 container spacing={2}>
            <Grid2 item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                margin="normal"
                label={t('reviews.firstName')}
                name="name"
                value={newReview.name}
                onChange={handleInputChange}
                required
              />
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                margin="normal"
                label={t('reviews.lastName')}
                name="lastName"
                value={newReview.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <Box sx={{ mt: 2 }}>
                <Typography component="legend">{t('reviews.rating')}</Typography>
                <Rating
                  name="rating"
                  value={newReview.rating}
                  onChange={handleRatingChange}
                />
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label={t('reviews.comment')}
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ mt: 3, height: '56px' }}
                fullWidth
              >
                {t('reviews.submitReview')}
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </MotionPaper>
    </MotionBox>
  );
};

export default ReviewsManager;