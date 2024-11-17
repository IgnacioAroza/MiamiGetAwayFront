import React from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

const AboutFounder = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        position: 'relative',
        bgcolor: '#121212',
        overflow: 'hidden',
        py: { xs: 6, md: 12 }
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center'
          }}
        >
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 45%' },
              position: 'relative',
              order: { xs: 1, md: 2 }
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src="https://res.cloudinary.com/dbvpwfh07/image/upload/v1731593600/utils/founder.jpg"
                alt="Facundo, founder of Miami Get Away"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: '400px', md: '720px' },
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />
              <MotionBox
                component="img"
                src="https://res.cloudinary.com/dbvpwfh07/image/upload/v1731593575/utils/signature.png"
                alt="Facundo's signature"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                viewport={{ once: true }}
                sx={{
                  position: 'absolute',
                  bottom: { xs: '-40px', md: '-90px' },
                  right: { xs: '-10px', md: '-20px' },
                  width: { xs: '150px', md: '250px' },
                  height: 'auto',
                  zIndex: 2,
                }}
              />
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 55%' },
              px: { xs: 2, md: 4 },
              order: { xs: 2, md: 1 }
            }}
          >
            <MotionTypography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 4,
                fontWeight: 'bold'
              }}
            >
              {t('aboutFounder.title')}
            </MotionTypography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['paragraph1', 'paragraph2', 'paragraph3', 'paragraph4', 'paragraph5', 'paragraph6'].map((key, index) => (
                <MotionTypography 
                  key={key} 
                  variant="body1" 
                  paragraph
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  {t(`aboutFounder.${key}`)}
                </MotionTypography>
              ))}
            </Box>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutFounder;