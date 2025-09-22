import React, { useState, useCallback, useMemo } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import Slider from "react-slick";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ImagePlaceholder from '../common/ImagePlaceholder';
import "slick-carousel/slick/slick.css"; 
import useImageWithPlaceholder from '../../hooks/useImageWithPlaceholder';

const ImageCarousel = ({ images, height = '250px', width = '100%', aspectRatio = '16/9' }) => {
  const [sliderRef, setSliderRef] = useState(null);
  const { hasImageError, createImageErrorHandler, createImageLoadHandler } = useImageWithPlaceholder();

  const normalizeImageArray = useCallback((images) => {
    if (!images) return [];
    if (typeof images === 'string') return [images];
    if (Array.isArray(images)) {
      if (images.length === 0) return [];
      if (typeof images[0] === 'string') return images;
      if (Array.isArray(images[0])) return images[0];
    }
    return [];
  }, []);

  const imageArray = useMemo(() => normalizeImageArray(images), [images, normalizeImageArray]);

  const settings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    centerMode: true,
    centerPadding: '0px',
    className: 'center',
  }), []);

  const ImageContainer = useCallback(({ children }) => (
    <Box
      sx={{
        height,
        width,
        aspectRatio,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 2,
        mx: 'auto',
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '20px',
        overflow: 'hidden',
        '& .slick-dots': {
          bottom: '16px',
          '& li button:before': {
            color: 'white',
            opacity: 0.5,
            fontSize: '8px',
          },
          '& li.slick-active button:before': {
            color: 'white',
            opacity: 1,
          },
        },
        '& .slick-slide': {
          padding: '0 0px',
        },
      }}
    >
      {children}
    </Box>
  ), [height, width, aspectRatio]);

  const handleButtonClick = useCallback((e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'prev') {
      sliderRef?.slickPrev();
    } else {
      sliderRef?.slickNext();
    }
  }, [sliderRef]);

  if (imageArray.length === 0) {
    return (
      <ImageContainer>
        <ImagePlaceholder
          width="100%"
          height="100%"
          title="Service Gallery"
          subtitle="No images available"
          emoji="🖼️"
          variant="default"
          showPattern={true}
        />
      </ImageContainer>
    );
  }

  if (imageArray.length === 1) {
    const imageId = `carousel-single-${imageArray[0]}`;
    return (
      <ImageContainer>
        {hasImageError(imageId) || !imageArray[0] ? (
          <ImagePlaceholder
            title="Service Image"
            subtitle="Image not available"
            emoji="🖼️"
            variant="default"
            width="100%"
            height="100%"
          />
        ) : (
          <img
            src={imageArray[0]}
            alt="Service"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 65%',
              borderRadius: '16px',
            }}
            onError={createImageErrorHandler(imageId)}
            onLoad={createImageLoadHandler(imageId)}
          />
        )}
      </ImageContainer>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <ImageContainer>
        <Slider ref={setSliderRef} {...settings} style={{ width: '100%', height: '100%' }}>
          {imageArray.map((imagen, indice) => {
            const imageId = `carousel-${indice}-${imagen}`;
            return (
              <div key={indice} style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
              }}>
                {hasImageError(imageId) || !imagen ? (
                  <ImagePlaceholder
                    title={`Image ${indice + 1}`}
                    subtitle="Image not found"
                    emoji="🖼️"
                    variant="default"
                    borderRadius={16}
                    width="100%"
                    height="auto"
                  />
                ) : (
                  <img
                    src={imagen}
                    alt={`Service ${indice + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: '16px',
                    }}
                    onError={createImageErrorHandler(imageId)}
                    onLoad={createImageLoadHandler(imageId)}
                  />
                )}
              </div>
            );
          })}
        </Slider>
      </ImageContainer>
      {imageArray.length > 1 && (
        <>
          <IconButton
            onClick={(e) => handleButtonClick(e, 'prev')}
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={(e) => handleButtonClick(e, 'next')}
            sx={{
              position: 'absolute',
              right: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default React.memo(ImageCarousel);