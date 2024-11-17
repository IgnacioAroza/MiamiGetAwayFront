import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import WhatsAppIcon from '../components/WhatsAppIcon';

import Services from './Services';
import About from './About';
import Reviews from '../components/ReviewsManager';
import AboutFounder from '../components/about/AboutFounder';
import ContactForm from '../components/form/ContactForm';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
        setTimeout(() => setIsLogoVisible(true), 500)
      })
    }
  }, []);

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 2 } },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 1.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      } 
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { 
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <motion.div
        initial="hidden"
        animate={isVideoLoaded  ? "visible" : "hidden"}
        variants={backgroundVariants} 
      >
      <Box
        sx={{
          height: { xs: '100vh', sm: '100vh', md: '100vh' },
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload='auto'
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
          }}
        >
          <source src="https://res.cloudinary.com/dbvpwfh07/video/upload/v1731679497/utils/finalVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
       <AnimatePresence>
          {isLogoVisible && (
            <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={logoVariants}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
            }}
            >
              <Container 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Box 
                  component='img'
                  src='https://res.cloudinary.com/dbvpwfh07/image/upload/v1731678802/utils/whiteLogo.png'
                  alt='Miami Get Away Logo'
                  sx={{
                    maxWidth: '500px',
                    width: '100%',
                  }}
                />
              </Container>
          </motion.div>
          )}
        </AnimatePresence>
      </Box>
      </motion.div>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container maxWidth="xl" sx={{ mt: -10 }}>
          <Services />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#121212',
      }}>
        <Container maxWidth="lg" sx={{ mt: -10 }}>
          <About />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container sx={{ mt: -10 }}>
          <Reviews />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#121212',
      }}>
        <Container maxWidth="xl">
          <AboutFounder />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container sx={{ mt: -10 }}>
          <ContactForm />
        </Container>
      </Box>

      <WhatsAppIcon />
    </Box>
  );
};

export default Home;