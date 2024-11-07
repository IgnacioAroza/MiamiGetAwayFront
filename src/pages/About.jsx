import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Container, Box, useMediaQuery, useTheme } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MotionTypography = motion.create(Typography);

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

const About = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Box textAlign="center" mb={4}>
      <AnimatedText
          variant={isMobile ? "h5" : "h4"}
          component="h2"
          sx={{ 
            color: 'white', 
            textAlign: 'center', 
            mb: { xs: 3, sm: 4, md: 5 },
          }}
        >
          {t('about.title')}
        </AnimatedText>
      </Box>
      <AnimatedText variant="body1" component="p" sx={{ mb: 2 }} delay={0.2}>
       {t('about.description')}
      </AnimatedText>
      <AnimatedText variant="body1" component="p" delay={0.4}>
        {t('about.mission')}
      </AnimatedText>
    </Container>
  );
};

export default About;