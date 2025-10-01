import React from 'react';
import { Box, Skeleton } from '@mui/material';
import useLazyImage from '../../hooks/useLazyImage';
import ImagePlaceholder from './ImagePlaceholder';

/**
 * Componente de imagen con lazy loading
 * @param {Object} props - Propiedades del componente
 * @param {string} props.src - URL de la imagen
 * @param {string} props.alt - Texto alternativo
 * @param {Object} props.style - Estilos CSS
 * @param {Function} props.onLoad - Callback cuando la imagen se carga
 * @param {Function} props.onError - Callback cuando hay error
 * @param {string} props.placeholderTitle - Título del placeholder
 * @param {string} props.placeholderSubtitle - Subtítulo del placeholder
 * @param {boolean} props.showSkeleton - Mostrar skeleton loader
 * @param {boolean} props.isPreloaded - Si la imagen ya está precargada
 * @returns {JSX.Element}
 */
const LazyImage = ({
  src,
  alt = 'Image',
  style = {},
  onLoad,
  onError,
  placeholderTitle = 'Loading Image',
  placeholderSubtitle = 'Please wait...',
  showSkeleton = true,
  isPreloaded = false,
  ...props
}) => {
  const {
    imgRef,
    imageSrc,
    isLoaded,
    isInView,
    hasError,
    handleLoad,
    handleError
  } = useLazyImage(src, {
    // Si está precargada, cargar inmediatamente
    rootMargin: isPreloaded ? '0px' : '50px'
  });

  const handleImageLoad = () => {
    handleLoad();
    onLoad && onLoad();
  };

  const handleImageError = () => {
    handleError();
    onError && onError();
  };

  // Si hay error, mostrar placeholder
  if (hasError) {
    return (
      <ImagePlaceholder
        title="Image Error"
        subtitle="Failed to load image"
        emoji="⚠️"
        variant="default"
        width={style.width || '100%'}
        height={style.height || '100%'}
      />
    );
  }

  return (
    <Box
      ref={imgRef}
      sx={{
        width: style.width || '100%',
        height: style.height || '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: style.borderRadius || 0,
      }}
    >
      {/* Skeleton loader mientras carga */}
      {showSkeleton && !isLoaded && isInView && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: style.borderRadius || 0,
          }}
        />
      )}

      {/* Placeholder mientras no está en vista */}
      {!isInView && (
        <ImagePlaceholder
          title={placeholderTitle}
          subtitle={placeholderSubtitle}
          emoji="🖼️"
          variant="default"
          width="100%"
          height="100%"
        />
      )}

      {/* Imagen real */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          style={{
            ...style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      )}
    </Box>
  );
};

export default LazyImage;