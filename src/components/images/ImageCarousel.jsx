import React from 'react';
import { Box } from '@mui/material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ImageCarousel = ({ images, height = '250px', width = '100%', objectPosition }) => {
  const normalizeImageArray = (images) => {
    if (!images) return [];
    if (typeof images === 'string') return [images];
    if (Array.isArray(images)) {
      if (images.length === 0) return [];
      if (typeof images[0] === 'string') return images;
      if (Array.isArray(images[0])) return images[0];
    }
    return [];
  };

  const imageArray = normalizeImageArray(images);

  const ImageContainer = ({ children }) => (
    <Box
      sx={{
        height,
        width,
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
  );

  if (imageArray.length === 0) {
    return (
      <ImageContainer>
        <img 
          src="https://via.placeholder.com/200?text=No+Image+Available"
          alt="No Image Available"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 65%',
            borderRadius: '16px',
          }}
        />
      </ImageContainer>
    );
  }

  if (imageArray.length === 1) {
    return (
      <ImageContainer>
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
          }}
        />
      </ImageContainer>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    centerMode: true,
    centerPadding: '0px',
    className: 'center',
  };

  return (
    <ImageContainer>
      <Slider {...settings} style={{ width: '100%', height: '100%' }}>
        {imageArray.map((imagen, indice) => (
          <div key={indice} style={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
          }}>
            <img 
              src={imagen} 
              alt={`Servicio ${indice + 1}`} 
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                objectPosition,
                borderRadius: '16px',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200?text=Imagen+no+encontrada';
              }}
            />
          </div>
        ))}
      </Slider>
    </ImageContainer>
  );
};

export default ImageCarousel;