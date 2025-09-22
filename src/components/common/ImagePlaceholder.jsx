import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente de placeholder mejorado para imágenes
 * Basado en el diseño del ReservationDetails pero reutilizable
 */
const ImagePlaceholder = ({ 
    width = '100%',
    height = 200,
    title = 'Service',
    subtitle = 'No image available',
    emoji = '🖼️',
    variant = 'default', // 'default', 'compact', 'apartment'
    showPattern = true,
    borderRadius = 1,
    isDarkMode = false
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'compact':
                return {
                    container: {
                        width,
                        height,
                        bgcolor: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                        border: isDarkMode ? '2px dashed #555' : '2px dashed #ddd',
                        borderRadius,
                    },
                    content: {
                        p: 1,
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                    },
                    emoji: {
                        fontSize: '1.5rem',
                        mb: 0.5
                    },
                    title: {
                        variant: 'caption',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    },
                    subtitle: {
                        variant: 'caption',
                        fontSize: '0.625rem'
                    }
                };
            
            case 'apartment':
                return {
                    container: {
                        width,
                        height,
                        bgcolor: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                        border: isDarkMode ? '2px dashed #555' : '1px solid #e0e0e0',
                        borderRadius,
                    },
                    content: {
                        p: 2,
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    },
                    emoji: {
                        fontSize: '2.5rem',
                        mb: 1
                    },
                    title: {
                        variant: 'subtitle1',
                        fontWeight: 600
                    },
                    subtitle: {
                        variant: 'body2'
                    }
                };
            
            default: // 'default'
                return {
                    container: {
                        width,
                        height,
                        bgcolor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                        border: isDarkMode ? '2px dashed #444' : '1px solid #e0e0e0',
                        borderRadius,
                    },
                    content: {
                        p: 2,
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    },
                    emoji: {
                        fontSize: '3rem',
                        mb: 1
                    },
                    title: {
                        variant: 'subtitle1',
                        fontWeight: 600
                    },
                    subtitle: {
                        variant: 'body2'
                    }
                };
        }
    };

    const styles = getVariantStyles();

    // Patrón de fondo SVG
    const backgroundPattern = showPattern ? {
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='placeholderPattern' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(2) rotate(0)'%3e%3crect x='0' y='0' width='100%25' height='100%25' fill='${isDarkMode ? '%233a3a3a' : '%23f5f5f5'}'/%3e%3cpath d='m0 10h20v10h-20z' fill='${isDarkMode ? '%23444' : '%23eeeeee'}' fill-opacity='0.4'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23placeholderPattern)'/%3e%3c/svg%3e")`
    } : {};

    return (
        <Box
            sx={{
                ...styles.container,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                ...backgroundPattern
            }}
        >
            <Box 
                sx={{
                    ...styles.content,
                    textAlign: 'center'
                }}
            >
                <Typography 
                    sx={{ 
                        ...styles.emoji,
                        opacity: 0.7,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {emoji}
                </Typography>
                
                <Typography
                    {...styles.title}
                    color={isDarkMode ? '#fff' : 'text.primary'}
                    sx={{
                        ...styles.title.sx,
                        maxWidth: variant === 'compact' ? '60px' : '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: variant === 'compact' ? 0 : 0.5
                    }}
                >
                    {title}
                </Typography>
                
                {variant !== 'compact' && (
                    <Typography
                        {...styles.subtitle}
                        color={isDarkMode ? '#aaa' : 'text.secondary'}
                        sx={{ 
                            ...styles.subtitle.sx,
                            opacity: 0.8
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default ImagePlaceholder;